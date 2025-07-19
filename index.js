const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto-load semua route
const routes = require('./routes');
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
