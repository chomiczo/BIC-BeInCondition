// plik: App.jsx
import { useState, useEffect } from 'react';
import { calculateBMR, calculateTDEE, calculateFinalGoal } from './calculator';
import Scanner from './Scanner';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ProfileView from './ProfileView';
import DiaryView from './DiaryView';

window.globalAiModel = null;

function App() {
  const [activeTab, setActiveTab] = useState('diary');
  const [isScanning, setIsScanning] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [mealItems, setMealItems] = useState(() => JSON.parse(localStorage.getItem('bic_meal_items')) || { breakfast: [], lunch: [], dinner: [], snacks: [] });
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [aiMenu, setAiMenu] = useState(() => localStorage.getItem('bic_ai_menu') || null);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedWaterBar, setSelectedWaterBar] = useState(null);

  // --- ŁADOWANIE AI ---
  useEffect(() => {
    const prepareAI = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        if (!window.globalAiModel) {
          window.globalAiModel = await mobilenet.load({ version: 1, alpha: 0.25 });
        }
      } catch (e) { console.error("AI Error:", e); }
    };
    prepareAI();
  }, []);

  // --- STATE I LOGIKA ---
  const savedProfile = JSON.parse(localStorage.getItem('bic_profile')) || {};
  const [step, setStep] = useState(() => JSON.parse(localStorage.getItem('bic_step')) || 1);
  const [name, setName] = useState(savedProfile.name || '');
  const [gender, setGender] = useState(savedProfile.gender || 'male');
  const [age, setAge] = useState(savedProfile.age || 25);
  const [weight, setWeight] = useState(savedProfile.weight || 70);
  const [height, setHeight] = useState(savedProfile.height || 175);
  const [activity, setActivity] = useState(savedProfile.activity || 1.2);
  const [goal, setGoal] = useState(savedProfile.goal || 'maintain');
  const [avatar, setAvatar] = useState(savedProfile.avatar || null);
  const [streak, setStreak] = useState(() => JSON.parse(localStorage.getItem('bic_streak')) || 1);
  const [water, setWater] = useState(() => JSON.parse(localStorage.getItem('bic_water')) || 0);
  const [finalCalories, setFinalCalories] = useState(() => JSON.parse(localStorage.getItem('bic_target')) || null);
  const [consumedCalories, setConsumedCalories] = useState(() => JSON.parse(localStorage.getItem('bic_consumed')) || 0);
  const [consumedMacros, setConsumedMacros] = useState(() => JSON.parse(localStorage.getItem('bic_macros')) || { protein: 0, carbs: 0, fat: 0 });
  const [meals, setMeals] = useState(() => JSON.parse(localStorage.getItem('bic_meals')) || { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('bic_history')) || []);
  const [lastDate, setLastDate] = useState(() => localStorage.getItem('bic_last_date') || new Date().toLocaleDateString());

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    if (lastDate !== today) {
      const parseDate = (dStr) => {
        const parts = dStr.split('.');
        return parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(dStr);
      };

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const lastDateObj = parseDate(lastDate);
      lastDateObj.setHours(0, 0, 0, 0);

      const diffDays = Math.round((todayDate - lastDateObj) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setStreak(prev => prev + 1);
      } else if (diffDays > 1) {
        setStreak(1);
      }

      setHistory(prev => {
        if (prev.some(day => day.date === lastDate)) return prev;
        return [{ date: lastDate, consumed: consumedCalories, target: finalCalories, water: water, waterTarget: Math.round(weight * 35) }, ...prev].slice(0, 7);
      });
      setConsumedCalories(0);
      setConsumedMacros({ protein: 0, carbs: 0, fat: 0 });
      setMeals({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
      setMealItems({ breakfast: [], lunch: [], dinner: [], snacks: [] });
      setWater(0);
      setLastDate(today);
    }

    localStorage.setItem('bic_step', JSON.stringify(step));
    localStorage.setItem('bic_target', JSON.stringify(finalCalories));
    localStorage.setItem('bic_consumed', JSON.stringify(consumedCalories));
    localStorage.setItem('bic_macros', JSON.stringify(consumedMacros));
    localStorage.setItem('bic_meals', JSON.stringify(meals));
    localStorage.setItem('bic_history', JSON.stringify(history));
    localStorage.setItem('bic_last_date', today);
    localStorage.setItem('bic_profile', JSON.stringify({ name, gender, age, weight, height, activity, goal, avatar }));
    localStorage.setItem('bic_meal_items', JSON.stringify(mealItems));
    localStorage.setItem('bic_water', JSON.stringify(water));
    localStorage.setItem('bic_streak', JSON.stringify(streak));
    if (aiMenu) localStorage.setItem('bic_ai_menu', aiMenu); else localStorage.removeItem('bic_ai_menu');

  }, [step, consumedCalories, meals, history, lastDate, name, gender, age, weight, height, activity, goal, finalCalories, avatar, streak, mealItems, water, aiMenu]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        const dataURI = canvas.toDataURL('image/jpeg', 0.7);
        setAvatar(dataURI);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCalculate = () => {
    const bmr = calculateBMR(gender, weight, height, age);
    const tdee = calculateTDEE(bmr, parseFloat(activity));
    setFinalCalories(calculateFinalGoal(tdee, goal));
    setStep(3);
  };

  const handleFullReset = () => {
    if (window.confirm("Czy chcesz całkowicie wyczyścić dane?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = { profil: { name, age, weight, goal, avatar }, historia: history, dzisiejszeKalorie: consumedCalories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BIC_Moje_Dane.json";
    a.click();
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.profil || !data.historia) {
          alert("Błędny plik z danymi!");
          return;
        }

        if (window.confirm("Zastąpić obecne dane wgranym plikiem?")) {
          setName(data.profil.name || '');
          setAge(data.profil.age || 25);
          setWeight(data.profil.weight || 70);
          setGoal(data.profil.goal || 'maintain');
          setAvatar(data.profil.avatar || null);
          setHistory(data.historia || []);
          setConsumedCalories(data.dzisiejszeKalorie || 0);
          alert("Dane zostały pomyślnie wczytane!");
          setStep(3);
        }
      } catch (err) {
        alert("Błąd odczytu pliku. Upewnij się, że to oryginalny plik JSON z BIC.");
      }
    };
    reader.readAsText(file);
  };

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  const bmiStatus = bmi < 18.5 ? 'Niedowaga' : bmi < 25 ? 'Norma' : bmi < 30 ? 'Nadwaga' : 'Otyłość';

const handleRemoveItem = (mealCategory, indexToRemove) => {
    if (!window.confirm("Na pewno chcesz usunąć ten produkt?")) return;
    const itemToRemove = mealItems[mealCategory][indexToRemove];
    const kcalToDeduct = itemToRemove.kcal;

    // --- NOWE: Wyciąganie Makro ---
    const proToDeduct = itemToRemove.protein || 0;
    const carbsToDeduct = itemToRemove.carbs || 0;
    const fatToDeduct = itemToRemove.fat || 0;

    setMealItems(prev => {
      const updatedList = prev[mealCategory].filter((_, index) => index !== indexToRemove);
      return { ...prev, [mealCategory]: updatedList };
    });

    setMeals(prev => ({
      ...prev,
      [mealCategory]: Math.max(0, prev[mealCategory] - kcalToDeduct)
    }));

    setConsumedCalories(prev => Math.max(0, prev - kcalToDeduct));

    // --- NOWE: Odejmowanie Makro ---
    setConsumedMacros(prev => ({
        protein: Math.max(0, prev.protein - proToDeduct),
        carbs: Math.max(0, prev.carbs - carbsToDeduct),
        fat: Math.max(0, prev.fat - fatToDeduct)
    }));
  };

  const handleResetDiary = () => {
    if (window.confirm("Zresetować bilans?")) {
      setConsumedCalories(0);
      setConsumedMacros({ protein: 0, carbs: 0, fat: 0 });
      setMeals({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
      setMealItems({ breakfast: [], lunch: [], dinner: [], snacks: [] });
      setWater(0);
      setAiMenu(null);
    }
  };

  const generateAiMenu = async () => {
    setIsMenuLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Jesteś ekspertem dietetyki aplikacji BIC. Użytkownik ma cel: ${goal === 'lose' ? 'Schudnąć' : goal === 'gain' ? 'Przytyć' : 'Utrzymać wagę'}. Cel kaloryczny na dziś: ${finalCalories} kcal. Ułóż prosty, pyszny jadłospis na dziś (Śniadanie, Obiad, Kolacja, Przekąska), aby zsumowane kalorie były bliskie temu limitowi. Zwróć krótki tekst używając emoji, wymień danie i przypisaną mu liczbę kalorii. Zakończ krótkim słowem motywacyjnym.`;

      const result = await model.generateContent(prompt);
      setAiMenu(result.response.text());
    } catch (error) {
      setAiMenu("Błąd połączenia z AI. Spróbuj ponownie później.");
    }
    setIsMenuLoading(false);
  };

  const chartData = [...history].reverse().map(day => ({
    label: day.date.substring(0, 5),
    consumed: day.consumed,
    target: day.target,
    water: day.water || 0,
    waterTarget: day.waterTarget || Math.round(weight * 35)
  }));

  chartData.push({
    label: 'Dziś',
    consumed: consumedCalories,
    target: finalCalories,
    water: water,
    waterTarget: Math.round(weight * 35)
  });

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col text-slate-200 relative font-sans bg-[#0a0a0c] overflow-hidden">
      <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-emerald-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full"></div>

      {isScanning && <Scanner onClose={() => setIsScanning(false)} onScan={(item) => {
        if (typeof item === 'number') { setPendingItem({ name: "Ręcznie dodano", kcal: item }); }
        else { setPendingItem(item); }
        setIsScanning(false);
      }} />}

      {pendingItem !== null && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#161618] p-8 rounded-[3.5rem] border border-white/10 text-center w-full max-w-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Dodajesz:</h2>
            <p className="text-lg font-bold text-white mb-2 leading-tight">{pendingItem.name}</p>
            <p className="text-5xl font-black text-emerald-400 mb-8 tracking-tighter">+{pendingItem.kcal} kcal</p>
            <div className="grid grid-cols-2 gap-3">
              {['breakfast', 'lunch', 'dinner', 'snacks'].map(m => (
                <button key={m} onClick={() => {
                setMeals({ ...meals, [m]: meals[m] + pendingItem.kcal });
                setMealItems({ ...mealItems, [m]: [...mealItems[m], pendingItem] });
                setConsumedCalories(consumedCalories + pendingItem.kcal);
                // --- NOWE: Dodawanie Makro ---
                setConsumedMacros(prev => ({
                    protein: prev.protein + (pendingItem.protein || 0),
                    carbs: prev.carbs + (pendingItem.carbs || 0),
                    fat: prev.fat + (pendingItem.fat || 0)
                }));
                setPendingItem(null);
              }} className="bg-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-[#00E676] hover:text-black transition-all border border-white/5 active:scale-95">
                  <span className="text-xs font-black uppercase">{m === 'breakfast' ? '🍳 Śniadanie' : m === 'lunch' ? '🍲 Obiad' : m === 'dinner' ? '🥗 Kolacja' : '🍎 Przekąska'}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setPendingItem(null)} className="mt-8 text-slate-600 font-bold text-xs uppercase hover:text-white transition-colors">Anuluj</button>
          </div>
        </div>
      )}

      {step !== 3 && !isScanning && (
        <div className="mt-16 text-center animate-in fade-in zoom-in duration-700">
          <h1 className="text-7xl font-black italic tracking-tighter bg-gradient-to-br from-white to-emerald-400 bg-clip-text text-transparent">BIC.</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Be In Condition</p>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/10 shadow-2xl mx-4 mb-10 animate-in slide-in-from-bottom-6">
          <div className="space-y-4 text-left">
            <div className="bg-black/30 p-4 rounded-3xl border border-white/5">
              <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Twoje Imię</label>
              <input className="w-full bg-transparent text-xl font-bold outline-none text-white placeholder-slate-800" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Wpisz..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-3xl border border-white/5">
                <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Płeć</label>
                <select className="w-full bg-transparent text-[#00E676] font-bold outline-none" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male" className="bg-[#161618]">Mężczyzna</option><option value="female" className="bg-[#161618]">Kobieta</option>
                </select>
              </div>
              <div className="bg-black/30 p-4 rounded-3xl border border-white/5">
                <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Wiek</label>
                <input className="w-full bg-transparent text-[#00E676] font-bold outline-none" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-3xl border border-white/5"><label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Waga (kg)</label>
                <input className="w-full bg-transparent text-[#00E676] font-bold outline-none" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="bg-black/30 p-4 rounded-3xl border border-white/5"><label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Wzrost (cm)</label>
                <input className="w-full bg-transparent text-[#00E676] font-bold outline-none" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
            </div>
            <div className="bg-black/30 p-4 rounded-3xl border border-white/5">
              <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Aktywność</label>
              <select className="w-full bg-transparent text-[#00E676] font-bold outline-none text-sm" value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="1.2" className="bg-[#161618]">Brak ćwiczeń</option>
                <option value="1.375" className="bg-[#161618]">Lekka (1-3 dni)</option>
                <option value="1.55" className="bg-[#161618]">Średnia (3-5 dni)</option>
                <option value="1.725" className="bg-[#161618]">Duża (6-7 dni)</option>
              </select>
            </div>
            <div className="bg-black/30 p-4 rounded-3xl border border-white/5">
              <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Cel</label>
              <select className="w-full bg-transparent text-[#00E676] font-bold outline-none" value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="lose" className="bg-[#161618]">Schudnąć</option>
                <option value="maintain" className="bg-[#161618]">Utrzymać wagę</option>
                <option value="gain" className="bg-[#161618]">Przytyć</option>
              </select>
            </div>
          </div>
          <button onClick={handleCalculate} className="w-full mt-8 p-6 bg-gradient-to-br from-emerald-400 to-teal-400 text-slate-900 font-black rounded-full uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 italic">Zatwierdź Profil</button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6 w-full pb-32 pt-10">
          {activeTab === 'diary' ? (
            <DiaryView
              name={name} goal={goal} finalCalories={finalCalories} 
              consumedCalories={consumedCalories} meals={meals} mealItems={mealItems}
              water={water} weight={weight} aiMenu={aiMenu} isMenuLoading={isMenuLoading}
              expandedMeal={expandedMeal} setExpandedMeal={setExpandedMeal} setWater={setWater}
              generateAiMenu={generateAiMenu} handleRemoveItem={handleRemoveItem}
              handleResetDiary={handleResetDiary} consumedMacros={consumedMacros}
            />
          ) : (
            <ProfileView
              name={name} age={age} weight={weight} height={height} goal={goal}
              bmi={bmi} bmiStatus={bmiStatus} streak={streak} finalCalories={finalCalories}
              consumedCalories={consumedCalories} avatar={avatar} history={history}
              chartData={chartData} selectedBar={selectedBar} setSelectedBar={setSelectedBar}
              selectedWaterBar={selectedWaterBar} setSelectedWaterBar={setSelectedWaterBar}
              handleAvatarChange={handleAvatarChange} handleExportData={handleExportData}
              handleImportData={handleImportData} handleFullReset={handleFullReset}
              setStep={setStep}
            />
          )}
          
          {/* DOLNA NAWIGACJA */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[80]">
            <button onClick={() => { setActiveTab('diary'); setIsScanning(false); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === 'diary' && !isScanning ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">Dziennik</span>
            </button>
            <button onClick={() => setIsScanning(true)} className="bg-gradient-to-br from-emerald-400 to-teal-400 w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-slate-950 shadow-xl active:scale-90 transition-transform -mt-14 border-[8px] border-[#0a0a0c]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={() => { setActiveTab('profile'); setIsScanning(false); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' && !isScanning ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">Profil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;