// Słownik
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
    'prażynki', 'chrupki kukurydziane',

    // NAPOJE (BEVERAGES)
    'drink', 'beverage', 'water', 'coffee', 'tea', 'juice', 'soda', 'cola', 'pepsi',
    'sprite', 'energy drink', 'beer', 'wine', 'alcohol', 'vodka', 'smoothie', 'shake',
    'napój', 'woda', 'kawa', 'herbata', 'sok', 'kompot', 'oranżada', 'napój gazowany',
    'piwo', 'wino', 'alkohol', 'wódka', 'drinek',

    // SOSY, TŁUSZCZE I DODATKI (CONDIMENTS)
    'sauce', 'ketchup', 'mayo', 'mayonnaise', 'mustard', 'dressing', 'oil', 'olive oil',
    'vinegar', 'syrup', 'peanut butter', 'jam',
    'sos', 'majonez', 'musztarda', 'olej', 'oliwa', 'margaryna', 'smalec', 'dressing',
    'syrop', 'masło orzechowe',

    // TYPOWO POLSKIE DANIA
    'schabowy', 'bigos', 'żurek', 'barszcz', 'gołąbki', 'krokiet', 'zapiekanka', 'oscypek',
    'fasolka po bretońsku', 'flaki', 'leczo',

    // INNE BRAKUJĄCE (FITNESS)
    'protein', 'whey', 'creatine', 'białko', 'odżywka białkowa', 'skyr', 'kreatyna', 'izolat',

    // PRZYPRAWY I DODATKI DO PIECZENIA
    'sugar', 'salt', 'pepper', 'cinnamon', 'cocoa', 'yeast', 'baking powder',
    'cukier', 'sól', 'pieprz', 'cynamon', 'kakao', 'drożdże', 'proszek do pieczenia',

    // DIETA WEGE I DANIA ŚWIATA
    'tofu', 'seitan', 'hummus', 'falafel', 'sushi', 'soya', 'vegan', 'veggie',
    'wege', 'wegańskie', 'wegetariańskie', 'sajgonki', 'pad thai', 'tortilla',

    // CODZIENNE POLSKIE ŚNIADANIA I KOLACJE
    'jajecznica', 'owsianka', 'parówka', 'parówki', 'twarożek', 'kanapka', 'kanapki',
    'tosty', 'sałatka', 'surówka', 'omlet', 'kaszka', 'musli', 'płatki z mlekiem',

    // POPULARNE MARKI (FAST FOOD I NAPOJE)
    'mcdonalds', 'mcdonald', 'kfc', 'burger king', 'subway', 'starbucks', 'costa',
    'monster', 'red bull', 'izotonik', 'powerade', 'oshee',

    // TERMINY DIETETYCZNE (często wpisywane ręcznie)
    'keto', 'low carb', 'gluten free', 'bezglutenowe', 'bez laktozy', 'fit', 'light', 'zero',
    // POLSKIE ZUPY I TRADYCYJNE DANIA
    'pomidorowa', 'ogórkowa', 'krupnik', 'pieczarkowa', 'grochówka', 'kapuśniak',
    'mielony', 'placki ziemniaczane', 'pyzy', 'knedle', 'kopytka', 'kaszanka', 'pasztet',

    // POLSKIE WYPIEKI I SŁODYCZE (często wpisywane z palca)
    'sernik', 'szarlotka', 'makowiec', 'pączek', 'faworki', 'ptysie', 'eklery',
    'chałwa', 'sezamki', 'delicje', 'jeżyki', 'katarzynki', 'rurki z kremem',

    // MODNE NAPOJE I NABIAŁ
    'matcha', 'yerba', 'kombucha', 'kwas chlebowy', 'maślanka', 'zsiadłe mleko',
    'mleko owsiane', 'mleko migdałowe', 'mleko sojowe',

    // DODATKI DO GOTOWANIA
    'mąka pszenna', 'mąka żytnia', 'żelatyna', 'agar', 'kapary', 'suszone pomidory', 'pesto',
    // KAWY I NAPOJE KAFEJNIANE
    'espresso', 'cappuccino', 'latte', 'macchiato', 'americano', 'flat white', 'mocha',
    'frappe', 'boba', 'bubble tea', 'gorąca czekolada', 'kakao',

    // ALKOHOLE SZCZEGÓŁOWE
    'cydr', 'prosecco', 'szampan', 'rum', 'gin', 'tequila', 'whisky', 'burbon',
    'nalewka', 'grzaniec', 'drinki', 'mojito', 'aperol', 'margarita',

    // KUCHNIA WŁOSKA (DOKŁADNA)
    'ravioli', 'tiramisu', 'panna cotta', 'bruschetta', 'focaccia', 'calzone',
    'tortellini', 'cannoli', 'risotto', 'caprese', 'carpaccio',

    // KUCHNIA AZJATYCKA (DOKŁADNA)
    'udon', 'pho', 'spring rolls', 'dim sum', 'teriyaki', 'wasabi', 'kimchi',
    'bao', 'edamame', 'sriracha', 'sos sojowy', 'tempura', 'tikka masala', 'naan',

    // KUCHNIA MEKSYKAŃSKA I INNE
    'quesadilla', 'fajitas', 'salsa', 'churros', 'jalapeno', 'guacamole',
    'kebab', 'pita', 'baklava', 'tzatziki', 'gyros', 'shoarma',

    // POLSKIE DANIA SPECJALNE / ŚWIĄTECZNE / REGIONALNE
    'uszka', 'kutia', 'karp', 'śledzie', 'zrazy', 'kluski śląskie', 'rolada',
    'rogale świętomarcińskie', 'chłodnik', 'botwinka', 'kompot z suszu', 'moskole',

    // DODATKI FAST FOOD I SNACKI
    'nuggets', 'onion rings', 'krążki cebulowe', 'skrzydełka', 'stripsy',
    'sos czosnkowy', 'sos słodko-kwaśny', 'chrupki', 'kabanosy', 'paluszki serowe',

    // KASZE, ZIARNA I SUPERFOODS
    'komosa ryżowa', 'kasza gryczana', 'kasza jaglana', 'kasza pęczak', 'kasza kuskus',
    'bulgur', 'amarantus', 'tapioka', 'spirulina', 'nasiona konopi', 'jagody goji',

    // INNE BRAKUJĄCE ELEMENTY
    'lody gałkowe', 'lody włoskie', 'sorbet', 'smalec', 'skwarki', 'boczek',
    'kiełki', 'rukola', 'roszponka', 'jarmuż', 'szparagi', 'brukselka',

    // SUPLEMENTY I ŻARGON FITNESS (Kulturystyka)
    'bcaa', 'eaa', 'pre-workout', 'przedtreningówka', 'gainer', 'carbo', 'kolagen',
    'spalacz tłuszczu', 'fat burner', 'elektrolity', 'zma', 'ashwagandha', 'baton proteinowy',
    'szejk białkowy', 'izolat białka', 'wpc', 'wpi', 'kazeina', 'cytrulina', 'beta alanina',

    // EKSTREMALNIE POLSKIE / REGIONALNE / STAROPOLSKIE
    'tatar', 'tatarek', 'galareta', 'zimne nóżki', 'śledź w oleju', 'śledź w śmietanie',
    'ryba po grecku', 'kaczka z jabłkami', 'cebularz', 'pyra z gzikiem', 'proziaki',
    'sękacz', 'makiełki', 'farsz', 'zacierki', 'kluseczki', 'łazanki', 'knysza', 'maczanka',

    // DANIA Z CAŁEGO ŚWIATA (Modne i Specyficzne)
    'poke bowl', 'shakshuka', 'szakszuka', 'halloumi', 'paneer', 'churrasco', 'tapas',
    'paella', 'ceviche', 'empanadas', 'arepas', 'kimchi jjigae', 'bibimbap', 'onigiri',
    'takoyaki', 'okonomiyaki', 'currywurst', 'poutine', 'fish and chips', 'haggis',

    // SŁODYCZE, PRZEKĄSKI, GADŻETY KULINARNE (Drobiazgi)
    'żelki', 'pianki', 'lizak', 'landrynki', 'krówki', 'kukułki', 'raczki', 'michałki',
    'm&m', 'skittles', 'haribo', 'pringles', 'nachosy', 'krakersy', 'słuszki', 'chrupki',
    'popcorn', 'wata cukrowa', 'gofry', 'churros', 'langosz', 'trdelnik', 'kołacz',

    // SKŁADNIKI BAZOWE I DODATKI (Rozszerzenie)
    'smalec gęsi', 'masło klarowane', 'ghee', 'olej kokosowy', 'olej lniany', 'olej z awokado',
    'syrop klonowy', 'syrop z agawy', 'stewia', 'erytrytol', 'ksylitol', 'sacharyna',
    'bułka tarta', 'płatki migdałowe', 'wiórki kokosowe', 'sezam czarny', 'czarnuszka',

    // EGZOTYCZNE OWOCE I WARZYWA
    'marakuja', 'passionfruit', 'kaki', 'persimmon', 'pitaja', 'dragonfruit', 'smoczy owoc',
    'liczi', 'lychee', 'mangostan', 'durian', 'karambola', 'starfruit', 'kumkwat', 'pomelo',
    'yuzu', 'plantan', 'maniok', 'tapioka', 'batat', 'yuca', 'taro', 'kalarepa', 'brukiew',
    'pasternak', 'okra', 'tomatillo', 'jalapeno', 'habanero',

    // EKSTREMALNE POLSKIE REGIONALIZMY I SWOJSKIE JADŁO
    'oscypek', 'bundz', 'bryndza', 'korbacz', 'salceson', 'krupniok', 'żymlok', 'kartacz',
    'babka ziemniaczana', 'kiszka ziemniaczana', 'cebularz', 'obwarzanek', 'podpiwek',
    'kwaśnica', 'zalewajka', 'czernina', 'zupa nic', 'pampuchy', 'kluski na parze', 'knedle',
    'szagówki', 'szpecle', 'śliwowica', 'bimber', 'nalewka', 'miód pitny',

    // SPECJAŁY Z CAŁEGO ŚWIATA (Dokładne)
    'baba ganoush', 'tahini', 'doner', 'souvlaki', 'moussaka', 'paratha', 'dosa', 'idli',
    'samosa', 'vindaloo', 'korma', 'banh mi', 'tom yum', 'soba', 'sashimi', 'nigiri', 'maki',
    'bulgogi', 'enchilada', 'pico de gallo', 'flan', 'gazpacho', 'muffin', 'scone', 'bagel',

    // SERY I NABIAŁ (Szczegółowe)
    'camembert', 'brie', 'gorgonzola', 'roquefort', 'gouda', 'edam', 'emmentaler', 'gruyere',
    'pecorino', 'provolone', 'mascarpone', 'burrata', 'halloumi', 'paneer', 'twaróg', 'kefir',
    'ajran', 'ayran', 'skyr', 'kvarg', 'jogurt grecki',

    // MIĘSA I WĘDLINY (Szczegółowe)
    'polędwica', 'schab', 'karkówka', 'żeberka', 'boczek', 'słonina', 'golonka', 'ozorki',
    'wątróbka', 'żołądki', 'serca', 'kaszanka', 'pasztetowa', 'metka', 'salami', 'chorizo',
    'prosciutto', 'pancetta', 'bresaola', 'pastrami', 'mortadela', 'parówki', 'kabanos',

    // RYBY I OWOCE MORZA (Szczegółowe)
    'karp', 'śledź', 'szprotki', 'makrela', 'halibut', 'sola', 'flądra', 'sandacz', 'szczupak',
    'okoń', 'węgorz', 'mintaj', 'morszczuk', 'dorada', 'okoń morski', 'małże', 'ośmiornica',
    'kalmary', 'krewetki', 'homar', 'langusta', 'ostrygi', 'przegrzebki', 'kawior',

    // PIECZYWO I ZBOŻA (Szczegółowe)
    'chleb na zakwasie', 'chleb żytni', 'pumpernikiel', 'chałka', 'drożdżówka', 'kajzerka',
    'grahamka', 'płatki owsiane', 'płatki jaglane', 'otręby', 'musli', 'granola', 'chrupki',

    // CHEMIKULIA, SOSY I SŁODZIKI
    'msg', 'glutaminian', 'aspartam', 'acesulfam', 'sukraloza', 'sacharyna', 'maltitol',
    'sorbitol', 'agar', 'pektyna', 'guma guar', 'guma ksantanowa', 'sos sriracha', 'hoisin',
    'teriyaki', 'sos rybny', 'sos ostrygowy', 'maggi', 'przyprawa w płynie'

];

const translate = (eng) => {
    const dict = {
        'banana': 'Banan 🍌', 'strawberry': 'Truskawka 🍓', 'pizza': 'Pizza 🍕',
        'hamburger': 'Burger 🍔', 'jelly fish': 'Merci 🍬', 'diaper, nappy, napkin': 'Merci 🍬',
        'piggy bank': 'Merci 🍬', 'shower cap': 'Merci 🍬', 'packet': 'Przekąska w paczce 🍬',
        'plastic bag': 'Przekąska w paczce 🍬', 'wrapper': 'Baton/Cukierek 🍫', 'bag': 'Przekąska 🍿',
        'meatloaf': 'Kanapka z wędliną 🥪', 'potpie': 'Pieczywo z dodatkiem 🥯', 'bagel': 'Pieczywo 🥯',
        'beigel': 'Pieczywo 🥯',
        'cup': 'Kawa lub Herbata ☕',
        'coffee mug': 'Kawa ☕',
        'espresso': 'Kawa ☕',
        'water bottle': 'Woda 💧',
        'wine bottle': 'Wino 🍷',
        'pop bottle': 'Napój gazowany 🥤',
        'granny smith': 'Jabłko 🍏',
        'orange': 'Pomarańcza 🍊',
        'lemon': 'Cytryna 🍋',
        'fig': 'Figa 🍈',
        'pineapple': 'Ananas 🍍',
        'ice lolly': 'Lody na patyku 🍦',
        'french loaf': 'Bagietka 🥖',
        'plate': 'Danie na talerzu 🍽️',
        'bowl': 'Danie w misce 🥣',
        'measuring cup': 'Szejk / Koktajl 🥤',
        'hotdog': 'Hot-Dog 🌭',
        'burrito': 'Burrito / Wrap 🌯',
        // SPECYFICZNE KLASY MOBILENET (AI WIZYJNE):
        'ice cream': 'Lody 🍨',
        'mashed potato': 'Ziemniaki Purée 🥔',
        'bell pepper': 'Papryka 🫑',
        'head cabbage': 'Kapusta 🥬',
        'guacamole': 'Guacamole 🥑',
        'consomme': 'Zupa / Bulion 🥣',
        'trifle': 'Deser 🍮',
        'pudding': 'Budyń / Deser 🍮',
        'grocery store': 'Półka z jedzeniem 🛒', // Czasem AI widzi po prostu cały regał w sklepie!
        'shopping basket': 'Koszyk z zakupami 🛒',
        // NACZYNIA KUCHENNE (MobileNet często widzi je zamiast jedzenia):
        'frying pan': 'Danie z patelni 🍳',
        'wok': 'Danie z woka 🥘',
        'tray': 'Taca z jedzeniem 🍱',
        'baking dish': 'Zapiekanka / Ciasto 🥧',
        'teapot': 'Herbata 🫖',
        'coffeepot': 'Kawa ☕',
        'water jug': 'Dzbanek wody / Sok 💧',
        'pitcher': 'Dzbanek z napojem 🥤',

        // DZIWNE, ALE CZĘSTE KLASY W MOBILENET:
        'cauliflower': 'Kalafior 🥦',
        'artichoke': 'Karczoch / Warzywo 🥬',
        'spaghetti squash': 'Makaron / Spaghetti 🍝',
        'dough': 'Ciasto (Surowe) / Wypiek 🥐',
        'eggnog': 'Koktajl / Napój mleczny 🥛',
        'chocolate sauce': 'Sos czekoladowy / Deser 🍫',
        // ABSURDALNE KLASY MOBILENET (AI często myli te przedmioty z jedzeniem wokół nich):
        'refrigerator': 'Jedzenie z lodówki 🧊',
        'carton': 'Karton z napojem / Mleko 🧃',
        'menu': 'Danie z karty 📜',
        'goblet': 'Kieliszek / Napój 🍷',
        'cocktail shaker': 'Szejk / Koktajl 🍹',
        'paper towel': 'Przekąska / Jedzenie z ręki 🥪', // AI widzi ręcznik papierowy pod kanapką

        // RZADKIE OWOCE I WARZYWA Z BAZY IMAGENET (wbudowane w Twoje AI):
        'jackfruit': 'Owoc (Chlebowiec) 🍈',
        'custard apple': 'Owoc (Cherimoja) 🍈',
        'butternut squash': 'Dynia 🎃',
        'acorn squash': 'Dynia 🎃',
        'cardoon': 'Karczoch / Warzywo 🥬',
        'mushroom': 'Grzyb / Pieczarka 🍄',

        // POZOSTAŁE DANIA Z BAZY AI:
        'hot pot': 'Gorący kociołek / Zupa 🍲',
        'pretzel': 'Precel / Przekąska 🥨',
        'meat loaf': 'Pieczeń mięsna 🥩',

        // URZĄDZENIA KUCHENNE (Jeśli zrobisz zdjęcie w kuchni, AI może to złapać):
        'toaster': 'Tost / Grzanka 🍞',
        'microwave': 'Danie z mikrofali 🍱',
        'espresso maker': 'Kawa z ekspresu ☕',
        'saltshaker': 'Sól / Przyprawy 🧂',
        'mixing bowl': 'Składniki w misce 🥣',
        'ladle': 'Zupa (z chochli) 🥣',
        'wooden spoon': 'Potrawa z łyżki 🥄',
        'cleaver': 'Mięso (przygotowanie) 🥩',
        'corkscrew': 'Wino 🍷',
        'bottle opener': 'Napój z butelki / Piwo 🍺',

        // MIEJSCA I OTOCZENIE (AI czasem widzi całe tło zamiast posiłku):
        'dining table': 'Posiłek na stole 🍽️',
        'bakery': 'Wypieki / Chleb 🥖',
        'meat market': 'Mięso / Wędliny 🥩',

        // BRAKUJĄCE OWOCE / KLASY IMAGENET:
        'pomegranate': 'Granat 🍎',
        'ear': 'Kukurydza 🌽',
        'hip': 'Dzika róża / Owoce 🍒',
        'acorn': 'Orzechy / Żołędzie 🌰',
        'red wine': 'Czerwone wino 🍷',
        'tea cup': 'Filiżanka herbaty 🫖',
        'beer glass': 'Kufel piwa 🍺',

        // RESZTKI BAZY IMAGENET: SPRZĘT I NARZĘDZIA KUCHENNE:
        'strainer': 'Makaron / Odcedzone jedzenie 🍝',
        'colander': 'Warzywa w durszlaku 🥦',
        'crock pot': 'Gulasz / Wolnowar 🍲',
        'spatula': 'Potrawa z patelni 🍳',
        'can opener': 'Konserwa / Puszka jedzenia 🥫',
        'beaker': 'Płyn / Napój 🥤',
        'vase': 'Woda / Napój 💧', // Czasem AI myli dzbanek z wazonem

        // RESZTKI BAZY IMAGENET: SUROWE SKŁADNIKI I ZWIERZĘTA (Jako jedzenie):
        'dungeness crab': 'Krab / Owoce morza 🦀',
        'american lobster': 'Homar 🦞',
        'king crab': 'Krab Królewski 🦀',
        'crayfish': 'Rak / Owoce morza 🦞',
        'hen': 'Drób / Kurczak 🍗',
        'cock': 'Drób / Kurczak 🍗',
        'pig': 'Wieprzowina 🥩',
        'ox': 'Wołowina 🥩',

        // DODATKOWE BŁĘDY AI DLA OPAKOWAŃ:
        'envelope': 'Herbata w torebce 🫖', // AI myli płaską torebkę herbaty z kopertą

        // HALUCYNACJE KUCHENNE IMAGENET:
        'whisk': 'Masa / Ciasto 🥣',
        'can, tin, tin can': 'Konserwa / Puszka jedzenia 🥫',
        'pill bottle': 'Witaminy / Suplementy 💊',
        'hair spray': 'Bita śmietana / Spray do smażenia 🧴', // AI myli puszki ze sprayem!
        'barrel, cask': 'Beczka wina / Piwa 🍺',
        'bucket, pail': 'Kubełek jedzenia (KFC itp.) 🍗',

        // HALUCYNACJE ZWIERZĘCE IMAGENET (AI widzi zwierzę zamiast dania z niego):
        'ostrich': 'Drób / Mięso 🥩',
        'partridge': 'Dzikie ptactwo / Mięso 🍗',
        'quail': 'Przepiórka / Jajka 🥚',
        'hare': 'Dziczyzna / Mięso 🥩',
        'ram, tup': 'Baranina 🥩',
        'bighorn, bighorn sheep': 'Baranina 🥩',
        'slug': 'Ślimak / Przekąska 🐌',
        'conch': 'Owoce morza 🐚',
        'sea cucumber': 'Owoce morza 🥒',
        'jellyfish': 'Żelki / Przekąska 🍬', // AI myli meduzy z żelkami
        'starfish': 'Ciasteczko / Wypiek ⭐', // AI myli rozgwiazdy z ciastkami w kształcie gwiazdek

        // HALUCYNACJE GRZYBOWE I ROŚLINNE:
        'agaric': 'Grzyb jadalny 🍄',
        'gyromitra': 'Grzyb / Potrawa 🍄',
        'stinkhorn': 'Grzyb / Potrawa 🍄',
        'earthstar': 'Grzyb / Potrawa 🍄',
        'hen-of-the-woods': 'Grzyb Maitake 🍄',
        'bolete': 'Borowik / Grzyb 🍄',
        'daisy': 'Jadalne kwiaty / Dekoracja 🌼',

        // HALUCYNACJE WIDOKÓW (AI widzi sklep lub sprzęt):
        'grocery store, grocery, food market, market': 'Zakupy spożywcze 🛒',
        'shopping cart': 'Koszyk z zakupami 🛒',
        'bakery, bakeshop, bakehouse': 'Wypieki / Pieczywo 🥖',
        'dishwasher, dish washer, dishwashing machine': 'Brudne naczynia / Posiłek 🍽️',
        'apron': 'Gotowanie / Kucharz 👨‍🍳'
    };

    const lower = eng.toLowerCase();
    for (let key in dict) if (lower.includes(key)) return dict[key];
    return `Coś do jedzenia (${eng})`;
};

export { translate };
export { foodKeywords };