const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

// Load the backend without opening a port or contacting search providers.
const app = { use() {}, get() {}, listen() {} };
const express = () => app;
express.json = () => {};
const context = vm.createContext({
    require(name) {
        assert.equal(name, "express");
        return express;
    },
    process: { env: {} },
    URL,
    console
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
