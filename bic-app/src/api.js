import { GoogleGenerativeAI } from "@google/generative-ai";

// Szukanie po kodzie kreskowym
export const fetchBarcodeData = async (code) => {
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
        const data = await res.json();

        if (data.status === 1) {
            if (!data.product.nutriments || Object.keys(data.product.nutriments).length === 0) {
                return { error: "Znaleziono produkt, ale nie ma on wartości odżywczych w bazie! Czy to na pewno jedzenie?" };
            }

            const nutriments = data.product.nutriments;
            return {
                name: data.product.product_name || "Nieznany produkt",
                kcalPer100g: Math.round(nutriments['energy-kcal_100g'] || 0),
                protein: Math.round(nutriments['proteins_100g'] || 0),
                carbs: Math.round(nutriments['carbohydrates_100g'] || 0),
                fat: Math.round(nutriments['fat_100g'] || 0)
            };
        } else {
            return { error: `Kod ${code} nie istnieje w bazie żywności. Czy to na pewno jedzenie?` };
        }
    } catch (e) {
        return { error: "Błąd skanowania kodu. Spróbuj ponownie." };
    }
};

// Szacowanie z tekstu / ze zdjęcia (Gemini)
export const askGeminiForMacros = async (prompt) => {
    try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        if (responseText.toUpperCase().includes("BŁĄD") || responseText.toUpperCase().includes("BLAD")) {
            return { error: "To nie wygląda jak jedzenie ani napój!" };
        }

        const parts = responseText.split('|');
        if (parts.length >= 4) {
            // Pierwszy element (index 0) to nazwa w przypadku zdjęcia, a kalorie w przypadku wpisywania ręcznego
            // Aby to uniwersalnie obsłużyć, robimy mały trik:
            const isImagePrompt = parts.length >= 5; // Prompt ze zdjęcia prosi o 5 elementów

            return {
                name: isImagePrompt ? parts[0].trim() : null, // Nazwę ze zdjęcia bierzemy z parts[0]
                kcalPer100g: parseInt(parts[isImagePrompt ? 1 : 0].replace(/\D/g, '')) || 0,
                protein: parseInt(parts[isImagePrompt ? 2 : 1].replace(/\D/g, '')) || 0,
                carbs: parseInt(parts[isImagePrompt ? 3 : 2].replace(/\D/g, '')) || 0,
                fat: parseInt(parts[isImagePrompt ? 4 : 3].replace(/\D/g, '')) || 0
            };
        } else {
            return { error: "AI nie zrozumiało posiłku. Spróbuj opisać go dokładniej." };
        }
    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("429")) {
            return { error: "Zbyt wiele pytań do AI pod rząd. Odczekaj 30 sekund." };
        }
        return { error: `Problem z połączeniem: ${error.message}` };
    }
};