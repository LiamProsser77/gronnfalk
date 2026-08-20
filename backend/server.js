const express = require("express");

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const PORT = process.env.PORT || 3000;

const SEARXNG_API = "https://searx.dockhosting.dev";
const FOURGET_API = "https://search.yonderly.org/api/v1/web";

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

app.get("/search-test", (req, res) => {
    res.json({
        test: "search route works",
        backend: "GronnFalk",
        status: "online"
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

    const searxngParams = new URLSearchParams();

    searxngParams.set("q", query);
    searxngParams.set("format", "json");

    if (category === "images" || category === "news") {
        searxngParams.set("categories", category);
    }

    const searxngURL =
        `${SEARXNG_API}/search?${searxngParams.toString()}`;

    const fourgetURL =
        `${FOURGET_API}?s=${encodeURIComponent(query)}`;

    try {
        const [searxngResponse, fourgetResponse] =
            await Promise.allSettled([
                fetch(searxngURL, {
                    headers: {
                        "User-Agent": "GronnFalk/1.0",
                        "Accept": "application/json"
                    }
                }),

                fetch(fourgetURL, {
                    headers: {
                        "User-Agent": "GronnFalk/1.0",
                        "Accept": "application/json"
                    }
                })
            ]);

        let searxngResults = [];
        let fourgetResults = [];

        if (searxngResponse.status === "fulfilled") {
            const response = searxngResponse.value;

            if (response.ok) {
                try {
                    const data = await response.json();

                    searxngResults = (data.results || []).map(result => ({
                        ...result,
                        source: "SearXNG"
                    }));
                } catch (error) {
                    console.error(
                        "SearXNG JSON error:",
                        error.message
                    );
                }
            } else {
                console.error(
                    "SearXNG failed:",
                    response.status
                );
            }
        } else {
            console.error(
                "SearXNG connection error:",
                searxngResponse.reason
            );
        }

        if (fourgetResponse.status === "fulfilled") {
            const response = fourgetResponse.value;

            if (response.ok) {
                try {
                    const data = await response.json();

                    fourgetResults = (data.web || []).map(result => ({
                        title: result.title || "Untitled",
                        url: result.url || "",
                        content: result.description || "",
                        description: result.description || "",
                        source: "4get"
                    }));
                } catch (error) {
                    console.error(
                        "4get JSON error:",
                        error.message
                    );
                }
            } else {
                console.error(
                    "4get failed:",
                    response.status
                );
            }
        } else {
            console.error(
                "4get connection error:",
                fourgetResponse.reason
            );
        }

        const combinedResults = [
            ...searxngResults,
            ...fourgetResults
        ];

        res.json({
            query: query,
            category: category,
            results: combinedResults,
            sources: {
                SearXNG: searxngResults.length,
                "4get": fourgetResults.length
            }
        });

    } catch (error) {
        console.error("Search error:", error);

        res.status(500).json({
            error: "Unable to perform search",
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `GronnFalk API running on port ${PORT}`
    );
});
