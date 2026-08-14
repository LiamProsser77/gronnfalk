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

app.get("/search", async (req, res) => {
const query = req.query.q;

if (!query) {
    return res.status(400).json({
        error: "Missing search query"
    });
}

try {
    const searchURL =
        "https://searx.party/search?q=" +
        encodeURIComponent(query) +
        "&format=json";

    const response = await fetch(searchURL);

    if (!response.ok) {
        return res.status(502).json({
            error: "SearXNG search failed",
            status: response.status
        });
    }

    const data = await response.json();

    const results = (data.results || []).map(result => ({
        title: result.title || "",
        url: result.url || "",
        content: result.content || "",
        engine: result.engine || "",
        category: result.category || "general",
        thumbnail: result.thumbnail || "",
        publishedDate: result.publishedDate || null
    }));

    res.json({
        query: query,
        results: results
    });

} catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
        error: "Unable to contact SearXNG"
    });
}
});

app.get("/images", async (req, res) => {
const query = req.query.q;

if (!query) {
    return res.status(400).json({
        error: "Missing search query"
    });
}

try {
    const searchURL =
        "https://searx.party/search?q=" +
        encodeURIComponent(query) +
        "&categories=images&format=json";

    const response = await fetch(searchURL);

    if (!response.ok) {
        return res.status(502).json({
            error: "SearXNG image search failed",
            status: response.status
        });
    }

    const data = await response.json();

    const results = (data.results || []).map(result => ({
        title: result.title || "",
        url: result.url || "",
        thumbnail: result.thumbnail || "",
        img_src: result.img_src || "",
        source: result.source || ""
    }));

    res.json({
        query: query,
        results: results
    });

} catch (error) {
    console.error("Image search error:", error);

    res.status(500).json({
        error: "Unable to contact SearXNG"
    });
}
});

app.get("/news", async (req, res) => {
const query = req.query.q;

if (!query) {
    return res.status(400).json({
        error: "Missing search query"
    });
}

try {
    const searchURL =
        "https://searx.party/search?q=" +
        encodeURIComponent(query) +
        "&categories=news&format=json";

    const response = await fetch(searchURL);

    if (!response.ok) {
        return res.status(502).json({
            error: "SearXNG news search failed",
            status: response.status
        });
    }

    const data = await response.json();

    const results = (data.results || []).map(result => ({
        title: result.title || "",
        url: result.url || "",
        content: result.content || "",
        publishedDate: result.publishedDate || null,
        source: result.source || "",
        thumbnail: result.thumbnail || ""
    }));

    res.json({
        query: query,
        results: results
    });

} catch (error) {
    console.error("News search error:", error);

    res.status(500).json({
        error: "Unable to contact SearXNG"
    });
}
});

app.listen(PORT, () => {
console.log(`GronnFalk API running on port ${PORT}`);
});
