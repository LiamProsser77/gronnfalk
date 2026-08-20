const express = require("express");

const app = express();

app.use((req, res, next) => {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
res.header("Access-Control-Allow-Headers", "Content-Type");
next();
});

const PORT = process.env.PORT || 3000;
const FOURGET_API = "https://search.yonderly.org/api/v1/web";

app.use(express.json());

app.get("/", (req, res) => {
res.json({
name: "GronnFalk 4get API",
status: "online"
});
});

app.get("/health", (req, res) => {
res.status(200).json({
status: "ok"
});
});

app.get("/search-test", (req, res) => {
res.json({
test: "search route works",
status: "ok"
});
});

// Diagnostic test route
app.get("/search-test", (req, res) => {
res.json({
test: "search route works",
backend: "GronnFalk",
status: "online"
});
});

app.get("/search", async (req, res) => {
const query = req.query.q;

```
if (!query) {
    return res.status(400).json({
        error: "Missing search query"
    });
}

try {
    const searchURL =
        `${FOURGET_API}?s=${encodeURIComponent(query)}`;

    const response = await fetch(searchURL, {
        headers: {
            "User-Agent": "GronnFalk/1.0",
            "Accept": "application/json"
        }
    });

    const text = await response.text();

    if (!response.ok) {
        return res.status(502).json({
            error: "4get search failed",
            status: response.status,
            response: text.substring(0, 1000)
        });
    }

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        return res.status(502).json({
            error: "4get did not return JSON",
            response: text.substring(0, 1000)
        });
    }

    if (
        data.status !== "ok" ||
        !Array.isArray(data.web)
    ) {
        return res.status(502).json({
            error: "4get returned invalid search results"
        });
    }

    const results = data.web.map(result => ({
        title: result.title || "",
        url: result.url || "",
        description: result.description || "",
        source: "4get"
    }));

    res.json({
        query: query,
        results: results
    });

} catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
        error: "Unable to contact 4get",
        details: error.message
    });
}
```

});

app.listen(PORT, () => {
console.log(
`GronnFalk 4get API running on port ${PORT}`
);
});
