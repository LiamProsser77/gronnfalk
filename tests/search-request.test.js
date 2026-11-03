const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function loadFrontend(localStorage) {
    const requests = [];
    const container = { innerHTML: "", appendChild() {}, insertAdjacentHTML() {} };
    const context = vm.createContext({
        URL,
        URLSearchParams,
        document: {
            querySelector(selector) {
                return selector === ".results-container" ? container : null;
            },
            createElement() { return { innerHTML: "", textContent: "" }; },
            addEventListener() {}
        },
        fetch: async url => {
            requests.push(new URL(url));
            return { ok: true, json: async () => ({ results: [] }) };
        },
        localStorage,
        console
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../app.js"), "utf8"), context);
    return { context, requests };
}

function loadBackendSearch(fetch) {
    const routes = new Map();
    const app = { use() {}, get(route, handler) { routes.set(route, handler); }, listen() {} };
    const express = () => app;
    express.json = () => {};
    const context = vm.createContext({
        require: () => express,
        process: { env: {} },
        console: { error() {} },
        URL,
        URLSearchParams,
        AbortController,
        setTimeout,
        clearTimeout,
        fetch
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../backend/server.js"), "utf8"), context);
    return routes.get("/search");
}

async function runBackendSearch(engines) {
    const hosts = [];
    const search = loadBackendSearch(async url => {
        const host = new URL(url).hostname;
        hosts.push(host);
        const result = { title: host, url: `https://example.com/${host}` };
        return { ok: true, status: 200, json: async () => ({ results: [result], web: [result] }) };
    });
    const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
    const query = engines === undefined ? { q: "cats" } : { q: "cats", engines };
    await search({ query }, response);
    return { hosts: hosts.sort(), response };
}

test("frontend requests the backend search route for every category", async () => {
    const { context, requests } = loadFrontend();

    for (const category of ["general", "images", "news"]) {
        vm.runInContext(`currentQuery = "cats & dogs?"; currentCategory = "${category}";`, context);
        await context.searchSearXNG();
        const url = requests.at(-1);
        assert.equal(url.origin, "https://gronnfalk-api-aijg.onrender.com");
        assert.equal(url.pathname, "/search");
        assert.equal(url.searchParams.get("q"), "cats & dogs?");
        assert.equal(url.searchParams.get("format"), "json");
        assert.equal(url.searchParams.get("category"), category);
        assert.equal(url.searchParams.get("categories"), category === "general" ? null : category);
    }
    assert.equal(requests.length, 3);
});

test("frontend sends every engine when settings are missing or invalid", async () => {
    for (const saved of [null, "not json", "null"]) {
        const { context, requests } = loadFrontend({ getItem: () => saved });
        vm.runInContext(`currentQuery = "cats";`, context);
        await context.searchSearXNG();
        assert.equal(requests.at(-1).searchParams.get("engines"), "searxng,4get,degoog");
    }
});

test("frontend sends only the engines enabled in settings", async () => {
    const saved = { searxng: true, google: false, "4get": false, degoog: true };
    const { context, requests } = loadFrontend({
        getItem: key => key === "gronnfalk-search-engines" ? JSON.stringify(saved) : null
    });
    vm.runInContext(`currentQuery = "cats";`, context);
    await context.searchSearXNG();
    assert.equal(requests.at(-1).searchParams.get("engines"), "searxng,degoog");
});

test("backend queries every engine when no engines are given", async () => {
    const { hosts, response } = await runBackendSearch(undefined);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(hosts, ["degoog.org", "search.yonderly.org", "searx-ie07.onrender.com"]);
    assert.equal(response.body.results.length, 3);
});

test("backend queries only the given engines and ignores unknown names", async () => {
    const { hosts, response } = await runBackendSearch("searxng,google,degoog");
    assert.equal(response.statusCode, 200);
    assert.deepEqual(hosts, ["degoog.org", "searx-ie07.onrender.com"]);
    assert.deepEqual(Array.from(response.body.results, result => result.source), ["SearXNG", "Degoog"]);
    assert.equal(response.body.sources.fourget, 0);
});

test("backend rejects searches with no enabled engines", async () => {
    for (const engines of ["", "google,brave"]) {
        const { hosts, response } = await runBackendSearch(engines);
        assert.equal(response.statusCode, 400);
        assert.equal(response.body.error, "No search engines enabled");
        assert.equal(hosts.length, 0);
    }
});
