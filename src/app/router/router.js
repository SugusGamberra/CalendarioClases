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

// API crear eventos

router.post("/api/create", async (req, res) => {
    try {
        const urlSecreta = process.env.MAKE_WEBHOOK_URL;
        if (!urlSecreta) {
            throw new Error("No se ha configurado la URL del webhook en .env");
        }
        const eventData = req.body;
        console.log('Recibida petición para CREAR:', eventData);
        const makeResponse = await fetch(urlSecreta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!makeResponse.ok) {
            throw new Error('Error en la respuesta de Make.com');
        }
        res.status(200).json({ message: "Evento creado con éxito" });

    } catch (error) {
        console.error("Error en /api/create:", error.message);
        res.status(500).json({ error: "No se pudo crear el evento." });
    }
});

// API borrar eventos

router.post("/api/delete", async (req, res) => {
    try {
        const urlSecreta = process.env.MAKE_DELETE_WEBHOOK_URL;
        if (!urlSecreta) {
            throw new Error("No se ha configurado la URL de borrado en .env");
        }
        const { eventId } = req.body;
        console.log('Recibida petición para BORRAR:', eventId);
        const makeResponse = await fetch(urlSecreta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: eventId })
        });

        if (!makeResponse.ok) {
            throw new Error('Error en la respuesta de Make.com al borrar');
        }
        res.status(200).json({ message: "Evento borrado con éxito" });

    } catch (error) {
        console.error("Error en /api/delete:", error.message);
        res.status(500).json({ error: "No se pudo borrar el evento." });
    }
});

module.exports = router;