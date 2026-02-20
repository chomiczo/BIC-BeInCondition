import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onClose, onScan }) {
  const [tab, setTab] = useState('barcode');
  const videoRef = useRef(null);
  const scannerRef = useRef(null); // Ref do instancji skanera
  const isProcessingRef = useRef(false); // Blokada wielokrotnego skanu
  
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [weight, setWeight] = useState(100);
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState({ name: '', kcalPer100g: 0, fullWeight: 0 });

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
      'piggy bank': 'Merci 🍬', 'shower cap': 'Merci 🍬', 'packet': 'Merci 🍬'
    };
    const lower = eng.toLowerCase();
    for (let key in dict) if (lower.includes(key)) return dict[key];
    return eng;
  };

  useEffect(() => {
    let html5QrCode;
    let stream = null;

    const startScanner = async () => {
      try {
        if (tab === 'barcode') {
          isProcessingRef.current = false; // Reset przy zmianie zakładki
          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" }, 
            { fps: 15, qrbox: 280 }, 
            (text) => {
              // Kluczowa poprawka: Jeśli już coś przetwarzamy, ignoruj kolejne klatki
              if (!isProcessingRef.current) {
                isProcessingRef.current = true;
                html5QrCode.pause(true); // Pauzujemy kamerę po sukcesie
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
        const q = data.product.quantity || "";
        setFoundProduct({ 
          name: data.product.product_name || "Nieznany produkt", 
          kcalPer100g: kcal, 
          fullWeight: parseInt(q) || 0 
        });
        if (parseInt(q) > 0) setWeight(parseInt(q));
        setStatus('result');
      } else { 
        alert("Produkt nieznany w bazie OFF"); 
        isProcessingRef.current = false;
        if (scannerRef.current) scannerRef.current.resume();
        setStatus('idle'); 
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
    
    const isFood = foodKeywords.some(keyword => topResult.includes(keyword)) || topResult.includes('merci');
    if (!isFood) {
      setErrorMessage(`Wykryto: ${topResult}. To nie jedzenie!`);
      setStatus('error');
      return;
    }

    const name = translate(predictions[0].className);
    setFoundProduct({ name: name, kcalPer100g: name.includes('Merci') ? 646 : 250, fullWeight: 0 });
    setStatus('result');
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d12] z-[200] flex flex-col items-center text-white overflow-y-auto pb-10">
      {/* Tab Switcher */}
      <div className="flex bg-[#1a1a1a] p-4 gap-3 border-b border-white/10 w-full sticky top-0 z-50">
        <button onClick={() => {setTab('barcode'); setStatus('idle');}} className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${tab==='barcode'?'bg-[#00E676] text-black':'text-gray-500 bg-white/5'}`}>KOD KRESKOWY (QR)</button>
        <button onClick={() => {setTab('ai'); setStatus('idle');}} className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${tab==='ai'?'bg-[#00E676] text-black':'text-gray-500 bg-white/5'}`}>AI</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-sm">
        {status === 'idle' && (
            <div className="w-full flex flex-col items-center">
                <div id="reader" className={`${tab==='barcode'?'block':'hidden'} w-full rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black shadow-2xl relative`}>
                    <div className="absolute inset-0 border-[40px] border-[#0d0d12]/40 pointer-events-none z-20"></div>
                </div>
                {tab === 'ai' && <div className="relative w-full rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black shadow-2xl"><video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /></div>}
                {tab === 'ai' && <button onClick={handleAiCapture} className="mt-8 w-20 h-20 rounded-full bg-[#00E676] text-black shadow-2xl active:scale-90 flex items-center justify-center border-[6px] border-[#0d0d12]">📷</button>}
                {tab === 'barcode' && <div className="flex gap-2 p-1 bg-white/5 rounded-3xl border border-white/10 mt-10 w-full italic"><input type="text" placeholder="Wpisz kod..." className="flex-1 bg-transparent p-4 outline-none text-xs text-[#00E676] font-bold" value={manualCode} onChange={(e)=>setManualCode(e.target.value)} /><button onClick={()=>fetchProduct(manualCode)} className="bg-white text-black px-6 rounded-2xl font-black text-xs uppercase">ok</button></div>}
            </div>
        )}

        {status === 'loading' && <div className="flex flex-col items-center gap-4"><div className="animate-spin h-12 w-12 border-4 border-[#00E676] border-t-transparent rounded-full"></div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pobieranie danych...</p></div>}

        {status === 'error' && (
          <div className="bg-white/5 p-10 rounded-[3rem] border-2 border-red-500 text-center animate-in zoom-in">
            <span className="text-5xl mb-4 block">🚫</span>
            <h2 className="text-lg font-black text-red-500 mb-2 uppercase">Nie jedzenie!</h2>
            <p className="text-gray-400 text-xs mb-8 italic">{errorMessage}</p>
            <button onClick={()=>{setStatus('idle'); isProcessingRef.current=false; if(scannerRef.current) scannerRef.current.resume();}} className="w-full py-4 bg-white/10 rounded-2xl font-black text-[10px] uppercase">Ponów</button>
          </div>
        )}

        {status === 'result' && (
          <div className="bg-[#1c1c24] p-8 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in w-full text-center italic">
            <h1 className="text-2xl font-black mb-6 text-white uppercase tracking-tighter leading-tight">{foundProduct.name}</h1>
            <div className="bg-black/40 p-8 rounded-[2.5rem] mb-8 border border-white/5">
                <input type="number" className="bg-transparent text-7xl font-black text-[#00E676] w-full text-center outline-none mb-4" value={weight} onChange={(e)=>setWeight(e.target.value)} />
                <div className="flex justify-center gap-2">
                    {[-50, 50].map(v => <button key={v} onClick={()=>setWeight(prev => Math.max(1, parseInt(prev) + v))} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black border border-white/5 active:bg-[#00E676] active:text-black transition-all">{v > 0 ? `+${v}` : v}g</button>)}
                </div>
            </div>
            <button onClick={() => onScan(Math.round(foundProduct.kcalPer100g * weight / 100))} className="w-full py-6 bg-[#00E676] text-black font-black rounded-3xl uppercase tracking-widest shadow-lg shadow-[#00E676]/20 active:scale-95">Dodaj {Math.round(foundProduct.kcalPer100g * weight / 100)} kcal</button>
            <button onClick={()=>{setStatus('idle'); isProcessingRef.current=false; if(scannerRef.current) scannerRef.current.resume();}} className="mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Anuluj i skanuj ponownie</button>
          </div>
        )}
      </div>
      
      <button onClick={onClose} className="mt-auto mb-10 p-4 text-gray-700 font-black uppercase text-[10px] tracking-[0.5em] hover:text-white transition-colors">Zamknij</button>
    </div>
  );
}