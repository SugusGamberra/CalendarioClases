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

// API CENTRALIZADA para crear, borrar y actualizar
router.post("/api/create", async (req, res) => {
    try {
        const tokenRecibido = req.headers.authorization?.split(' ')[1];
        const tokenSecreto = process.env.SECRET_TOKEN;
        const eventData = req.body;
        const action = eventData.action;

        if (!tokenRecibido || tokenRecibido !== tokenSecreto) {
            console.warn(`¡Intento de ${action?.toUpperCase() || 'ACCIÓN DESCONOCIDA'} con token incorrecto!`);
            return res.status(401).json({ error: "No autorizado. Token inválido." });
        }

        let urlSecreta;
        let successMessage;

        switch (action) {
            case 'create':
                urlSecreta = process.env.MAKE_WEBHOOK_URL;
                successMessage = "Evento creado con éxito";
                break;
            case 'update':
                urlSecreta = process.env.MAKE_UPDATE_WEBHOOK_URL;
                successMessage = "Evento actualizado con éxito";
                if (!eventData.eventId) throw new Error("Falta el ID del evento para actualizar.");
                break;
            case 'delete':
                urlSecreta = process.env.MAKE_DELETE_WEBHOOK_URL;
                successMessage = "Evento borrado con éxito";
                if (!eventData.eventId) throw new Error("Falta el ID del evento para borrar.");
                break;
            default:
                return res.status(400).json({ error: "Acción no válida o no especificada." });
        }
        
        if (!urlSecreta) {
            throw new Error(`Falta la URL del webhook de Make para la acción: ${action}`);
        }

        console.log(`Recibida petición para ${action.toUpperCase()} (Autorizado).`);

        const makeResponse = await fetch(urlSecreta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!makeResponse.ok) {
            const makeErrorText = await makeResponse.text();
            throw new Error(`Error en la respuesta de Make.com (${makeResponse.status}) para ${action}: ${makeErrorText}`);
        }
        
        res.status(200).json({ message: successMessage });

    } catch (error) {
        console.error(`Error en /api/create (Action: ${req.body.action || 'N/A'}):`, error.message);
        const statusCode = error.message.includes('Falta') ? 400 : 500;
        res.status(statusCode).json({ error: `No se pudo completar la acción. Detalles: ${error.message}` });
    }
});

module.exports = router;