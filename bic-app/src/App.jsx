import { useState, useEffect } from 'react';
import { calculateBMR, calculateTDEE, calculateFinalGoal } from './calculator';
import Scanner from './Scanner';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { GoogleGenerativeAI } from "@google/generative-ai"; //

window.globalAiModel = null;

function App() {
  const [activeTab, setActiveTab] = useState('diary');
  const [isScanning, setIsScanning] = useState(false);
  const [pendingCalories, setPendingCalories] = useState(null);
  const [aiMenu, setAiMenu] = useState(null);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

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

  const [finalCalories, setFinalCalories] = useState(() => JSON.parse(localStorage.getItem('bic_target')) || null);
  const [consumedCalories, setConsumedCalories] = useState(() => JSON.parse(localStorage.getItem('bic_consumed')) || 0);
  const [meals, setMeals] = useState(() => JSON.parse(localStorage.getItem('bic_meals')) || { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('bic_history')) || []);
  const [lastDate, setLastDate] = useState(() => localStorage.getItem('bic_last_date') || new Date().toLocaleDateString());

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    if (lastDate !== today) {
      setHistory(prev => [{ date: lastDate, consumed: consumedCalories, target: finalCalories }, ...prev].slice(0, 7));
      setConsumedCalories(0);
      setMeals({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
      setLastDate(today);
    }
    localStorage.setItem('bic_step', JSON.stringify(step));
    localStorage.setItem('bic_target', JSON.stringify(finalCalories));
    localStorage.setItem('bic_consumed', JSON.stringify(consumedCalories));
    localStorage.setItem('bic_meals', JSON.stringify(meals));
    localStorage.setItem('bic_history', JSON.stringify(history));
    localStorage.setItem('bic_last_date', today);
    localStorage.setItem('bic_profile', JSON.stringify({ name, gender, age, weight, height, activity, goal }));
  }, [step, consumedCalories, meals, history, lastDate, name, gender, age, weight, height, activity, goal, finalCalories]);

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

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  const bmiStatus = bmi < 18.5 ? 'Niedowaga' : bmi < 25 ? 'Norma' : bmi < 30 ? 'Nadwaga' : 'Otyłość';
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

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col text-slate-200 relative font-sans bg-[#0a0a0c] overflow-hidden">

      {/* Dynamiczne poświaty w tle */}
      <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-emerald-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full"></div>

      {isScanning && <Scanner onClose={() => setIsScanning(false)} onScan={(cal) => { setPendingCalories(cal); setIsScanning(false); }} />}

      {/* POPUP WYBORU POSIŁKU (Glass Design) */}
      {pendingCalories !== null && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#161618] p-8 rounded-[3.5rem] border border-white/10 text-center w-full max-w-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 italic">Dodaj do:</h2>
            <p className="text-5xl font-black text-emerald-400 mb-8 tracking-tighter">+{pendingCalories} kcal</p>
            <div className="grid grid-cols-2 gap-3">
              {['breakfast', 'lunch', 'dinner', 'snacks'].map(m => (
                <button key={m} onClick={() => { setMeals({ ...meals, [m]: meals[m] + pendingCalories }); setConsumedCalories(consumedCalories + pendingCalories); setPendingCalories(null); }} className="bg-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-[#00E676] hover:text-black transition-all border border-white/5 active:scale-95">
                  <span className="text-xs font-black uppercase">{m === 'breakfast' ? '🍳 Śniadanie' : m === 'lunch' ? '🍲 Obiad' : m === 'dinner' ? '🥗 Kolacja' : '🍎 Przekąska'}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setPendingCalories(null)} className="mt-8 text-slate-600 font-bold text-xs uppercase hover:text-white transition-colors">Anuluj</button>
          </div>
        </div>
      )}

      {/* NAGŁÓWEK BRANDINGOWY */}
      {step !== 3 && !isScanning && (
        <div className="mt-16 text-center animate-in fade-in zoom-in duration-700">
          <h1 className="text-7xl font-black italic tracking-tighter bg-gradient-to-br from-white to-emerald-400 bg-clip-text text-transparent">BIC.</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Be In Condition</p>
        </div>
      )}

      {/* FORMULARZ KONFIGURACJI */}
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

      {/* GŁÓWNY WIDOK - BIC by Aleksander Chomicz */}
      {step === 3 && (
        <div className="flex flex-col gap-6 w-full pb-32 pt-10">
          {activeTab === 'diary' ? (
            <div className="px-6 animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-1">Witaj, {name}</p>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Dziennik</h2>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Zresetować bilans?")) {
                      setConsumedCalories(0);
                      setMeals({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
                      setAiMenu(null); // Resetujemy też proponowane menu
                    }
                  }}
                  className="bg-white/5 p-4 rounded-3xl border border-white/10 text-slate-500 active:scale-90 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <div className="bg-[#161618] p-10 rounded-[4rem] shadow-2xl flex flex-col items-center border border-white/10 relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px]"></div>
                <div className="w-52 h-52 rounded-full border-[14px] border-black/40 flex flex-col justify-center items-center relative shadow-inner">
                  <span className="text-6xl font-black italic text-white tracking-tighter">
                    {finalCalories - consumedCalories < 0 ? 0 : finalCalories - consumedCalories}
                  </span>
                  <span className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest opacity-60">Pozostało</span>
                </div>
              </div>

{/* NOWOŚĆ: INTELIGENTNY DIETETYK AI */}
              <div className="bg-white/5 border border-[#00E676]/30 p-5 rounded-[2rem] mb-10 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-pulse">🤖</span>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-[#00E676] tracking-widest">Dietetyk BIC</h4>
                      <p className="text-xs text-slate-400 font-bold">Cel: {goal === 'lose' ? 'Redukcja 📉' : goal === 'gain' ? 'Masa 📈' : 'Utrzymanie ⚖️'}</p>
                    </div>
                  </div>
                  
                  {/* POPRAWKA: Przycisk zostaje i pozwala na losowanie nowego menu! */}
                  {!isMenuLoading && (
                    <button onClick={generateAiMenu} className="bg-[#00E676] text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase active:scale-95 shadow-md shadow-[#00E676]/20 flex items-center gap-1">
                      {aiMenu ? '🔄 Inne dania' : 'Ułóż jadłospis'}
                    </button>
                  )}
                </div>
                
                {isMenuLoading && (
                  <div className="text-center py-4 flex flex-col items-center gap-2 relative z-10">
                    <div className="animate-spin h-6 w-6 border-2 border-[#00E676] border-t-transparent rounded-full"></div>
                    <p className="text-[9px] text-[#00E676] font-bold uppercase tracking-widest">Generowanie planu...</p>
                  </div>
                )}

                {aiMenu && !isMenuLoading && (
                  <div className="text-left bg-black/40 p-4 rounded-2xl border border-white/5 text-[13px] text-slate-200 whitespace-pre-wrap leading-relaxed relative z-10 font-medium italic">
                    {aiMenu}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[{ id: 'breakfast', i: '🍳', l: 'Śniadanie', k: meals.breakfast }, { id: 'lunch', i: '🍲', l: 'Obiad', k: meals.lunch }, { id: 'dinner', i: '🥗', l: 'Kolacja', k: meals.dinner }, { id: 'snacks', i: '🍎', l: 'Przekąski', k: meals.snacks }].map(m => (
                  <div key={m.id} className="bg-[#161618] p-6 rounded-[2.5rem] flex items-center justify-between border border-white/5 shadow-xl group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{m.i}</div>
                      <div><h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{m.l}</h3><p className="text-2xl font-black text-white italic">{m.k} <span className="text-xs text-slate-600 font-normal">kcal</span></p></div>
                    </div>
                    <div className="w-1.5 h-10 bg-emerald-500/20 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 animate-in slide-in-from-right duration-300 pb-20">
              <h2 className="text-4xl font-black text-white tracking-tighter italic mb-8 uppercase text-left">Profil</h2>

              {/* RAPORT NIEDZIELNY - Gwarancja podsumowania tygodnia */}
              {new Date().getDay() === 0 && new Date().getHours() >= 20 && history.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-[2.5rem] mb-6 text-slate-900 shadow-xl animate-pulse">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Raport Tygodniowy 📊</p>
                  <h3 className="text-2xl font-black italic uppercase leading-none">Wynik Tygodnia</h3>
                  <p className="text-sm font-bold mt-2">
                    Zjedzone: <span className="text-xl font-black">{history.reduce((acc, day) => acc + day.consumed, 0) + consumedCalories}</span> kcal
                  </p>
                </div>
              )}

              <div className="bg-[#161618] p-8 rounded-[3.5rem] border border-white/10 shadow-2xl mb-8 relative">
                <div className="flex items-center gap-6 mb-12 text-left">
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-200 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-black italic shadow-xl shadow-emerald-500/20">{name ? name[0].toUpperCase() : 'B'}</div>
                  <div><h3 className="text-3xl font-black text-white italic tracking-tight">{name || 'Użytkownik'}</h3><p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em]">{bmiStatus} (BMI: {bmi})</p></div>
                </div>

                {/* SEKCJA HISTORII OSTATNICH 7 DNI */}
                <div className="mb-10">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-4 italic">Ostatnie 7 dni</p>
                  <div className="space-y-3">
                    {history.length > 0 ? history.map((day, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5">
                        <span className="text-[9px] text-slate-500 font-black uppercase">{day.date}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-black italic ${day.consumed > day.target ? 'text-red-400' : 'text-emerald-400'}`}>
                            {day.consumed}
                          </span>
                          <span className="text-[9px] text-slate-700 font-bold">/ {day.target} kcal</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-[10px] text-slate-700 italic text-center py-4">Historia pojawi się po pierwszej północy.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-4 italic text-center">O Aplikacji</p>
                  <p className="text-slate-300 text-sm font-black italic text-center">BIC - Be In Condition</p>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1 text-center">Autor: Aleksander Chomicz</p>
                  <a href="https://github.com/chomiczo" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all mx-auto">
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Check my GitHub</span>
                  </a>
                </div>

                <div className="mt-8 space-y-3">
                  <button onClick={() => setStep(1)} className="w-full p-5 bg-white/5 text-slate-500 font-black rounded-3xl uppercase text-[9px] tracking-[0.4em] border border-white/5 active:bg-white/10">Edytuj Profil</button>
                  <button onClick={handleFullReset} className="w-full p-5 bg-red-500/10 text-red-400 font-black rounded-3xl uppercase text-[9px] tracking-[0.4em] border border-red-500/20 active:bg-red-500 active:text-white">Reset / Nowy Użytkownik</button>
                </div>
              </div>
            </div>
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