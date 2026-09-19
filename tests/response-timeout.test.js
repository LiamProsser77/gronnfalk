const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function loadBackend(fetch) {
    const routes = new Map();
    const app = { use() {}, get(route, handler) { routes.set(route, handler); }, listen() {} };
    const express = () => app;
    express.json = () => {};
    const timers = new Map();
    const context = vm.createContext({
        require: () => express,
        process: { env: {} },
        console: { error() {} },
        AbortController,
        URLSearchParams,
        fetch,
        setTimeout(callback, delay) {
            timers.set(callback, delay);
            return callback;
        },
        clearTimeout(callback) {
            timers.delete(callback);
        }
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../backend/server.js"), "utf8"), context);
    return { context, timers, routes };
}

test("keeps the timeout active until a stalled response body is aborted", async () => {
    const { context, timers } = loadBackend(async (url, { signal }) => ({
        ok: true,
        status: 200,
        json: () => new Promise((resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        })
    }));
    const search = context.searchSearXNG("test", "general");
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(timers.size, 1, "Receiving headers must not cancel the body timeout");
    const [expire, delay] = timers.entries().next().value;
    assert.equal(delay, 5000);
    expire();
    assert.equal((await search).length, 0);
    assert.equal(timers.size, 0);
});

test("returns normal search results and clears the timer", async () => {
    const { context, timers } = loadBackend(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ results: [{ title: "Result", url: "https://example.com" }] })
    }));
    const results = await context.searchSearXNG("test", "general");
    assert.equal(results.length, 1);
    assert.equal(results[0].title, "Result");
    assert.equal(timers.size, 0);
});

test("clears the timer after invalid JSON or an HTTP error", async () => {
    for (const ok of [true, false]) {
        const { context, timers } = loadBackend(async () => ({
            ok,
            status: ok ? 200 : 503,
            json: async () => { throw new Error("invalid JSON"); }
        }));
        assert.equal((await context.searchSearXNG("test", "general")).length, 0);
        assert.equal(timers.size, 0);
    }
});

test("preserves 4get and Wikipedia response handling", async () => {
    const { context, timers, routes } = loadBackend(async url => ({
        ok: true,
        status: 200,
        json: async () => url.includes("wikipedia.org")
            ? { title: "Example", extract: "An example summary" }
            : { web: [{ title: "Example", url: "https://example.com" }] }
    }));
    const results = await context.search4get("test", "general");
    assert.equal(results[0].title, "Example");
    assert.equal(results[0].source, "4get");
    let wikipedia;
    await routes.get("/wikipedia")({ query: { q: "Example" } }, {
        json(data) { wikipedia = data; }
    });
    assert.equal(wikipedia.found, true);
    assert.equal(wikipedia.extract, "An example summary");
    assert.equal(timers.size, 0);
});

test("preserves Wikipedia's not-found response for HTTP errors", async () => {
    const { timers, routes } = loadBackend(async () => ({
        ok: false,
        status: 404,
        json: async () => { assert.fail("Error response bodies should not be parsed"); }
    }));
    let wikipedia;
    await routes.get("/wikipedia")({ query: { q: "Missing" } }, {
        json(data) { wikipedia = data; }
    });
    assert.equal(wikipedia.found, false);
    assert.equal(timers.size, 0);
});
