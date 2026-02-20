import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onClose, onScan }) {
  const [tab, setTab] = useState('barcode');
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [weight, setWeight] = useState(100);
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState({ name: '', kcalPer100g: 0, fullWeight: 0 });

  const aiModel = window.globalAiModel;

  // TWÓJ SŁOWNIK JEDZENIA
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
          html5QrCode = new Html5Qrcode("reader");
          await html5QrCode.start({ facingMode: "environment" }, { fps: 25, qrbox: 280 }, (text) => fetchProduct(text));
        } else if (tab === 'ai') {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
          if (videoRef.current) videoRef.current.srcObject = stream;
        }
      } catch (err) { console.error(err); }
    };
    startScanner();
    return () => {
      if (html5QrCode?.isScanning) html5QrCode.stop().then(() => html5QrCode.clear());
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [tab]);

  const fetchProduct = async (code) => {
    setStatus('loading');
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
    const data = await res.json();
    if (data.status === 1) {
      const kcal = data.product.nutriments['energy-kcal_100g'] || 0;
      setFoundProduct({ name: data.product.product_name, kcalPer100g: kcal, fullWeight: parseInt(data.product.quantity) || 0 });
      if (parseInt(data.product.quantity) > 0) setWeight(parseInt(data.product.quantity));
      setStatus('result');
    } else { alert("Nie znaleziono"); setStatus('idle'); }
  };

  const handleAiCapture = async () => {
    if (!aiModel || !videoRef.current) return;
    setStatus('loading');
    const predictions = await aiModel.classify(videoRef.current);
    const topResult = predictions[0].className.toLowerCase();
    
    const isFood = foodKeywords.some(keyword => topResult.includes(keyword)) || topResult.includes('merci');
    if (!isFood) {
      setErrorMessage(`Wykryto: ${topResult}. To nie wygląda na jedzenie!`);
      setStatus('error');
      return;
    }

    const name = translate(predictions[0].className);
    setFoundProduct({ name, kcalPer100g: name.includes('Merci') ? 646 : 250, fullWeight: 0 });
    setStatus('result');
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d12] z-[100] flex flex-col items-center text-white">
      <div className="flex bg-[#1a1a1a] p-4 gap-3 border-b border-white/10 w-full">
        <button onClick={() => {setTab('barcode'); setStatus('idle');}} className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${tab==='barcode'?'bg-[#00E676] text-black':'text-gray-500 bg-white/5'}`}>KOD KRESKOWY (QR)</button>
        <button onClick={() => {setTab('ai'); setStatus('idle');}} className={`flex-1 py-4 rounded-2xl font-black text-[11px] ${tab==='ai'?'bg-[#00E676] text-black':'text-gray-500 bg-white/5'}`}>AI</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-sm">
        {status === 'idle' && (
            <div className="w-full flex flex-col items-center">
                <div id="reader" className={`${tab==='barcode'?'block':'hidden'} w-full rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black mb-8`}></div>
                {tab === 'ai' && <div className="relative w-full rounded-[3rem] border-2 border-[#00E676]/30 aspect-square overflow-hidden bg-black mb-8 shadow-2xl"><video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /></div>}
                {tab === 'ai' && <button onClick={handleAiCapture} className="w-24 h-24 rounded-full bg-[#00E676] text-black text-3xl shadow-2xl active:scale-90 border-[8px] border-[#0d0d12]">📷</button>}
                {tab === 'barcode' && <div className="flex gap-2 p-1 bg-white/5 rounded-3xl border border-white/10 italic w-full"><input type="text" placeholder="Wpisz kod..." className="flex-1 bg-transparent p-4 outline-none text-xs text-[#00E676] font-bold" value={manualCode} onChange={(e)=>setManualCode(e.target.value)} /><button onClick={()=>fetchProduct(manualCode)} className="bg-white text-black px-8 rounded-2xl font-black text-xs">OK</button></div>}
            </div>
        )}

        {status === 'error' && (
          <div className="bg-white/5 p-10 rounded-[4rem] border-2 border-red-500 shadow-2xl text-center">
            <span className="text-6xl mb-6 block">🚫</span>
            <h2 className="text-xl font-black text-red-500 mb-4 uppercase italic">Nie jedzenie!</h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed italic">{errorMessage}</p>
            <button onClick={()=>setStatus('idle')} className="w-full py-5 bg-white/10 rounded-2xl font-black text-xs uppercase italic">Ponów próbę</button>
          </div>
        )}

        {status === 'result' && (
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[4rem] border border-white/10 shadow-2xl animate-in zoom-in w-full text-center">
            <h1 className="text-3xl font-black mb-8 italic capitalize leading-tight italic">{foundProduct.name}</h1>
            <div className="bg-black/40 p-10 rounded-[3rem] mb-10 border border-white/5 italic">
                <input type="number" className="bg-transparent text-8xl font-black text-[#00E676] w-full text-center outline-none italic mb-4 italic" value={weight} onChange={(e)=>setWeight(e.target.value)} />
                <div className="flex justify-center gap-3 italic">
                    {[-50, 50].map(v => <button key={v} onClick={()=>setWeight(prev => Math.max(1, parseInt(prev) + v))} className="px-5 py-3 bg-white/5 rounded-2xl text-[11px] font-black border border-white/5">{v > 0 ? `+${v}` : v}g</button>)}
                </div>
            </div>
            <button onClick={() => onScan(Math.round(foundProduct.kcalPer100g * weight / 100))} className="w-full py-7 bg-[#00E676] text-black font-black rounded-3xl uppercase tracking-widest shadow-2xl italic">DODAJ POSIŁEK</button>
          </div>
        )}
      </div>
      <button onClick={onClose} className="m-12 p-2 text-gray-700 font-black uppercase text-[10px] hover:text-white transition-colors">Zamknij</button>
    </div>
  );
}