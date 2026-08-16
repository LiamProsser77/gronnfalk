const SEARXNG_API = "/api";

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-box input");

let currentQuery = "";
let currentCategory = "general";

function getQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
}

function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "general";
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function createSearchURL(query, category) {
    const params = new URLSearchParams();

    params.set("q", query);

    if (category !== "general") {
        params.set("category", category);
    }

    return `?${params.toString()}`;
}

function performSearch(query, category = "general") {
    query = query.trim();

    if (!query) {
        return;
    }

    window.location.href = createSearchURL(query, category);
}

function setupSearchForm() {
    if (!searchForm || !searchInput) {
        return;
    }

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        performSearch(
            searchInput.value,
            currentCategory
        );
    });
}

function createNavigation() {
    const navigation = document.createElement("nav");

    navigation.className = "search-navigation";

    navigation.innerHTML = `
        <a href="${createSearchURL(currentQuery, "general")}"
           class="${currentCategory === "general" ? "active" : ""}">
            Web
        </a>

        <a href="${createSearchURL(currentQuery, "images")}"
           class="${currentCategory === "images" ? "active" : ""}">
            Images
        </a>

        <a href="${createSearchURL(currentQuery, "news")}"
           class="${currentCategory === "news" ? "active" : ""}">
            News
        </a>
    `;

    return navigation;
}

function createResultsContainer() {
    let container = document.querySelector(".results-container");

    if (!container) {
        container = document.createElement("main");
        container.className = "results-container";

        document.body.appendChild(container);
    }

    return container;
}

function showLoading() {
    const container = createResultsContainer();

    container.innerHTML = `
        <div class="results-status">
            Searching GronnFalk...
        </div>
    `;
}

function showError(message) {
    const container = createResultsContainer();

    container.innerHTML = `
        <div class="results-status error">
            <h2>Something went wrong</h2>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}

function createWebResult(result) {
    const article = document.createElement("article");

    article.className = "search-result";

    const title = escapeHTML(
        result.title || "Untitled result"
    );

    const url = escapeHTML(
        result.url || ""
    );

    const content = escapeHTML(
        result.content || ""
    );

    article.innerHTML = `
        <a
            class="result-url"
            href="${url}"
            target="_self"
            rel="noopener noreferrer"
        >
            ${url}
        </a>

        <h2>
            <a
                href="${url}"
                target="_self"
                rel="noopener noreferrer"
            >
                ${title}
            </a>
        </h2>

        <p>
            ${content}
        </p>
    `;

    return article;
}

function createImageResult(result) {
    const article = document.createElement("article");

    article.className = "image-result";

    const title = escapeHTML(
        result.title || "Image"
    );

    const imageURL =
        result.img_src ||
        result.thumbnail_src ||
        "";

    const pageURL =
        result.url ||
        imageURL;

    article.innerHTML = `
        <a
            href="${escapeHTML(pageURL)}"
            target="_self"
            rel="noopener noreferrer"
        >
            ${
                imageURL
                    ? `
                        <img
                            src="${escapeHTML(imageURL)}"
                            alt="${title}"
                            loading="lazy"
                        >
                    `
                    : ""
            }

            <span>
                ${title}
            </span>
        </a>
    `;

    return article;
}

function createNewsResult(result) {
    const article = document.createElement("article");

    article.className = "search-result news-result";

    const title = escapeHTML(
        result.title || "News result"
    );

    const url = escapeHTML(
        result.url || ""
    );

    const content = escapeHTML(
        result.content || ""
    );

    const publishedDate = escapeHTML(
        result.publishedDate || ""
    );

    article.innerHTML = `
        <a
            class="result-url"
            href="${url}"
            target="_self"
            rel="noopener noreferrer"
        >
            ${url}
        </a>

        <h2>
            <a
                href="${url}"
                target="_self"
                rel="noopener noreferrer"
            >
                ${title}
            </a>
        </h2>

        ${
            publishedDate
                ? `<time>${publishedDate}</time>`
                : ""
        }

        <p>
            ${content}
        </p>
    `;

    return article;
}

async function searchSearXNG() {
    if (!SEARXNG_API) {
        showError(
            "The GronnFalk search backend has not been connected yet."
        );

        return;
    }

    showLoading();

    try {
        const params = new URLSearchParams();

        params.set("q", currentQuery);
        params.set("format", "json");

        if (currentCategory === "images") {
            params.set("categories", "images");
        }

        if (currentCategory === "news") {
            params.set("categories", "news");
        }

        params.set("category", currentCategory);

const response = await fetch(
    `${SEARXNG_API}/search?${params.toString()}`
);

        if (!response.ok) {
            throw new Error(
                `Search request failed (${response.status})`
            );
        }

        const data = await response.json();

        displayResults(data);
    } catch (error) {
        console.error(error);

        showError(
            "GronnFalk could not retrieve search results."
        );
    }
}

function displayResults(data) {
    const container = createResultsContainer();

    container.innerHTML = "";

    const navigation = createNavigation();

    container.appendChild(navigation);

    const results = data.results || [];

    if (results.length === 0) {
        container.insertAdjacentHTML(
            "beforeend",
            `
                <div class="results-status">
                    <h2>No results found</h2>
                    <p>
                        GronnFalk couldn't find anything for
                        "${escapeHTML(currentQuery)}".
                    </p>
                </div>
            `
        );

        return;
    }

    const resultsList = document.createElement("section");

    resultsList.className =
        currentCategory === "images"
            ? "image-results"
            : "web-results";

    results.forEach(function (result) {
        let element;

        if (currentCategory === "images") {
            element = createImageResult(result);
        } else if (currentCategory === "news") {
            element = createNewsResult(result);
        } else {
            element = createWebResult(result);
        }

        resultsList.appendChild(element);
    });

    container.appendChild(resultsList);
}

function setupResultsPage() {
    currentQuery = getQueryFromURL();
    currentCategory = getCategoryFromURL();

    if (!currentQuery) {
        return;
    }

    if (searchInput) {
        searchInput.value = currentQuery;
    }

    searchSearXNG();
}

function setupPage() {
    setupSearchForm();
    setupResultsPage();
}

document.addEventListener(
    "DOMContentLoaded",
    setupPage
);
