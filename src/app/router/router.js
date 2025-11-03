const router = require("express").Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Inicio",
        apiKey: process.env.GOOGLE_API_KEY || '',
        calendarId: process.env.GOOGLE_CALENDAR_ID || ''
    });
});

module.exports = router;