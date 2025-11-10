const router = require("express").Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Inicio",
        apiKey: process.env.GOOGLE_API_KEY || '',
        calendarId: process.env.GOOGLE_CALENDAR_ID || '',
        notionCalendarId: process.env.NOTION_CALENDAR_ID || '',
        makeWebhookUrl: process.env.MAKE_WEBHOOK_URL || '',
        makeDeleteWebhookUrl: process.env.MAKE_DELETE_WEBHOOK_URL || ''
    });
});

module.exports = router;