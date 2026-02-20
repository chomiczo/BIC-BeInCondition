import { useState, useEffect } from 'react';
import { calculateBMR, calculateTDEE, calculateFinalGoal } from './calculator';
import Scanner from './Scanner';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

window.globalAiModel = null;

function App() {
  const [activeTab, setActiveTab] = useState('diary');
  const [isScanning, setIsScanning] = useState(false);
  const [pendingCalories, setPendingCalories] = useState(null);

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

      {/* GŁÓWNY WIDOK */}
      {step === 3 && (
        <div className="flex flex-col gap-6 w-full pb-32 pt-10">
          {activeTab === 'diary' ? (
            <div className="px-6 animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-end mb-8">
                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-1">Witaj, {name}</p><h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Dziennik</h2></div>
                <button onClick={() => { if (window.confirm("Zresetować bilans?")) setConsumedCalories(0); }} className="bg-white/5 p-4 rounded-3xl border border-white/10 text-slate-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
              </div>

              <div className="bg-[#161618] p-10 rounded-[4rem] shadow-2xl flex flex-col items-center border border-white/10 relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px]"></div>
                <div className="w-52 h-52 rounded-full border-[14px] border-black/40 flex flex-col justify-center items-center relative shadow-inner">
                  <span className="text-6xl font-black italic text-white tracking-tighter">{finalCalories - consumedCalories}</span>
                  <span className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest opacity-60">Pozostało</span>
                </div>
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
            <div className="px-6 animate-in slide-in-from-right duration-300">
              <h2 className="text-4xl font-black text-white tracking-tighter italic mb-8 uppercase">Profil</h2>
              <div className="bg-[#161618] p-8 rounded-[3.5rem] border border-white/10 shadow-2xl mb-8 relative">
                <div className="flex items-center gap-6 mb-12 text-left">
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-200 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-black italic shadow-xl shadow-emerald-500/20">{name ? name[0].toUpperCase() : 'B'}</div>
                  <div><h3 className="text-3xl font-black text-white italic tracking-tight">{name || 'Użytkownik'}</h3><p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em]">{bmiStatus} (BMI: {bmi})</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8 text-left mb-8">
                  <div className="bg-black/30 p-5 rounded-3xl border border-white/5"><p className="text-[8px] text-slate-600 font-black uppercase mb-1">Waga</p><p className="text-xl font-black text-white italic">{weight} kg</p></div>
                  <div className="bg-black/30 p-5 rounded-3xl border border-white/5"><p className="text-[8px] text-slate-600 font-black uppercase mb-1">Wzrost</p><p className="text-xl font-black text-white italic">{height} cm</p></div>
                </div>

                {/* SEKCJA AUTORA: Aleksander Chomicz */}
                <div className="border-t border-white/5 pt-8 pb-4 text-center">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-4 italic">O Aplikacji</p>
                  <p className="text-slate-300 text-sm font-black italic">BIC - Be In Condition</p>
                  <p className="text-[#00E676] text-[10px] font-bold uppercase tracking-widest mt-1">Autor: Aleksander Chomicz</p>

                  {/*  GitHub  */}
                  <a
                    href="https://github.com/chomiczo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Check my GitHub</span>
                  </a>
                </div>

                <div className="mt-8 space-y-3">
                  <button onClick={() => setStep(1)} className="w-full p-5 bg-white/5 text-slate-500 font-black rounded-3xl uppercase text-[9px] tracking-[0.4em] border border-white/5 hover:text-white transition-all">Edytuj Profil</button>
                  <button onClick={handleFullReset} className="w-full p-5 bg-red-500/10 text-red-400 font-black rounded-3xl uppercase text-[9px] tracking-[0.4em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Reset / Nowy Użytkownik</button>
                </div>
              </div>
            </div>
          )}

          {/* DOLNA NAWIGACJA (Standard Premium) */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[80]">
            <button onClick={() => { setActiveTab('diary'); setIsScanning(false); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === 'diary' && !isScanning ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">Dziennik</span>
            </button>
            <button onClick={() => setIsScanning(true)} className="bg-gradient-to-br from-emerald-400 to-teal-400 w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-slate-950 shadow-[0_10px_30px_rgba(52,211,153,0.3)] active:scale-90 transition-transform -mt-14 border-[8px] border-[#0a0a0c]">
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