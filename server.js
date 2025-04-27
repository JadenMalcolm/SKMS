const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory (production build)
app.use(express.static(path.join(__dirname, 'dist')));

// For any route that doesn't match a static asset,
// send the index.html file to let Vue Router handle the routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});