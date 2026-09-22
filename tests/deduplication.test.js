const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

// Load the backend without opening a port or contacting search providers.
const routes = new Map();
const app = { use() {}, get(route, handler) { routes.set(route, handler); }, listen() {} };
const express = () => app;
express.json = () => {};
const context = vm.createContext({
    require(name) {
        assert.equal(name, "express");
        return express;
    },
    process: { env: {} },
    URL,
    URLSearchParams,
    AbortController,
    setTimeout,
    clearTimeout,
    console: { error() {} }
});
vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../backend/server.js"), "utf8"),
    context
);
const removeDuplicates = context.removeDuplicates;

test("preserves case-sensitive paths and query values", () => {
    const results = [
        { url: "https://example.com/Page" },
        { url: "https://example.com/page" },
        { url: "https://example.com/?id=ABC" },
        { url: "https://example.com/?id=abc" }
    ];
    assert.deepEqual(removeDuplicates(results), results);
});

test("deduplicates hostname case and whitespace, retaining the first result", () => {
    const first = { url: "https://EXAMPLE.com/Page", title: "First provider" };
    const duplicate = { url: " https://example.com/Page ", title: "Second provider" };
    assert.deepEqual(removeDuplicates([first, duplicate, first]), [first]);
    assert.equal(first.url, "https://EXAMPLE.com/Page");
});

test("skips missing URLs and handles malformed URLs without throwing", () => {
    const malformed = { url: "not a URL" };
    assert.deepEqual(removeDuplicates([{}, { url: "" }, malformed, malformed]), [malformed]);
});

test("skips non-string and blank URLs while retaining valid results", () => {
    const first = { url: "https://example.com/first" };
    const second = { url: "https://example.com/second" };
    const invalid = [null, undefined, {}, { url: null }, { url: 42 },
        { url: true }, { url: {} }, { url: [] }, { url: " \t\n " }];
    assert.deepEqual(removeDuplicates([first, ...invalid, second, first]), [first, second]);
});

test("search returns valid results from both providers despite a non-string URL", async () => {
    context.fetch = async url => ({
        ok: true,
        status: 200,
        json: async () => url.includes("searx")
            ? { results: [{ url: 42 }, { url: "https://example.com/searx" }] }
            : { web: [{ url: "https://example.com/4get" }] }
    });
    let status = 200;
    let body;
    await routes.get("/search")({ query: { q: "example" } }, {
        status(code) { status = code; return this; },
        json(data) { body = data; }
    });
    assert.equal(status, 200);
    assert.deepEqual(Array.from(body.results, result => result.url), [
        "https://example.com/searx",
        "https://example.com/4get"
    ]);
});
