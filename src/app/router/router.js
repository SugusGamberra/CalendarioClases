const router = require("express").Router();
const fetch = require('node-fetch');

router.get("/", (req, res) => {
    res.render("index", {
        title: "Inicio",
        apiKey: process.env.GOOGLE_API_KEY || '',
        calendarId: process.env.GOOGLE_CALENDAR_ID || '',
        notionCalendarId: process.env.NOTION_CALENDAR_ID || ''
    });
});

// API centralizada
router.post("/api/create", async (req, res) => {
    try {
        const tokenRecibido = req.headers.authorization?.split(' ')[1];
        const tokenSecreto = process.env.SECRET_TOKEN;
        const eventData = req.body;
        
        // crear, editar y borrar
        const action = eventData.action; 

        if (!tokenRecibido || tokenRecibido !== tokenSecreto) {
            console.warn(`¡Intento de ${action?.toUpperCase() || 'ACCIÓN'} con token incorrecto!`);
            return res.status(401).json({ error: "No autorizado. Token inválido." });
        }

        const urlSecretaMake = process.env.MAKE_WEBHOOK_URL;
        
        if (!urlSecretaMake) {
            throw new Error(`Falta la URL del webhook de Make (MAKE_WEBHOOK_URL)`);
        }
        
        if (!action) {
            throw new Error(`No se especificó ninguna 'action' en el body.`);
        }

        console.log(`Recibida petición para ${action.toUpperCase()} (Autorizado).`);

        const makeResponse = await fetch(urlSecretaMake, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData) // Mandamos todo, incluida la 'action'
        });

        if (!makeResponse.ok) {
            const makeErrorText = await makeResponse.text();
            throw new Error(`Error en la respuesta de Make.com (${makeResponse.status}): ${makeErrorText}`);
        }
        
        res.status(200).json({ message: "Acción procesada por Make con éxito" });

    } catch (error) {
        console.error(`Error en /api/create:`, error.message);
        res.status(500).json({ error: `No se pudo completar la acción. Detalles: ${error.message}` });
    }
});

module.exports = router;