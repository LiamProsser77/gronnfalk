const express = require("express");

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const PORT = process.env.PORT || 3000;
const SEARXNG_API = "https://search.yuri.llc";

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        name: "GronnFalk API",
        status: "online"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.get("/search", async (req, res) => {
    const query = req.query.q;
    const category = req.query.category || "general";

    if (!query) {
        return res.status(400).json({
            error: "Missing search query"
        });
    }

    try {
        const params = new URLSearchParams();

        params.set("q", query);
        params.set("format", "json");

        if (
            category === "images" ||
            category === "news"
        ) {
            params.set("categories", category);
        }

        const searchURL =
            `${SEARXNG_API}/search?${params.toString()}`;

        const response = await fetch(searchURL, {
            headers: {
                "User-Agent": "GronnFalk/1.0",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            return res.status(502).json({
                error: "SearXNG search failed",
                status: response.status
            });
        }

        const data = await response.json();

        res.json({
            query: query,
            category: category,
            results: data.results || []
        });

    } catch (error) {
        console.error("Search error:", error);

        res.status(500).json({
            error: "Unable to contact SearXNG"
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `GronnFalk API running on port ${PORT}`
    );
});
