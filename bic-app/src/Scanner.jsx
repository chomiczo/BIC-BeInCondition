import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini API
import { translate, foodKeywords } from './dictionary';

export default function Scanner({ onClose, onScan }) {
  const [tab, setTab] = useState('barcode');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [weight, setWeight] = useState(100);
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState({ name: '', kcalPer100g: 0, protein: 0, carbs: 0, fat: 0, fullWeight: 0 });

  const [manualName, setManualName] = useState('');

  const aiModel = window.globalAiModel;

  useEffect(() => {
    let html5QrCode;
    let stream = null;

    const startScanner = async () => {
      try {
        if (tab === 'barcode') {
          isProcessingRef.current = false;
          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: 280 },
            (text) => {
              if (!isProcessingRef.current) {
                isProcessingRef.current = true;
                html5QrCode.pause(true);
                fetchProduct(text);
              }
            }
          );
        } else if (tab === 'ai') {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
          if (videoRef.current) videoRef.current.srcObject = stream;
        }
      } catch (err) { console.error("Kamera Error:", err); }
    };

    startScanner();
    return () => {
      if (html5QrCode?.isScanning) html5QrCode.stop().then(() => html5QrCode.clear());
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [tab]);

  const fetchProduct = async (code) => {
    setStatus('loading');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1) {

        // Produkt z bazy, ale bez kalorii (np. puste dane / błąd) ---
        if (!data.product.nutriments || Object.keys(data.product.nutriments).length === 0) {
          setErrorMessage("Znaleziono produkt, ale nie ma on wartości odżywczych w bazie! Czy to na pewno jedzenie?");
          setStatus('error');
          isProcessingRef.current = false;
          if (scannerRef.current) scannerRef.current.resume();
          return;
        }

        const nutriments = data.product.nutriments;
        const kcal = nutriments['energy-kcal_100g'] || 0;
        const protein = nutriments['proteins_100g'] || 0;
        const carbs = nutriments['carbohydrates_100g'] || 0;
        const fat = nutriments['fat_100g'] || 0;

        setFoundProduct({
          name: data.product.product_name || "Nieznany produkt",
          kcalPer100g: Math.round(kcal),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat)
        });
        setStatus('result');

      } else {
        // Kodu kreskowego nie ma w ogóle w bazie żywności ---
        setErrorMessage(`Kod ${code} nie istnieje w bazie żywności. Czy to na pewno jedzenie?`);
        setStatus('error');
        isProcessingRef.current = false;
        if (scannerRef.current) scannerRef.current.resume();
      }
    } catch (e) {
      isProcessingRef.current = false;
      setStatus('error');
      setErrorMessage("Błąd skanowania kodu. Spróbuj ponownie.");
    }
  };

  const handleAiCapture = async () => {
    if (!aiModel || !videoRef.current) return;
    setStatus('loading');
    const predictions = await aiModel.classify(videoRef.current);
    const topResult = predictions[0].className.toLowerCase();

    try {
      // INTELIGENTNA ANALIZA ZDJĘCIA PRZEZ GEMINI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Prosty system wizyjny rozpoznał obiekt na zdjęciu jako: "${topResult}". Przetłumacz to na język polski jako rodzaj posiłku. Oszacuj kaloryczność i makroskładniki w 100g. 
      Odpowiedz DOKŁADNIE w formacie: NAZWA | KALORIE | BIAŁKO | WĘGLOWODANY | TŁUSZCZE (np. Banan | 89 | 1 | 23 | 0). 
      Jeśli to nie jest jedzenie, zwróć dokładnie słowo: BŁĄD.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const parts = responseText.split('|');

      if (parts[0].toUpperCase().includes("BŁĄD") || parts[0].toUpperCase().includes("BLAD")) {
        setErrorMessage(`AI wykryło: "${topResult}". To absolutnie nie wygląda na jedzenie!`);
        setStatus('error');
        return;
      }

      if (parts.length >= 5) {
        const aiName = parts[0].trim();
        const aiKcal = parseInt(parts[1].replace(/\D/g, '')) || 0;
        const aiPro = parseInt(parts[2].replace(/\D/g, '')) || 0;
        const aiCarbs = parseInt(parts[3].replace(/\D/g, '')) || 0;
        const aiFat = parseInt(parts[4].replace(/\D/g, '')) || 0;

        setFoundProduct({ name: aiName, kcalPer100g: aiKcal, protein: aiPro, carbs: aiCarbs, fat: aiFat });
        setStatus('result');
      } else {
        setManualName("Danie ze zdjęcia (Popraw nazwę)");
        setTab('manual');
        setStatus('idle');
      }
    } catch (e) {
      // Jeśli AI nie odpowiada, używamy starego awaryjnego słownika
      const name = translate(topResult);
      setFoundProduct({ name: name, kcalPer100g: name.includes('Merci') ? 646 : 250, fullWeight: 0 });
      setStatus('result');
    }
  };

  // --- NOWA FUNKCJA: INTELIGENTNE SZACOWANIE KALORII (GEMINI) ---
  const handleSmartManualEntry = async () => {
    if (!manualName.trim()) return;
    setStatus('loading');
    // === TEST PRAWDY ===

    try {
      // Inicjalizacja Gemini przy użyciu klucza z pliku .env
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 1. USZTYWNIONY PROMPT (Ochrona przed bzdurami)
      const prompt = `Jako profesjonalny dietetyk, oszacuj całkowitą kaloryczność i makroskładniki tego posiłku: "${manualName}". 
      ZASADA 1: Jeśli tekst NIE JEST jedzeniem, zwróć TYLKO słowo: BŁĄD. 
      ZASADA 2: Jeśli to jedzenie, zwróć wynik DOKŁADNIE w formacie: KALORIE | BIAŁKO | WĘGLOWODANY | TŁUSZCZE (np. 450 | 25 | 40 | 15). 
      Zwróć TYLKO same liczby całkowite oddzielone znakiem |. Nie dodawaj słów "kcal" ani "g".`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      if (responseText.toUpperCase().includes("BŁĄD") || responseText.toUpperCase().includes("BLAD")) {
        setErrorMessage("To nie wygląda jak jedzenie ani napój! Wpisz poprawny posiłek.");
        setStatus('error');
        return;
      }

      const parts = responseText.split('|');
      if (parts.length >= 4) {
        setFoundProduct({
          name: manualName,
          kcalPer100g: parseInt(parts[0].replace(/\D/g, '')) || 0,
          protein: parseInt(parts[1].replace(/\D/g, '')) || 0,
          carbs: parseInt(parts[2].replace(/\D/g, '')) || 0,
          fat: parseInt(parts[3].replace(/\D/g, '')) || 0
        });
        setWeight(100);
        setStatus('result');
      } else {
        setErrorMessage("AI nie zrozumiało posiłku. Spróbuj opisać go dokładniej.");
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      // ZMIANA: Pokazujemy prawdziwy powód zablokowania przez Google
      if (error.message && error.message.includes("429")) {
        setErrorMessage("Zbyt wiele pytań do AI pod rząd. Odczekaj 30 sekund.");
      } else {
        setErrorMessage(`Problem z połączeniem: ${error.message}`);
      }
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d12] z-[200] flex flex-col items-center justify-start text-white overflow-y-auto pb-10">
      <div className="flex bg-[#1a1a1a] p-4 gap-2 border-b border-white/10 w-full sticky top-0 z-50">
        <button onClick={() => { setTab('barcode'); setStatus('idle'); }} className={`flex-1 py-4 rounded-2xl font-black text-[9px] ${tab === 'barcode' ? 'bg-[#00E676] text-black' : 'text-gray-500 bg-white/5'}`}>KOD KRESKOWY</button>
        <button onClick={() => { setTab('ai'); setStatus('idle'); }} className={`flex-1 py-4 rounded-2xl font-black text-[9px] ${tab === 'ai' ? 'bg-[#00E676] text-black' : 'text-gray-500 bg-white/5'}`}>SKANUJ Z AI</button>
        <button onClick={() => { setTab('manual'); setStatus('idle'); }} className={`flex-1 py-4 rounded-2xl font-black text-[9px] ${tab === 'manual' ? 'bg-[#00E676] text-black' : 'text-gray-500 bg-white/5'}`}>RĘCZNIE (AI)</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-sm mx-auto">
        {status === 'idle' && tab !== 'manual' && (
          <div className="w-full flex flex-col items-center animate-in zoom-in">
            {/* Poprawione wyśrodkowanie okna kamery */}
            <div className="w-full flex justify-center">
              <div id="reader" className={`${tab === 'barcode' ? 'block' : 'hidden'} w-full max-w-[300px] rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black shadow-2xl relative mx-auto`}></div>
            </div>

            {tab === 'ai' && (
              <div className="relative w-full max-w-[300px] rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black shadow-2xl mx-auto">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
            )}

            {tab === 'ai' && <button onClick={handleAiCapture} className="mt-8 w-20 h-20 rounded-full bg-[#00E676] text-black shadow-2xl active:scale-90 flex items-center justify-center border-[6px] border-[#0d0d12] mx-auto">📷</button>}

            {/* ZWRÓCONE RĘCZNE WPISYWANIE KODU KRESKOWEGO */}
            {tab === 'barcode' && (
              <div className="flex gap-2 p-1 bg-white/5 rounded-3xl border border-white/10 mt-10 w-full max-w-[300px] italic mx-auto shadow-lg">
                <input type="text" placeholder="Wpisz kod ręcznie..." className="flex-1 bg-transparent p-4 outline-none text-xs text-[#00E676] font-bold" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
                <button onClick={() => fetchProduct(manualCode)} className="bg-white text-black px-6 rounded-2xl font-black text-xs uppercase active:scale-95 transition-transform">ok</button>
              </div>
            )}
          </div>
        )}

        {/* NOWOŚĆ: INTELIGENTNY FORMULARZ RĘCZNY Z LLM */}
        {tab === 'manual' && status === 'idle' && (
          <div className="w-full bg-[#1c1c24] p-8 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in flex flex-col gap-6">
            <h2 className="text-xl font-black italic uppercase text-center mb-2">Opisz co zjadłeś</h2>
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest -mt-4 mb-2">AI wyliczy za Ciebie kalorie</p>

            <textarea
              placeholder="np. 2 kromki chleba razowego z masłem, serem żółtym i pomidorem"
              className="bg-black/40 p-5 rounded-3xl outline-none text-white font-bold border border-white/5 placeholder-gray-600 h-32 resize-none text-sm"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />

            <button onClick={handleSmartManualEntry} className="w-full py-6 bg-gradient-to-r from-[#00E676] to-teal-400 text-black font-black rounded-3xl uppercase tracking-widest shadow-lg active:scale-95 mt-2 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Szacuj Kalorie
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-[#00E676] border-t-transparent rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Magia AI działa...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white/5 p-10 rounded-[3rem] border-2 border-red-500 text-center">
            <span className="text-5xl mb-4 block">🚫</span>
            <p className="text-gray-400 text-xs mb-8 italic">{errorMessage}</p>
            <button onClick={() => { setStatus('idle'); isProcessingRef.current = false; }} className="w-full py-4 bg-white/10 rounded-2xl font-black text-[10px] uppercase">Wróć</button>
          </div>
        )}

        {status === 'result' && (
          <div className="bg-[#1c1c24] p-8 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in w-full text-center italic">
            <h1 className="text-xl font-black mb-2 uppercase leading-tight text-[#00E676]">{foundProduct.name}</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Oszacowano: {foundProduct.kcalPer100g} kcal</p>

            <button
              onClick={() => onScan({
                name: foundProduct.name,
                kcal: foundProduct.kcalPer100g,
                protein: foundProduct.protein,
                carbs: foundProduct.carbs,
                fat: foundProduct.fat
              })}
              className="w-full py-6 bg-[#00E676] text-black font-black rounded-3xl uppercase tracking-widest shadow-lg active:scale-95"
            >
              Dodaj {foundProduct.kcalPer100g} kcal
            </button>
            <button onClick={() => { setStatus('idle'); isProcessingRef.current = false; }} className="mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Anuluj</button>
          </div>
        )}
      </div>
      <button onClick={onClose} className="mt-auto mb-10 p-4 text-gray-700 font-black uppercase text-[10px] tracking-[0.5em] hover:text-white">Zamknij Skaner</button>
    </div>
  );
}