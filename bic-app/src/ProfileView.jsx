// plik: src/ProfileView.jsx
import React from 'react';

export default function ProfileView({ 
    name, age, weight, height, goal, bmi, bmiStatus, streak, finalCalories, 
    consumedCalories, avatar, history, chartData, selectedBar, setSelectedBar, 
    selectedWaterBar, setSelectedWaterBar, handleAvatarChange, handleExportData, 
    handleImportData, handleFullReset, setStep 
}) {
    return (
        <div className="px-6 animate-in slide-in-from-right duration-300 pb-20">
            <h2 className="text-4xl font-black text-white tracking-tighter italic mb-8 uppercase text-left">Profil</h2>

            {/* RAPORT NIEDZIELNY */}
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
                {/* NAGŁÓWEK Z AVATAREM */}
                <div className="flex items-center gap-6 mb-8 text-left relative">
                    <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    <label htmlFor="avatar-upload" className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-200 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-black italic shadow-xl shadow-emerald-500/20 overflow-hidden cursor-pointer relative group">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{name ? name[0].toUpperCase() : 'B'}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                    </label>

                    <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tight">{name || 'Użytkownik'}</h3>
                        <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em]">{bmiStatus} (BMI: {bmi})</p>
                    </div>

                    {avatar && (
                        <button onClick={() => { if (window.confirm("Usunąć zdjęcie?")) handleAvatarChange({ target: { files: [] } }); }} className="absolute -top-2 -left-2 bg-red-500/80 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg active:scale-90 font-bold text-xs">
                            ✕
                        </button>
                    )}
                </div>

                {/* SZYBKIE STATYSTYKI */}
                <div className="flex gap-3 mb-12">
                    <div className="flex-1 bg-black/40 p-4 rounded-3xl border border-white/5 text-center shadow-inner">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Twój Cel</p>
                        <p className="text-sm font-black text-white italic">{goal === 'lose' ? 'Redukcja 📉' : goal === 'gain' ? 'Masa 📈' : 'Utrzymanie ⚖️'}</p>
                        <p className="text-[10px] font-bold text-[#00E676] mt-1">{finalCalories} kcal / dzień</p>
                    </div>
                    <div className="flex-1 bg-black/40 p-4 rounded-3xl border border-white/5 text-center shadow-inner">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Dni z rzędu 🔥</p>
                        <p className="text-2xl font-black text-white italic mt-1">{streak} <span className="text-[10px] text-slate-500 font-bold uppercase not-italic">dni</span></p>
                    </div>
                </div>

                {/* WYKRES KALORII */}
                <div className="mb-10 bg-black/40 p-6 rounded-[3rem] border border-white/5 shadow-inner">
                    <div className="flex justify-between items-end mb-8 h-12">
                        <div>
                            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Wykres Tygodnia</h4>
                            <p className="text-xl font-black text-white italic mt-1">Aktywność</p>
                        </div>
                        {selectedBar !== null ? (
                            <div className="text-right animate-in slide-in-from-right-2 duration-200">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{chartData[selectedBar].label}</p>
                                <p className="text-2xl font-black text-[#00E676] italic leading-none">{chartData[selectedBar].consumed} <span className="text-[10px] text-slate-600 font-bold uppercase not-italic">kcal</span></p>
                            </div>
                        ) : (
                            <div className="text-right opacity-50">
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] italic">Kliknij słupek<br />aby zobaczyć wynik</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-end h-40 gap-2 mt-2">
                        {chartData.map((day, idx) => {
                            const percent = Math.max(Math.min((day.consumed / day.target) * 100, 100) || 0, 5);
                            const isOver = day.consumed > day.target;
                            const isSelected = selectedBar === idx;

                            return (
                                <div key={idx} onClick={() => setSelectedBar(isSelected ? null : idx)} className="flex-1 flex flex-col items-center justify-end gap-3 cursor-pointer group h-full">
                                    <div className="w-10 bg-[#0d0d12] rounded-2xl flex items-end justify-center h-full relative overflow-hidden shadow-inner p-1">
                                        <div className={`w-full rounded-xl transition-all duration-700 ease-out ${isOver ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : isSelected ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#00E676] group-hover:bg-[#00E676]/70 shadow-[0_0_15px_rgba(0,230,118,0.2)]'}`} style={{ height: `${percent}%` }}></div>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase transition-all ${isSelected ? 'text-white scale-125' : 'text-slate-600'}`}>{day.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* WYKRES NAWODNIENIA */}
                <div className="mb-10 bg-black/40 p-6 rounded-[3rem] border border-white/5 shadow-inner relative overflow-hidden group">
                    <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-blue-500/10 blur-[60px] pointer-events-none"></div>
                    <div className="flex justify-between items-end mb-8 h-12 relative z-10">
                        <div>
                            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Nawodnienie</h4>
                            <p className="text-xl font-black text-white italic mt-1">Wypite Płyny</p>
                        </div>
                        {selectedWaterBar !== null ? (
                            <div className="text-right animate-in slide-in-from-right-2 duration-200">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{chartData[selectedWaterBar].label}</p>
                                <p className="text-2xl font-black text-blue-400 italic leading-none">{chartData[selectedWaterBar].water} <span className="text-[10px] text-slate-600 font-bold uppercase not-italic">ml</span></p>
                            </div>
                        ) : (
                            <div className="text-right opacity-50">
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] italic">Kliknij słupek<br />aby zobaczyć wynik</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-end h-40 gap-2 mt-2 relative z-10">
                        {chartData.map((day, idx) => {
                            const target = day.waterTarget || Math.round(weight * 35);
                            const percent = Math.max(Math.min((day.water / target) * 100, 100) || 0, 5);
                            const isGoalReached = day.water >= target;
                            const isSelected = selectedWaterBar === idx;

                            return (
                                <div key={idx} onClick={() => setSelectedWaterBar(isSelected ? null : idx)} className="flex-1 flex flex-col items-center justify-end gap-3 cursor-pointer group h-full">
                                    <div className="w-10 bg-[#0d0d12] rounded-2xl flex items-end justify-center h-full relative overflow-hidden shadow-inner p-1">
                                        <div className={`w-full rounded-xl transition-all duration-700 ease-out ${isSelected ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : isGoalReached ? 'bg-blue-500 group-hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-blue-900 group-hover:bg-blue-700'}`} style={{ height: `${percent}%` }}></div>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase transition-all ${isSelected ? 'text-white scale-125' : 'text-slate-600'}`}>{day.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* HISTORIA 7 DNI */}
                <div className="mb-10">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-4 italic text-left">Ostatnie 7 dni</p>
                    <div className="space-y-4">
                        {history.length > 0 ? history.map((day, idx) => {
                            const percent = Math.min((day.consumed / day.target) * 100, 100);
                            const isOver = day.consumed > day.target;

                            return (
                                <div key={idx} className="bg-black/30 p-4 rounded-3xl border border-white/5 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{day.date}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black italic ${isOver ? 'text-red-400' : 'text-[#00E676]'}`}>{day.consumed}</span>
                                            <span className="text-[9px] text-slate-600 font-bold">/ {day.target} kcal</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-[#0d0d12] h-2 rounded-full overflow-hidden shadow-inner">
                                        <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-[#00E676]'}`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="bg-black/20 p-6 rounded-[2rem] border border-dashed border-white/5 flex flex-col items-center justify-center opacity-70">
                                <span className="text-3xl mb-2">⏳</span>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">Twoja historia pojawi się<br />po pierwszej północy.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-4 italic text-center">O Aplikacji</p>
                    <p className="text-slate-300 text-sm font-black italic text-center">BIC - Be In Condition</p>
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1 text-center">Autor: Aleksander Chomicz</p>
                    <a href="https://github.com/chomiczo" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all mx-auto active:scale-95">
                        <span className="text-[9px] font-black uppercase tracking-widest italic">Check my GitHub</span>
                    </a>
                </div>

                {/* PRZYCISKI ZARZĄDZANIA */}
                <div className="mt-8 space-y-3">
                    <div className="flex gap-3">
                        <button onClick={handleExportData} className="flex-1 p-4 bg-emerald-500/10 text-[#00E676] font-black rounded-3xl uppercase text-[9px] tracking-[0.2em] border border-emerald-500/20 active:bg-emerald-500/20 transition-colors flex justify-center items-center gap-2">
                            Kopia Danych
                        </button>
                        <input type="file" id="import-data" accept=".json" onChange={handleImportData} className="hidden" />
                        <label htmlFor="import-data" className="flex-1 p-4 bg-blue-500/10 text-blue-400 font-black rounded-3xl uppercase text-[9px] tracking-[0.2em] border border-blue-500/20 active:bg-blue-500/20 transition-colors flex justify-center items-center gap-2 cursor-pointer">
                            Wczytaj Dane
                        </label>
                    </div>
                    <button onClick={() => setStep(1)} className="w-full p-5 bg-white/5 text-slate-500 font-black rounded-3xl uppercase text-[9px] tracking-[0.4em] border border-white/5 active:bg-white/10 transition-colors">Edytuj Profil</button>
                    <button onClick={handleFullReset} className="w-full p-5 bg-red-500/10 text-red-400 font-black rounded-3xl uppercase text-[9px] tracking-[0.4em] border border-red-500/20 active:bg-red-500 active:text-white transition-colors">Reset / Nowy Użytkownik</button>
                </div>
            </div>
        </div>
    );
}