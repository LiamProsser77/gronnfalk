const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    name: "GronnFalk API",
    status: "online"
  });
});
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({
      error: "Missing search query"
    });
  }

  try {
    const searchURL =
      "https://searx.party/search?q=" +
      encodeURIComponent(query) +
      "&format=json";

    const response = await fetch(searchURL, {
      headers: {
        "User-Agent": "GronnFalk/1.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "SearXNG search failed",
        status: response.status
      });
    }

    const data = await response.json();

    res.json({
      query: query,
      results: data.results || []
    });

  } catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
      error: "Unable to contact SearXNG"
    });
  }
});
app.listen(PORT, () => {
  console.log(`GronnFalk API running on port ${PORT}`);
});
