const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "render.index.html"));
});

app.use(express.static(__dirname));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`GronnFalk Render instance running on port ${PORT}`);
});
