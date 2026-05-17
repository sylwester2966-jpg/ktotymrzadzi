import express from 'express';
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const app = express();
// Port 3000 dla Twojego komputera, a process.env.PORT dla chmury (Render ustawi go sam!)
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Brak klucza GEMINI_API_KEY!");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Prosty interfejs graficzny bezpośrednio z serwera (Strona Główna)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <title>KtoTymRzadzi.ai</title>
            <style>
                body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f4f7f6; text-align: center; }
                input { padding: 12px; width: 70%; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; }
                button { padding: 12px 20px; font-size: 16px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
                #wynik { margin-top: 30px; text-align: left; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>🕵️‍♂️ KtoTymRzadzi.ai</h1>
            <p>Wpisz korporację, a AI prześwietli jej marki:</p>
            <input type="text" id="firma" placeholder="Np. Mars, PepsiCo, Nestle...">
            <button onclick="szukaj()">Szukaj</button>
            
            <div id="wynik">
                <h2 id="title"></h2>
                <p id="desc"></p>
                <div id="tabelaKontener"></div>
            </div>

            <script>
                async function szukaj() {
                    const btn = document.querySelector('button');
                    const firma = document.getElementById('firma').value;
                    if(!firma) return;
                    
                    btn.innerText = 'Prześwietlam...';
                    btn.disabled = true;

                    try {
                        const res = await fetch('/api/szukaj?firma=' + encodeURIComponent(firma));
                        const dane = await res.json();
                        
                        document.getElementById('title').innerText = "🏢 " + dane.korporacja;
                        document.getElementById('desc').innerText = dane.opis;
                        
                        let html = '<table><tr><th>Marka</th><th>Kategoria</th><th>Opis</th></tr>';
                        dane.marki.forEach(m => {
                            html += '<tr><td><b>' + m.nazwa + '</b></td><td>' + m.kategoria + '</td><td>' + m.opis + '</td></tr>';
                        });
                        html += '</table>';
                        
                        document.getElementById('tabelaKontener').innerHTML = html;
                        document.getElementById('wynik').style.display = 'block';
                    } catch(e) {
                        alert('Błąd serwera. Spróbuj ponownie.');
                    } finally {
                        btn.innerText = 'Szukaj';
                        btn.disabled = false;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// 2. Endpoint API, z którego korzysta nasza strona
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

// Start serwera
app.listen(PORT, () => {
    console.log(`🚀 Serwer działa lokalnie na http://localhost:${PORT}`);
});