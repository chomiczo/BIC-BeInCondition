export default function SetupView({
    name, setName, gender, setGender, age, setAge, weight, setWeight,
    height, setHeight, activity, setActivity, goal, setGoal, handleCalculate
}) {
    return (
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
    );
}