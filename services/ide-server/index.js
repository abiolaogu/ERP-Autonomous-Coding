const express = require('express');
const app = express();
app.get('/healthz', (_req, res) => res.json({ status: 'healthy', service: 'ide-server' }));
app.listen(8080, () => console.log('ide-server listening on :8080'));
