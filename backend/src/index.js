/**
 * DFMS Backend Entry Point
 * Wires together middleware and routes for the Decentralised File
 * Management System API.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');

const filesRouter = require('./routes/files');
const proofsRouter = require('./routes/proofs');
const accessRouter = require('./routes/access');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

app.use('/api/files', filesRouter);
app.use('/api/proofs', proofsRouter);
app.use('/api/access', accessRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DFMS backend listening on port ${config.port}`);
  });
}

module.exports = app;
