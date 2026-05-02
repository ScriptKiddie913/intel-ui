const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from project root (index.html, app.js, styles.css)
app.use(express.static(path.join(__dirname)));

// Mount the API handler
let searchHandler;
try {
  searchHandler = require('./api/search.js');
} catch (err) {
  console.error('Failed to load API handler:', err);
}

if (searchHandler) {
  app.post('/api/search', async (req, res) => {
    try {
      await searchHandler(req, res);
    } catch (err) {
      console.error('API /api/search handler error', err);
      res.status(500).json({ error: 'internal server error' });
    }
  });
}

// Health
app.get('/health', (req, res) => res.send('ok'));

app.listen(port, () => {
  console.log(`Render-compatible server listening on port ${port}`);
});

module.exports = app;
