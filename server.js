import express from 'express';
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Brak klucza GEMINI_API_KEY!");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// KOMPLETNA STRONA: NOWOCZESNY DESIGN + POPRAWIONY OPIS + STATYSTYKI UMAMI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pl" class="dark">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>KtoTymRzadzi.ai — Prześwietl Korporacyjne Imperia</title>
            
            <script defer src="https://cloud.umami.is/script.js" data-website-id="1edebaf5-6455-46af-bfb2-7b59747bf0a3"></script>

            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    darkMode: 'class',
                    theme: {
                        extend: {
                            colors: {
                                darkBg: '#0B0F19',
                                cardBg: '#161B26',
                                accentBlue: '#3B82F6'
                            }
                        }
                    }
                }
            </script>
            <style>
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .glow-effect { animation: pulse-glow 3s infinite; }
            </style>
        </head>
        <body class="bg-darkBg text-gray-100 min-h-screen font-sans selection:bg-blue-500 selection:text-white">

            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full glow-effect"></div>

            <div class="max-w-4xl mx-auto px-4 py-16 relative z-10">
                
                <header class="text-center mb-12">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4 backdrop-blur-sm">
                        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Wywiad rynkowy AI w czasie rzeczywistym
                    </div>
                    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-4">
                        KtoTymRządzi<span class="text-blue-500">.ai</span>
                    </h1>
                    <p class="text-gray-400 text-lg max-w-xl mx-auto">
                        Wpisz nazwę globalnego giganta, a sztuczna inteligencja natychmiast obnaży strukturę jego rynkowego monopolu.
                    </p>
                </header>

                <div class="max-w-xl mx-auto mb-16">
                    <div class="flex gap-2 p-2 rounded-xl bg-cardBg border border-gray-800 shadow-2xl focus-within:border-blue-500/50 transition-all duration-300">
                        <input 
                            type="text" 
                            id="firma" 
                            placeholder="Np. Mars, Nestle, PepsiCo, Unilever..." 
                            class="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none text-lg"
                        >
                        <button 
                            onclick="szukaj()" 
                            class="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                        >
                            <span id="btnText">Szukaj</span>
                        </button>
                    </div>
                </div>

                <div id="loader" class="hidden max-w-2xl mx-auto text-center py-12">
                    <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-400 animate-pulse">AI przeszukuje bazy danych i mapuje powiązania kapitałowe...</p>
                </div>

                <main id="wynik" class="hidden space-y-8 animate-fade-in">
                    <div class="p-8 rounded-2xl bg-cardBg border border-gray-800 shadow-xl backdrop-blur-sm">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
                            <div>
                                <h2 id="title" class="text-2xl font-bold text-white mb-2"></h2>
                                <p id="desc" class="text-gray-400 leading-relaxed"></p>
                            </div>
                        </div>

                        <h3 class="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            📦 Portfolio kontrolowanych marek:
                        </h3>
                        
                        <div id="markiGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            </div>
                    </div>
                </main>
            </div>

            <script>
                async function szukaj() {
                    const btn = document.querySelector('button');
                    const btnText = document.getElementById('btnText');
                    const firma = document.getElementById('firma').value;
                    const loader = document.getElementById('loader');
                    const wynik = document.getElementById('wynik');
                    
                    if(!firma) return;
                    
                    loader.classList.remove('hidden');
                    wynik.classList.add('hidden');
                    btn.disabled = true;

                    try {
                        const res = await fetch('/api/szukaj?firma=' + encodeURIComponent(firma));
                        const dane = await res.json();
                        
                        document.getElementById('title').innerText = "🏢 " + dane.korporacja;
                        // POPRAWKA: Wyświetlamy opis poprawnie
                        document.getElementById('desc').innerText = dane.opis || '';
                        
                        let gridHtml = '';
                        dane.marki.forEach(m => {
                            gridHtml += \`
                                <div class="p-5 rounded-xl bg-darkBg/60 border border-gray-800/80 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1">
                                    <div class="flex justify-between items-start mb-2">
                                        <h4 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">\${m.nazwa}</h4>
                                        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 border border-gray-700">\${m.kategoria}</span>
                                    </div>
                                    <p class="text-gray-400 text-sm leading-relaxed">\${m.opis}</p>
                                </div>
                            \`;
                        });
                        
                        document.getElementById('markiGrid').innerHTML = gridHtml;
                        loader.classList.add('hidden');
                        wynik.classList.remove('hidden');
                    } catch(e) {
                        alert('Wystąpił błąd serwera. Spróbuj ponownie.');
                        loader.classList.add('hidden');
                    } finally {
                        btn.disabled = false;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/szukaj', async (req, res) => {
    const nazwaFirmy = req.query.firma;
    if (!nazwaFirmy) return res.status(400).json({ error: 'Brak nazwy firmy' });

    const prompt = `Przeanalizuj strukturę firmy "${nazwaFirmy}". 
    Znajdź główne marki i produkty, które do niej należą.
    Zwróć wynik jako czysty obiekt JSON (bez formatowania markdown typu \`\`\`json).
    {
      "korporacja": "${nazwaFirmy}",
      "opis": "Czym się zajmują",
      "marki": [
        { "nazwa": "Nazwa", "kategoria": "Kategoria", "opis": "Opis" }
      ]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const dane = JSON.parse(response.text.trim());
        res.json(dane);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na porcie ${PORT}`);
});