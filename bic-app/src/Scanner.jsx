import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { translate } from './dictionary';
import { fetchBarcodeData, askGeminiForMacros } from './api'; // Import logiki skanera z api.js

export default function Scanner({ onClose, onScan }) {
  const [tab, setTab] = useState('barcode');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState({ name: '', kcalPer100g: 0, protein: 0, carbs: 0, fat: 0, fullWeight: 0 });

  const [manualName, setManualName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const aiModel = window.globalAiModel;

  const startListening = () => {
    console.log("Kliknięto mikrofon! Sprawdzam uprawnienia...");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Twoja przeglądarka nie obsługuje mikrofonu. Użyj Chrome lub Safari.");
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pl-PL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setManualName(prev => prev ? prev + ' ' + speechResult : speechResult);
    };
    recognition.onerror = (event) => {
      console.error("Błąd mikrofonu:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

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
                handleBarcodeScan(text); // Zmiana wywołania
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

  // Czyste funkcje korzystające z API
  const handleBarcodeScan = async (code) => {
    setStatus('loading');
    const result = await fetchBarcodeData(code);
    if (result.error) {
      setErrorMessage(result.error);
      setStatus('error');
      isProcessingRef.current = false;
      if (scannerRef.current) scannerRef.current.resume();
    } else {
      setFoundProduct(result);
      setStatus('result');
    }
  };

  const handleAiCapture = async () => {
    if (!aiModel || !videoRef.current) return;
    setStatus('loading');
    const predictions = await aiModel.classify(videoRef.current);
    const topResult = predictions[0].className.toLowerCase();

    const prompt = `Prosty system wizyjny rozpoznał obiekt na zdjęciu jako: "${topResult}". Przetłumacz to na język polski jako rodzaj posiłku. Oszacuj kaloryczność i makroskładniki w 100g. 
      Odpowiedz DOKŁADNIE w formacie: NAZWA | KALORIE | BIAŁKO | WĘGLOWODANY | TŁUSZCZE (np. Banan | 89 | 1 | 23 | 0). 
      Jeśli to nie jest jedzenie, zwróć dokładnie słowo: BŁĄD.`;

    const result = await askGeminiForMacros(prompt);

    if (result.error) {
      if (result.error.includes("To nie wygląda jak jedzenie")) {
        // Powrót do starej logiki dla obiektów
        setManualName("Danie ze zdjęcia (Popraw nazwę)");
        setTab('manual');
        setStatus('idle');
      } else {
        // Błąd API lub awaria - używa zapasowego słownika offline
        const nameFallback = translate(topResult);
        setFoundProduct({ name: nameFallback, kcalPer100g: nameFallback.includes('Merci') ? 646 : 250, protein: 0, carbs: 0, fat: 0, fullWeight: 0 });
        setStatus('result');
      }
    } else {
      setFoundProduct(result);
      setStatus('result');
    }
  };

  const handleSmartManualEntry = async () => {
    if (!manualName.trim()) return;
    setStatus('loading');
    const prompt = `Jako profesjonalny dietetyk, oszacuj całkowitą kaloryczność i makroskładniki tego posiłku: "${manualName}". 
      ZASADA 1: Jeśli tekst NIE JEST jedzeniem, zwróć TYLKO słowo: BŁĄD. 
      ZASADA 2: Jeśli to jedzenie, zwróć wynik DOKŁADNIE w formacie: KALORIE | BIAŁKO | WĘGLOWODANY | TŁUSZCZE (np. 450 | 25 | 40 | 15). 
      Zwróć TYLKO same liczby całkowite oddzielone znakiem |. Nie dodawaj słów "kcal" ani "g".`;

    const result = await askGeminiForMacros(prompt);

    if (result.error) {
      setErrorMessage(result.error);
      setStatus('error');
    } else {
      setFoundProduct({ name: manualName, ...result });
      setStatus('result');
    }
  };

  // ----- PONIŻEJ TYLKO HTML (BEZ ZMIAN) -----
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
            <div className="w-full flex justify-center">
              <div id="reader" className={`${tab === 'barcode' ? 'block' : 'hidden'} w-full max-w-[300px] rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black shadow-2xl relative mx-auto`}></div>
            </div>

            {tab === 'ai' && (
              <div className="relative w-full max-w-[300px] rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black shadow-2xl mx-auto">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
            )}

            {tab === 'ai' && <button onClick={handleAiCapture} className="mt-8 w-20 h-20 rounded-full bg-[#00E676] text-black shadow-2xl active:scale-90 flex items-center justify-center border-[6px] border-[#0d0d12] mx-auto">📷</button>}

            {tab === 'barcode' && (
              <div className="flex gap-2 p-1 bg-white/5 rounded-3xl border border-white/10 mt-10 w-full max-w-[300px] italic mx-auto shadow-lg">
                <input type="text" placeholder="Wpisz kod ręcznie..." className="flex-1 bg-transparent p-4 outline-none text-xs text-[#00E676] font-bold" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
                <button onClick={() => handleBarcodeScan(manualCode)} className="bg-white text-black px-6 rounded-2xl font-black text-xs uppercase active:scale-95 transition-transform">ok</button>
              </div>
            )}
          </div>
        )}

        {tab === 'manual' && status === 'idle' && (
          <div className="w-full bg-[#1c1c24] p-8 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in flex flex-col gap-6">
            <h2 className="text-xl font-black italic uppercase text-center mb-2">Opisz co zjadłeś</h2>
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest -mt-4 mb-2">AI wyliczy za Ciebie kalorie</p>

            <div className="relative w-full">
              <textarea
                placeholder="np. 2 kromki chleba z serem..."
                className="bg-black/40 p-5 pr-16 rounded-3xl outline-none text-white font-bold border border-white/5 placeholder-gray-600 h-32 resize-none text-sm w-full"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              <button
                onClick={startListening}
                className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-[#00E676]/20 text-[#00E676] hover:bg-[#00E676]/40 active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.39-.9.88 0 2.76-2.24 5.01-5.01 5.01s-5.01-2.25-5.01-5.01c0-.49-.41-.88-.9-.88s-.89.39-.89.88c0 3.16 2.45 5.76 5.51 6.13V20h-3c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-3v-1.98c3.06-.37 5.51-2.97 5.51-6.13 0-.49-.4-.88-.89-.88z" /></svg>
              </button>
            </div>

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