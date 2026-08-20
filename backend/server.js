const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

const SEARXNG_API = "https://searx.dockhosting.dev";
const FOURGET_API = "https://search.yonderly.org/api/v1/web";
const WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1/page/summary/";

app.use(express.json());

app.use((req, res, next) => {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
res.header("Access-Control-Allow-Headers", "Content-Type");
next();
});

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

function fetchWithTimeout(url, timeout = 5000) {
const controller = new AbortController();

const timer = setTimeout(() => {
    controller.abort();
}, timeout);

return fetch(url, {
    headers: {
        "User-Agent": "GronnFalk/1.0",
        "Accept": "application/json"
    },
    signal: controller.signal
}).finally(() => {
    clearTimeout(timer);
});

}

async function searchSearXNG(query, category) {
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

    const url =
        SEARXNG_API +
        "/search?" +
        params.toString();

    const response =
        await fetchWithTimeout(url);

    if (!response.ok) {
        console.error(
            "SearXNG failed:",
            response.status
        );

        return [];
    }

    const data =
        await response.json();

    return (data.results || []).map(result => ({
        ...result,
        source: "SearXNG"
    }));

} catch (error) {
    console.error(
        "SearXNG error:",
        error.message
    );

    return [];
}

}

async function search4get(query, category) {

if (category !== "general") {
    return [];
}

try {
    const url =
        FOURGET_API +
        "?s=" +
        encodeURIComponent(query);

    const response =
        await fetchWithTimeout(url);

    if (!response.ok) {
        console.error(
            "4get failed:",
            response.status
        );

        return [];
    }

    const data =
        await response.json();

    return (data.web || []).map(result => ({
        title: result.title || "",
        url: result.url || "",
        content:
            result.description ||
            result.content ||
            "",
        description:
            result.description ||
            result.content ||
            "",
        source: "4get"
    }));

} catch (error) {
    console.error(
        "4get error:",
        error.message
    );

    return [];
}

}

function removeDuplicates(results) {
const seen = new Set();

return results.filter(result => {

    if (!result.url) {
        return false;
    }

    const key =
        result.url
            .trim()
            .toLowerCase();

    if (seen.has(key)) {
        return false;
    }

    seen.add(key);

    return true;
});

}

app.get("/search", async (req, res) => {

const query =
    typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

const category =
    req.query.category || "general";

if (!query) {
    return res.status(400).json({
        error: "Missing search query"
    });
}

const started = Date.now();

try {

    const [
        searxngResults,
        fourgetResults
    ] = await Promise.all([
        searchSearXNG(
            query,
            category
        ),
        search4get(
            query,
            category
        )
    ]);

    const results =
        removeDuplicates([
            ...searxngResults,
            ...fourgetResults
        ]);

    res.json({
        query: query,
        category: category,
        results: results,
        sources: {
            searxng:
                searxngResults.length,
            fourget:
                fourgetResults.length
        },
        responseTime:
            Date.now() - started
    });

} catch (error) {

    console.error(
        "Search error:",
        error
    );

    res.status(500).json({
        error: "Unable to perform search"
    });
}

});

app.get("/wikipedia", async (req, res) => {

const query =
    typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

if (!query) {
    return res.status(400).json({
        found: false,
        error: "Missing search query"
    });
}

try {

    const wikipediaTitle =
        encodeURIComponent(
            query.replace(/\s+/g, "_")
        );

    const url =
        WIKIPEDIA_API +
        wikipediaTitle;

    const response =
        await fetchWithTimeout(
            url,
            4000
        );

    if (!response.ok) {
        return res.json({
            found: false
        });
    }

    const data =
        await response.json();

    if (!data || !data.extract) {
        return res.json({
            found: false
        });
    }

    res.json({
        found: true,
        title:
            data.title || query,
        description:
            data.description || "",
        extract:
            data.extract || "",
        thumbnail:
            data.thumbnail &&
            data.thumbnail.source
                ? data.thumbnail.source
                : "",
        url:
            data.content_urls &&
            data.content_urls.desktop &&
            data.content_urls.desktop.page
                ? data.content_urls.desktop.page
                : ""
    });

} catch (error) {

    console.error(
        "Wikipedia error:",
        error.message
    );

    res.status(500).json({
        found: false,
        error: "Wikipedia request failed"
    });
}

});

app.listen(PORT, () => {
console.log(
"GronnFalk API running on port " +
PORT
);
});
