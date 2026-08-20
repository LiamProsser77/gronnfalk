const express = require("express");

const router = express.Router();

const WIKIPEDIA_API =
"https://en.wikipedia.org/api/rest_v1";

const SEARCH_API =
"https://en.wikipedia.org/w/rest.php/v1/search/page";

function fetchWithTimeout(url, timeout = 3000) {

const controller =
    new AbortController();

const timer =
    setTimeout(() => {
        controller.abort();
    }, timeout);

return fetch(url, {
    headers: {
        "User-Agent":
            "GronnFalk/1.0 (https://liamprosser77.github.io/gronnfalk/)",
        "Accept":
            "application/json"
    },
    signal: controller.signal
}).finally(() => {
    clearTimeout(timer);
});

}

async function searchWikipedia(query) {

try {

    const searchURL =
        SEARCH_API +
        "?q=" +
        encodeURIComponent(query) +
        "&limit=1";

    const response =
        await fetchWithTimeout(
            searchURL,
            3000
        );

    if (!response.ok) {

        return null;

    }

    const data =
        await response.json();

    if (
        !data.pages ||
        !data.pages.length
    ) {

        return null;

    }

    return data.pages[0];

} catch (error) {

    console.error(
        "Wikipedia search error:",
        error.message
    );

    return null;

}

}

async function getWikipediaSummary(title) {

try {

    const url =
        WIKIPEDIA_API +
        "/page/summary/" +
        encodeURIComponent(title);

    const response =
        await fetchWithTimeout(
            url,
            3000
        );

    if (!response.ok) {

        return null;

    }

    return await response.json();

} catch (error) {

    console.error(
        "Wikipedia summary error:",
        error.message
    );

    return null;

}

}

router.get("/wikipedia", async (req, res) => {

const query =
    typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

if (!query) {

    return res.status(400).json({
        error:
            "Missing search query"
    });

}


try {

    const page =
        await searchWikipedia(
            query
        );

    if (!page) {

        return res.json({
            found: false,
            result: null
        });

    }


    const title =
        page.title ||
        page.key;

    const summary =
        await getWikipediaSummary(
            title
        );


    if (!summary) {

        return res.json({
            found: false,
            result: null
        });

    }


    const thumbnail =
        summary.thumbnail &&
        summary.thumbnail.source
            ? summary.thumbnail.source
            : "";


    const originalImage =
        summary.originalimage &&
        summary.originalimage.source
            ? summary.originalimage.source
            : "";


    const image =
        thumbnail ||
        originalImage ||
        "";


    const articleURL =
        summary.content_urls &&
        summary.content_urls.desktop &&
        summary.content_urls.desktop.page
            ? summary.content_urls.desktop.page
            : "https://en.wikipedia.org/wiki/" +
              encodeURIComponent(
                  title.replace(/ /g, "_")
              );


    res.json({

        found: true,

        result: {

            title:
                summary.title ||
                title,

            description:
                summary.description ||
                "",

            extract:
                summary.extract ||
                "",

            image:
                image,

            thumbnail:
                thumbnail,

            url:
                articleURL,

            source:
                "Wikipedia"

        }

    });


} catch (error) {

    console.error(
        "Wikipedia API error:",
        error.message
    );

    res.status(500).json({
        found: false,
        error:
            "Wikipedia lookup failed"
    });

}

});

module.exports = router;
