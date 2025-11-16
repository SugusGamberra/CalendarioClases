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

// rest apis
// CREAR:
router.post("/api/events", async (req, res) => {
    try {
        const tokenRecibido = req.headers.authorization?.split(' ')[1];
        const tokenSecreto = process.env.SECRET_TOKEN;
        
        if (!tokenRecibido || tokenRecibido !== tokenSecreto) {
            console.warn(`¡Intento de CREACIÓN con token incorrecto!`);
            return res.status(401).json({ error: "No autorizado. Token inválido." });
        }

        console.log(`Recibida petición para CREAR (Autorizado).`);
        const eventData = req.body;
        const urlSecreta = process.env.MAKE_WEBHOOK_URL;
        
        if (!urlSecreta) {
            throw new Error(`Falta la URL del webhook de Make para 'create'`);
        }

        const makeResponse = await fetch(urlSecreta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!makeResponse.ok) {
            const makeErrorText = await makeResponse.text();
            throw new Error(`Error en Make.com (create): ${makeErrorText}`);
        }
        
        res.status(200).json({ message: "Evento creado con éxito" });

    } catch (error) {
        console.error(`Error en POST /api/events:`, error.message);
        res.status(500).json({ error: `No se pudo crear. Detalles: ${error.message}` });
    }
});

// EDITAR
router.put("/api/events/:eventId", async (req, res) => {
    try {
        const tokenRecibido = req.headers.authorization?.split(' ')[1];
        const tokenSecreto = process.env.SECRET_TOKEN;
        
        if (!tokenRecibido || tokenRecibido !== tokenSecreto) {
            console.warn(`¡Intento de ACTUALIZAR con token incorrecto!`);
            return res.status(401).json({ error: "No autorizado. Token inválido." });
        }

        console.log(`Recibida petición para ACTUALIZAR (Autorizado).`);
        
        const eventData = req.body;
        const eventId = req.params.eventId;
        const urlSecreta = process.env.MAKE_UPDATE_WEBHOOK_URL;
        
        if (!urlSecreta) {
            throw new Error(`Falta la URL del webhook de Make para 'update'`);
        }

        const payload = { ...eventData, eventId: eventId };

        const makeResponse = await fetch(urlSecreta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!makeResponse.ok) {
            const makeErrorText = await makeResponse.text();
            throw new Error(`Error en Make.com (update): ${makeErrorText}`);
        }
        
        res.status(200).json({ message: "Evento actualizado con éxito" });

    } catch (error) {
        console.error(`Error en PUT /api/events/:eventId:`, error.message);
        res.status(500).json({ error: `No se pudo actualizar. Detalles: ${error.message}` });
    }
});

// BORRAR:
router.delete("/api/events/:eventId", async (req, res) => {
    try {
        const tokenRecibido = req.headers.authorization?.split(' ')[1];
        const tokenSecreto = process.env.SECRET_TOKEN;
        
        if (!tokenRecibido || tokenRecibido !== tokenSecreto) {
            console.warn(`¡Intento de BORRADO con token incorrecto!`);
            return res.status(401).json({ error: "No autorizado. Token inválido." });
        }

        console.log(`Recibida petición para BORRAR (Autorizado).`);
        
        const eventId = req.params.eventId;
        const urlSecreta = process.env.MAKE_DELETE_WEBHOOK_URL;
        
        if (!urlSecreta) {
            throw new Error(`Falta la URL del webhook de Make para 'delete'`);
        }

        const payload = { eventId: eventId };

        const makeResponse = await fetch(urlSecreta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!makeResponse.ok) {
            const makeErrorText = await makeResponse.text();
            throw new Error(`Error en Make.com (delete): ${makeErrorText}`);
        }
        
        res.status(200).json({ message: "Evento borrado con éxito" });

    } catch (error) {
        console.error(`Error en DELETE /api/events/:eventId:`, error.message);
        res.status(500).json({ error: `No se pudo borrar. Detalles: ${error.message}` });
    }
});

module.exports = router;