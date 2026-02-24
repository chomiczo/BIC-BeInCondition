export default function Navigation({ activeTab, isScanning, setActiveTab, setIsScanning }) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[80]">
            <button
                onClick={() => { setActiveTab('diary'); setIsScanning(false); }}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === 'diary' && !isScanning ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}
            >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-widest">Dziennik</span>
            </button>

            <button
                onClick={() => setIsScanning(true)}
                className="bg-gradient-to-br from-emerald-400 to-teal-400 w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-slate-950 shadow-xl active:scale-90 transition-transform -mt-14 border-[8px] border-[#0a0a0c]"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
            </button>

            <button
                onClick={() => { setActiveTab('profile'); setIsScanning(false); }}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' && !isScanning ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}
            >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-widest">Profil</span>
            </button>
        </div>
    );
}