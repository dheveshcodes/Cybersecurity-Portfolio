/**
 * Access control + wallet-based authentication routes.
 * Uses a "sign-in with Ethereum"-style nonce flow: the client requests a
 * nonce, signs it with their wallet, and exchanges the signature for a JWT.
 */
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const config = require('../config/config');
const blockchainService = require('../services/blockchainService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// In-memory nonce store for demo purposes; use Redis or a DB in production.
const nonces = new Map();

/**
 * GET /api/access/nonce/:address
 * Issues a one-time nonce for the wallet address to sign.
 */
router.get('/nonce/:address', (req, res) => {
  const { address } = req.params;
  const nonce = `Sign in to DFMS. Nonce: ${crypto.randomBytes(16).toString('hex')}`;
  nonces.set(address.toLowerCase(), nonce);
  res.json({ nonce });
});

/**
 * POST /api/access/login
 * Body: { address: string, signature: string }
 * Verifies the signature against the issued nonce and returns a JWT.
 */
router.post('/login', async (req, res) => {
  try {
    const { address, signature } = req.body;
    const nonce = nonces.get(address.toLowerCase());
    if (!nonce) return res.status(400).json({ error: 'No nonce issued for this address' });

    const recovered = ethers.verifyMessage(nonce, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    nonces.delete(address.toLowerCase());
    const token = jwt.sign({ address }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

/**
 * POST /api/access/grant
 * Body: { cid: string, grantee: string }
 * Grants another wallet address access to a file (owner-only, enforced on-chain).
 */
router.post('/grant', requireAuth, async (req, res) => {
  try {
    const { cid, grantee } = req.body;
    const receipt = await blockchainService.grantAccess(cid, grantee);
    res.json({ message: 'Access granted', txHash: receipt.hash });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grant access', details: err.message });
  }
});

/**
 * POST /api/access/revoke
 * Body: { cid: string, grantee: string }
 */
router.post('/revoke', requireAuth, async (req, res) => {
  try {
    const { cid, grantee } = req.body;
    const receipt = await blockchainService.revokeAccess(cid, grantee);
    res.json({ message: 'Access revoked', txHash: receipt.hash });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke access', details: err.message });
  }
});

/**
 * GET /api/access/check/:cid/:address
 */
router.get('/check/:cid/:address', requireAuth, async (req, res) => {
  try {
    const { cid, address } = req.params;
    const allowed = await blockchainService.hasAccess(cid, address);
    res.json({ allowed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check access', details: err.message });
  }
});

module.exports = router;
