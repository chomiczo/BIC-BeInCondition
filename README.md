# 🥗 BIC - Be In Condition

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

**BIC (Be In Condition)** to nowoczesna, inteligentna aplikacja dietetyczna typu PWA (Progressive Web App). Została stworzona, aby maksymalnie uprościć śledzenie spożytych kalorii i makroskładników przy użyciu najnowszych technologii: sztucznej inteligencji, rozpoznawania obrazu w czasie rzeczywistym i przetwarzania mowy.

🔗 **Wersja Live (Demo):** [https://bic-updated.surge.sh](https://bic-updated.surge.sh)

---

## 📲 Jak zainstalować aplikację (PWA) na telefonie

Ponieważ projekt został zbudowany jako Progressive Web App, nie musisz pobierać go ze sklepu. Możesz zainstalować go bezpośrednio z przeglądarki!

**🍎 Dla użytkowników iOS (iPhone):**
1. Otwórz link [Wersji Live](https://bic-updated.surge.sh) w przeglądarce **Safari**.
2. Na dolnym pasku kliknij ikonę **Udostępnij** (kwadrat ze strzałką w górę).
3. Przewiń listę w dół i wybierz opcję **"Do ekranu początkowego"** (Add to Home Screen).
4. Kliknij **Dodaj**. Aplikacja pojawi się na pulpicie i będzie działać na pełnym ekranie!

**🤖 Dla użytkowników Android:**
1. Otwórz link [Wersji Live](https://bic-updated.surge.sh) w przeglądarce **Chrome**.
2. Kliknij **Menu** (trzy kropki w prawym górnym rogu ekranu).
3. Wybierz opcję **"Dodaj do ekranu głównego"** (Add to Home screen) lub **"Zainstaluj aplikację"**.
4. Potwierdź instalację. Gotowe!

---

## ✨ Główne funkcjonalności

### 🧠 Moduły AI & Machine Learning
* **🎙️ Sterowanie Głosem:** Wbudowany asystent głosowy (*Web Speech API*) pozwalający na naturalne dyktowanie zjedzonych posiłków.
* **Text-to-Macros (Gemini AI):** Integracja z modelem Google Gemini 2.5 Flash, który analizuje język naturalny i precyzyjnie wylicza kalorie oraz makroskładniki (Białko, Węglowodany, Tłuszcze) z opisu słownego.
* **📷 Vision AI Skaner:** Moduł aparatu wykorzystujący `TensorFlow.js` (MobileNet) do rozpoznawania jedzenia ze zdjęć w czasie rzeczywistym.

### 📊 Dietetyka i Śledzenie
* **🔎 Skaner Kodów Kreskowych:** Błyskawiczne dodawanie produktów dzięki integracji z bazą `OpenFoodFacts API`.
* **🤖 Osobisty Dietetyk AI:** Automatyczny generator jadłospisów dostosowanych do indywidualnego celu kalorycznego użytkownika.
* **Zaawansowany Dziennik:** Wizualizacja spożycia kalorii oraz neonowe paski makroskładników obliczane na podstawie celu (Redukcja / Utrzymanie / Masa).
* **💧 Monitor Nawodnienia:** Dynamicznie wyliczany cel wodny na podstawie wagi ciała użytkownika.
* **📈 Historia Wagi:** Zapis ostatnich 14 pomiarów z wizualizacją trendów (wzrosty/spadki).
* **💾 Eksport / Import Danych:** Możliwość pobrania całego profilu i historii w postaci pliku JSON i przywrócenia ich w dowolnym momencie.

### ⚙️ Technologie PWA & UX
* **📱 Instalacja PWA:** Możliwość instalacji bezpośrednio na ekranie głównym urządzenia (iOS/Android), z pełnoekranowym interfejsem offline.
* **🔒 Privacy-First:** Brak zewnętrznych baz danych dla użytkowników. Cały stan aplikacji i historia są bezpiecznie przechowywane w `LocalStorage` przeglądarki.

---

## 🛠️ Architektura Projektu (SOLID)

* `App.jsx` - Główny kontroler aplikacji, zarządzanie stanem i cyklem życia.
* `SetupView.jsx` - UI konfiguracji profilu i kalkulator zapotrzebowania (BMR/TDEE).
* `DiaryView.jsx` - Komponent odpowiedzialny za renderowanie dziennika, kółka kalorii i modułu makro.
* `ProfileView.jsx` - Panel statystyk, wykresy historii i zarządzanie danymi lokalnymi.
* `Scanner.jsx` - Złożony interfejs wejściowy (obsługa kamery, kodów QR/kreskowych, mikrofonu).
* `Navigation.jsx` - Odseparowany, bezstanowy komponent nawigacji dolnej.
* `api.js` - Samodzielna warstwa usług (Service Layer) do obsługi zapytań HTTP (Gemini, OpenFoodFacts).
* `dictionary.js` - Słownik translacji i mapowania słów kluczowych dla modelu wizyjnego.
* `calculator.js` - Czyste funkcje matematyczne wyliczające parametry fizyczne.

---

## 🚀 Uruchomienie lokalne

### Wymagania wstępne
* Node.js (wersja 18+)
* Aktywny klucz API Google Gemini

### Instalacja
1. **Sklonuj repozytorium:**
   ```bash
   git clone [https://github.com/chomiczo/BIC-BeInCondition.git](https://github.com/chomiczo/BIC-BeInCondition.git)
