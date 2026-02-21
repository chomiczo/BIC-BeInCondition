import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini API

export default function Scanner({ onClose, onScan }) {
  const [tab, setTab] = useState('barcode');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [weight, setWeight] = useState(100);
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState({ name: '', kcalPer100g: 0, fullWeight: 0 });

  const [manualName, setManualName] = useState('');

  const aiModel = window.globalAiModel;


  // Słownik idiotoodporny (Twoja lista)
  const foodKeywords = [

    // OGÓLNE
    'food', 'meal', 'dish', 'snack', 'dessert', 'breakfast', 'lunch', 'dinner', 'supper',
    'jedzenie', 'posiłek', 'danie', 'przekąska', 'deser', 'śniadanie', 'obiad', 'kolacja',

    // OWOCE
    'fruit', 'apple', 'banana', 'orange', 'mandarin', 'grapefruit', 'lemon', 'lime',
    'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry', 'cherry',
    'grape', 'watermelon', 'melon', 'pineapple', 'mango', 'kiwi', 'peach', 'pear',
    'plum', 'apricot', 'nectarine', 'pomegranate', 'fig', 'date', 'papaya', 'guava',
    'coconut', 'avocado',

    'owoc', 'jabłko', 'banan', 'pomarańcza', 'mandarynka', 'cytryna', 'limonka',
    'truskawka', 'borówka', 'malina', 'jeżyna', 'żurawina', 'wiśnia', 'czereśnia',
    'winogrono', 'arbuz', 'melon', 'ananas', 'mango', 'kiwi', 'brzoskwinia',
    'gruszka', 'śliwka', 'morela', 'granat', 'figa', 'daktyl', 'papaja', 'gujawa',
    'kokos', 'awokado',

    // WARZYWA
    'vegetable', 'carrot', 'potato', 'tomato', 'cucumber', 'lettuce', 'onion', 'garlic',
    'broccoli', 'cauliflower', 'cabbage', 'spinach', 'kale', 'zucchini', 'eggplant',
    'pepper', 'chili', 'pumpkin', 'corn', 'peas', 'bean', 'asparagus', 'leek',
    'radish', 'beetroot', 'celery', 'mushroom', 'olive',

    'warzywo', 'marchew', 'ziemniak', 'pomidor', 'ogórek', 'sałata', 'cebula',
    'czosnek', 'brokuł', 'kalafior', 'kapusta', 'szpinak', 'cukinia', 'bakłażan',
    'papryka', 'dynia', 'kukurydza', 'groszek', 'fasola', 'szparag', 'por',
    'rzodkiewka', 'burak', 'seler', 'pieczarka', 'oliwka',

    // MIĘSO
    'meat', 'beef', 'pork', 'chicken', 'turkey', 'duck', 'goose', 'lamb', 'veal',
    'bacon', 'ham', 'sausage', 'salami', 'pepperoni', 'meatball', 'steak', 'ribs',

    'mięso', 'wołowina', 'wieprzowina', 'kurczak', 'indyk', 'kaczka', 'gęś',
    'jagnięcina', 'cielęcina', 'bekon', 'szynka', 'kiełbasa', 'klops', 'stek', 'żeberka',

    // RYBY I OWOCE MORZA
    'fish', 'salmon', 'tuna', 'cod', 'trout', 'shrimp', 'prawn', 'crab', 'lobster',
    'oyster', 'mussel', 'clam', 'squid', 'octopus', 'anchovy', 'sardine',

    'ryba', 'łosoś', 'tuńczyk', 'dorsz', 'pstrąg', 'krewetka', 'krab', 'homar',
    'ostryga', 'małż', 'kalmar', 'ośmiornica', 'anchois', 'sardynka',

    // NABIAŁ
    'milk', 'cheese', 'butter', 'yogurt', 'cream', 'icecream', 'kefir',
    'mozzarella', 'cheddar', 'parmesan', 'feta', 'ricotta', 'cottage', 'egg',

    'mleko', 'ser', 'masło', 'jogurt', 'śmietana', 'lody', 'kefir',
    'mozzarella', 'cheddar', 'parmezan', 'feta', 'ricotta', 'twaróg', 'jajko',

    // ZBOŻA I PIECZYWO
    'bread', 'bagel', 'baguette', 'bun', 'toast', 'croissant', 'roll',
    'pasta', 'spaghetti', 'penne', 'macaroni', 'noodle', 'rice', 'risotto',
    'quinoa', 'barley', 'oat', 'cereal', 'flour', 'tortilla',

    'chleb', 'bułka', 'bagietka', 'tost', 'rogalik', 'makaron', 'ryż',
    'kasza', 'jęczmień', 'owies', 'płatki', 'mąka', 'tortilla',

    // FAST FOOD
    'pizza', 'burger', 'hamburger', 'cheeseburger', 'hotdog', 'fries',
    'kebab', 'wrap', 'taco', 'burrito', 'nachos', 'sandwich',

    'pizza', 'burger', 'hamburger', 'cheeseburger', 'hotdog', 'frytki',
    'kebab', 'wrap', 'taco', 'burrito', 'nachosy', 'kanapka',

    // DANIA GOTOWE
    'soup', 'broth', 'ramen', 'carbonara', 'lasagna', 'curry', 'stew',
    'dumpling', 'pierogi', 'gnocchi', 'omelette', 'pancake', 'waffle',

    'zupa', 'rosół', 'ramen', 'carbonara', 'lasagne', 'curry', 'gulasz',
    'pierogi', 'kopytka', 'omlet', 'naleśnik', 'gofr',

    // SŁODYCZE
    'chocolate', 'candy', 'sweet', 'cake', 'cookie', 'biscuit', 'brownie',
    'donut', 'doughnut', 'cupcake', 'muffin', 'pie', 'tart', 'pudding',
    'jelly', 'jam', 'honey', 'marshmallow',

    'czekolada', 'cukierek', 'słodycz', 'ciasto', 'ciastko', 'herbatnik',
    'brownie', 'pączek', 'babeczka', 'muffin', 'placek', 'tarta',
    'budyń', 'galaretka', 'dżem', 'miód', 'pianka',

    // ORZECHY I NASIONA
    'nut', 'almond', 'walnut', 'peanut', 'cashew', 'hazelnut', 'pistachio',
    'sunflower', 'sesame', 'chia', 'flax',

    'orzech', 'migdał', 'orzech włoski', 'arachid', 'nerkowiec',
    'orzech laskowy', 'pistacja', 'słonecznik', 'sezam', 'chia', 'siemię lniane',

    // CZEKOLADA – rodzaje
    'chocolate', 'dark chocolate', 'milk chocolate', 'white chocolate',
    'chocolate bar', 'chocolate candy', 'chocolate block',
    'czekolada', 'gorzka czekolada', 'mleczna czekolada', 'biała czekolada',
    'czekolada z orzechami', 'czekolada z karmelem', 'czekolada nadziewana',
    'pralina', 'trufla', 'czekoladka', 'kostka czekolady',

    // BATONY – ogólne
    'bar', 'chocolate bar', 'candy bar', 'protein bar', 'energy bar',
    'baton', 'baton czekoladowy', 'baton proteinowy', 'baton energetyczny',
    'baton zbożowy', 'batonik',

    // Popularne batony (marki)
    'Snickers', 'Mars', 'Bounty', 'Twix', 'KitKat', 'Kinder Bueno',
    'Milky Way', 'Lion', 'Kinder Chocolate', 'Kinder Country',
    'Prince Polo', 'Grześki', '3Bit', 'Knoppers',
    'Toffifee', 'Ferrero Rocher', 'Raffaello',

    'candy', 'sweets', 'bonbon', 'toffee', 'caramel', 'fudge',
    'gummy', 'gummy bear', 'lollipop', 'marshmallow',
    'cukierek', 'cukierki', 'krówka', 'karmel', 'toffi',
    'żelki', 'miś żelek', 'lizak', 'landrynka', 'draże',

    'cookie', 'biscuit', 'shortbread', 'oreo', 'gingerbread',
    'ciastko', 'herbatnik', 'piernik', 'oreo', 'wafel', 'wafelek',
    'andrut', 'ptasie mleczko',

    // CHIPSY / CZIPSY
    'chips', 'potato chips', 'crisps', 'nacho chips', 'tortilla chips',
    'corn chips', 'kettle chips', 'ridge chips',
    'czipsy', 'chipsy', 'chips', 'czips', 'chrupki',

    // Smaki
    'salted chips', 'salted crisps', 'cheese chips', 'cheese crisps',
    'bbq chips', 'barbecue chips', 'paprika chips', 'onion chips',
    'sour cream chips', 'chili chips',

    'chipsy solone', 'chipsy serowe', 'chipsy paprykowe',
    'chipsy cebulowe', 'chipsy barbecue', 'chipsy bbq',
    'chipsy śmietankowe', 'chipsy o smaku sera',
    'chipsy o smaku papryki', 'chipsy o smaku cebuli',

    // Nachosy
    'nachos', 'nacho', 'nachos with cheese', 'cheese nachos',
    'nachosy', 'nachosy z serem',

    // Popularne marki
    'Lays', 'Lay\'s', 'Pringles', 'Doritos', 'Cheetos', 'Tostitos',
    'Crunchips', 'Lorenz', 'Takis',

    'pretzel', 'pretzels', 'popcorn', 'salted popcorn',
    'krakers', 'krakersy', 'paluszki', 'precel', 'popcorn',
    'prażynki', 'chrupki kukurydziane'


  ];

  const translate = (eng) => {
    const dict = {
      'banana': 'Banan 🍌', 'strawberry': 'Truskawka 🍓', 'pizza': 'Pizza 🍕',
      'hamburger': 'Burger 🍔', 'jelly fish': 'Merci 🍬', 'diaper, nappy, napkin': 'Merci 🍬',
      'piggy bank': 'Merci 🍬', 'shower cap': 'Merci 🍬', 'packet': 'Przekąska w paczce 🍬',
      'plastic bag': 'Przekąska w paczce 🍬', 'wrapper': 'Baton/Cukierek 🍫', 'bag': 'Przekąska 🍿',
      'meatloaf': 'Kanapka z wędliną 🥪', 'potpie': 'Pieczywo z dodatkiem 🥯', 'bagel': 'Pieczywo 🥯',
      'beigel': 'Pieczywo 🥯'
    };
    const lower = eng.toLowerCase();
    for (let key in dict) if (lower.includes(key)) return dict[key];
    return `Coś do jedzenia (${eng})`;
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
        const kcal = data.product.nutriments['energy-kcal_100g'] || 0;
        setFoundProduct({ name: data.product.product_name || "Nieznany produkt", kcalPer100g: kcal });
        setStatus('result');
      } else {
        // PŁYNNE PRZEJŚCIE: Brak w bazie = Wpisz ręcznie (Zero alertów!)
        setManualName(`Kod: ${code} (Opisz posiłek słownie)`);
        setTab('manual');
        setStatus('idle');
        isProcessingRef.current = false;
        if (scannerRef.current) scannerRef.current.resume();
      }
    } catch (e) {
      isProcessingRef.current = false;
      setStatus('idle');
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

      const prompt = `Prosty system wizyjny rozpoznał obiekt na zdjęciu jako: "${topResult}". Przetłumacz to na język polski jako rodzaj posiłku. (Jeśli to "plastic bag", "wrapper" lub podobne, nazwij to "Przekąska w opakowaniu"). Oszacuj kaloryczność w 100g. Odpowiedz dokładnie w formacie: NAZWA | KALORIE (np. Banan | 89). Jeśli to absolutnie nie ma związku z jedzeniem, zwróć: Nieznany obiekt | 0`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const parts = responseText.split('|');

      if (parts.length >= 2) {
        const aiName = parts[0].trim();
        const aiKcal = parseInt(parts[1].replace(/\D/g, ''));

        if (aiName.toLowerCase().includes("nieznany") || isNaN(aiKcal) || aiKcal === 0) {
          // Płynne przejście do trybu ręcznego zamiast "czerwonego błędu"
          setManualName("Danie ze zdjęcia (Popraw nazwę)");
          setTab('manual');
          setStatus('idle');
        } else {
          setFoundProduct({ name: aiName, kcalPer100g: aiKcal, fullWeight: 0 });
          setStatus('result');
        }
      } else {
        setManualName("Nie udało się rozpoznać. Wpisz nazwę.");
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

      const prompt = `Jako profesjonalny dietetyk, oszacuj całkowitą kaloryczność tego posiłku: "${manualName}". Zwróć TYLKO I WYŁĄCZNIE samą liczbę całkowitą (np. 450). Nie dodawaj tekstu "kcal", słów, znaków zapytania ani wyjaśnień. Jeśli nie masz pewności, podaj średnią wartość dla takiej porcji.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const estimatedKcal = parseInt(responseText.replace(/\D/g, '')); // Wyciąga same cyfry

      if (!isNaN(estimatedKcal)) {
        setFoundProduct({ name: manualName, kcalPer100g: estimatedKcal, fullWeight: 0 });
        setWeight(100); // 100% oznacza, że bierzemy pełną oszacowaną wartość
        setStatus('result');
      } else {
        setErrorMessage("AI nie zrozumiało posiłku. Spróbuj opisać go dokładniej (np. 2 kromki chleba z serem).");
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Błąd połączenia z AI. Upewnij się, że dodałeś poprawny klucz w pliku .env");
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
        {tab === 'manual' && (
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

            <button onClick={() => onScan(foundProduct.kcalPer100g)} className="w-full py-6 bg-[#00E676] text-black font-black rounded-3xl uppercase tracking-widest shadow-lg active:scale-95">Dodaj {foundProduct.kcalPer100g} kcal</button>
            <button onClick={() => { setStatus('idle'); isProcessingRef.current = false; }} className="mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Anuluj</button>
          </div>
        )}
      </div>
      <button onClick={onClose} className="mt-auto mb-10 p-4 text-gray-700 font-black uppercase text-[10px] tracking-[0.5em] hover:text-white">Zamknij Skaner</button>
    </div>
  );
}