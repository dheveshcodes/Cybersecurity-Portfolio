/**
 * File routes: upload to IPFS + register ownership on-chain, and retrieval.
 */
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * POST /api/files/upload
 * Uploads a file to IPFS and registers its CID + content hash on-chain.
 */
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const contentHash = '0x' + crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const { cid, size, gatewayUrl } = await ipfsService.uploadFile(req.file.buffer, req.file.originalname);

    const receipt = await blockchainService.registerFile(cid, contentHash);

    res.status(201).json({
      message: 'File uploaded and registered successfully',
      cid,
      size,
      gatewayUrl,
      contentHash,
      txHash: receipt.hash,
    });
  } catch (err) {
    console.error('[upload] error:', err);
    res.status(500).json({ error: 'Failed to upload file', details: err.message });
  }
});

/**
 * GET /api/files/:cid
 * Streams the file content from IPFS, provided the caller has access.
 */
router.get('/:cid', requireAuth, async (req, res) => {
  try {
    const { cid } = req.params;
    const record = await blockchainService.getFileRecord(cid);

    const isOwner = record.owner.toLowerCase() === req.user.address.toLowerCase();
    const permitted = isOwner || (await blockchainService.hasAccess(cid, req.user.address));

    if (!permitted) {
      return res.status(403).json({ error: 'Access denied for this file' });
    }

    const buffer = await ipfsService.getFile(cid);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (err) {
    console.error('[download] error:', err);
    res.status(500).json({ error: 'Failed to retrieve file', details: err.message });
  }
});

/**
 * GET /api/files/:cid/metadata
 * Returns on-chain ownership metadata for a file without exposing content.
 */
router.get('/:cid/metadata', requireAuth, async (req, res) => {
  try {
    const record = await blockchainService.getFileRecord(req.params.cid);
    res.json(record);
  } catch (err) {
    res.status(404).json({ error: 'File record not found', details: err.message });
  }
});

module.exports = router;
