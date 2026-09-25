const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

test("frontend requests the backend search route for every category", async () => {
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
        console
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../app.js"), "utf8"), context);

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
