export default function DiaryView({
    name, goal, finalCalories, consumedCalories, meals, mealItems, water, weight,
    aiMenu, isMenuLoading, expandedMeal, setExpandedMeal, setWater,
    generateAiMenu, handleRemoveItem, handleResetDiary, consumedMacros
}) {
    return (
        <div className="px-6 animate-in slide-in-from-left duration-300">
            {/* NAGŁÓWEK DZIENNIKA */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-1">Witaj, {name}</p>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Dziennik</h2>
                </div>
                <button
                    onClick={handleResetDiary}
                    className="bg-white/5 p-4 rounded-3xl border border-white/10 text-slate-500 active:scale-90 transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* GŁÓWNE KÓŁKO KALORII */}
            <div className="bg-[#161618] p-10 rounded-[4rem] shadow-2xl flex flex-col items-center border border-white/10 relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px]"></div>
                <div className="w-52 h-52 rounded-full border-[14px] border-black/40 flex flex-col justify-center items-center relative shadow-inner">
                    <span className="text-6xl font-black italic text-white tracking-tighter">
                        {finalCalories - consumedCalories < 0 ? 0 : finalCalories - consumedCalories}
                    </span>
                    <span className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest opacity-60">Pozostało</span>
                </div>
            </div>

            {/* MODUŁ MAKROSKŁADNIKÓW */}
            <div className="bg-black/40 p-6 rounded-[2.5rem] border border-white/5 shadow-inner mb-10 flex flex-col gap-5 relative overflow-hidden">
                {/* Oblicza orientacyjne zapotrzebowanie (np. 30% Białko, 40% Węgle, 30% Tłuszcze) */}
                {(() => {
                    const targetProtein = Math.round((finalCalories * 0.3) / 4);
                    const targetCarbs = Math.round((finalCalories * 0.4) / 4);
                    const targetFat = Math.round((finalCalories * 0.3) / 9);

                    return (
                        <>
                            {/* Pasek Białka */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Białko 🥩</span>
                                    <span className="text-xs text-white font-bold italic">{consumedMacros.protein} <span className="text-[9px] text-slate-500 font-normal not-italic">/ {targetProtein}g</span></span>
                                </div>
                                <div className="w-full bg-[#0d0d12] h-2 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min((consumedMacros.protein / targetProtein) * 100, 100) || 0}%` }}></div>
                                </div>
                            </div>

                            {/* Pasek Węglowodanów */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">Węgle 🍞</span>
                                    <span className="text-xs text-white font-bold italic">{consumedMacros.carbs} <span className="text-[9px] text-slate-500 font-normal not-italic">/ {targetCarbs}g</span></span>
                                </div>
                                <div className="w-full bg-[#0d0d12] h-2 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${Math.min((consumedMacros.carbs / targetCarbs) * 100, 100) || 0}%` }}></div>
                                </div>
                            </div>

                            {/* Pasek Tłuszczy */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-pink-500 font-black uppercase tracking-widest">Tłuszcze 🥑</span>
                                    <span className="text-xs text-white font-bold italic">{consumedMacros.fat} <span className="text-[9px] text-slate-500 font-normal not-italic">/ {targetFat}g</span></span>
                                </div>
                                <div className="w-full bg-[#0d0d12] h-2 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-pink-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{ width: `${Math.min((consumedMacros.fat / targetFat) * 100, 100) || 0}%` }}></div>
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* INTELIGENTNY DIETETYK AI */}
            <div className="bg-white/5 border border-[#00E676]/30 p-5 rounded-[2rem] mb-10 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl animate-pulse">🤖</span>
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-[#00E676] tracking-widest">Dietetyk BIC</h4>
                            <p className="text-xs text-slate-400 font-bold">Cel: {goal === 'lose' ? 'Redukcja 📉' : goal === 'gain' ? 'Masa 📈' : 'Utrzymanie ⚖️'}</p>
                        </div>
                    </div>
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

            {/* POSIŁKI (AKORDEON) */}
            <div className="grid grid-cols-1 gap-4">
                {[
                    { id: 'breakfast', i: '🍳', l: 'Śniadanie', k: meals.breakfast },
                    { id: 'lunch', i: '🍲', l: 'Obiad', k: meals.lunch },
                    { id: 'dinner', i: '🥗', l: 'Kolacja', k: meals.dinner },
                    { id: 'snacks', i: '🍎', l: 'Przekąski', k: meals.snacks }
                ].map(m => {
                    const isExpanded = expandedMeal === m.id;
                    const items = mealItems[m.id] || [];

                    return (
                        <div key={m.id} className="flex flex-col gap-2">
                            {/* Główny przycisk posiłku */}
                            <div onClick={() => setExpandedMeal(isExpanded ? null : m.id)} className="bg-[#161618] p-6 rounded-[2.5rem] flex items-center justify-between border border-white/5 shadow-xl group cursor-pointer active:scale-95 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{m.i}</div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{m.l}</h3>
                                        <p className="text-2xl font-black text-white italic">{m.k} <span className="text-xs text-slate-600 font-normal">kcal</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    <div className={`w-1.5 h-10 rounded-full ${m.k > 0 ? 'bg-[#00E676]' : 'bg-emerald-500/20'}`}></div>
                                </div>
                            </div>

                            {/* Rozwijana lista produktów */}
                            {isExpanded && items.length > 0 && (
                                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 mx-2 animate-in slide-in-from-top-4 duration-200">
                                    <ul className="space-y-3">
                                        {items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 group/item">
                                                <div className="flex flex-col pr-4 overflow-hidden">
                                                    <span className="text-slate-300 font-medium text-sm truncate">{item.name}</span>
                                                    <span className="text-[#00E676] font-black italic text-[10px]">{item.kcal} kcal</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(m.id, idx);
                                                    }}
                                                    className="min-w-[28px] h-7 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs active:scale-90 transition-all border border-red-500/20 hover:bg-red-500 hover:text-white"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Komunikat o braku jedzenia */}
                            {isExpanded && items.length === 0 && (
                                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 mx-2 text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Brak dodanych produktów</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ŚLEDZENIE NAWODNIENIA */}
            <div className="bg-[#161618] p-6 rounded-[2.5rem] border border-white/5 shadow-xl mt-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>

                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Nawodnienie</h3>
                        <p className="text-2xl font-black text-white italic leading-none">{water} <span className="text-xs text-slate-600 font-normal">/ {Math.round(weight * 35)} ml</span></p>
                    </div>
                    {water > 0 && (
                        <button onClick={() => setWater(0)} className="text-[9px] text-slate-600 font-bold uppercase tracking-widest hover:text-red-400 transition-colors bg-white/5 px-3 py-1.5 rounded-lg active:scale-95">
                            Reset
                        </button>
                    )}
                </div>

                <div className="w-full bg-[#0d0d12] h-4 rounded-full overflow-hidden shadow-inner mb-6 relative z-10">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min((water / Math.round(weight * 35)) * 100, 100)}%` }}></div>
                </div>

                <div className="flex gap-3 relative z-10">
                    <button onClick={() => setWater(prev => prev + 250)} className="flex-1 bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-blue-500/10 hover:border-blue-500/30 group/btn">
                        <span className="text-xl group-hover/btn:scale-110 transition-transform">🥛</span>
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">+ 250 ml</span>
                    </button>
                    <button onClick={() => setWater(prev => prev + 500)} className="flex-1 bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-blue-500/10 hover:border-blue-500/30 group/btn">
                        <span className="text-xl group-hover/btn:scale-110 transition-transform">🍼</span>
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">+ 500 ml</span>
                    </button>
                </div>
            </div>
        </div>
    );
}