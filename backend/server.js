const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        name: "GronnFalk API",
        status: "online"
    });
});

app.get("/search", (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: "Missing search query"
        });
    }

    res.json({
        message: "GronnFalk search backend is working",
        query: query
    });
});

app.listen(PORT, () => {
    console.log(`GronnFalk API running on port ${PORT}`);
});
