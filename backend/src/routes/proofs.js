/**
 * Zero-Knowledge Proof routes: generate and verify ownership proofs
 * without revealing the underlying secret.
 */
const express = require('express');
const zkService = require('../services/zkService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/proofs/generate
 * Body: { ownerSecret: string, commitment: string }
 * Generates a Groth16 proof that the caller knows the secret behind a
 * public commitment (e.g. a hash stored on-chain at file registration time).
 */
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { ownerSecret, commitment } = req.body;
    if (!ownerSecret || !commitment) {
      return res.status(400).json({ error: 'ownerSecret and commitment are required' });
    }

    const { proof, publicSignals } = await zkService.generateProof({ ownerSecret, commitment });
    const calldata = await zkService.formatCalldata(proof, publicSignals);

    res.json({ proof, publicSignals, calldata });
  } catch (err) {
    console.error('[zk-generate] error:', err);
    res.status(500).json({ error: 'Failed to generate proof', details: err.message });
  }
});

/**
 * POST /api/proofs/verify
 * Body: { proof: object, publicSignals: string[] }
 * Verifies a proof off-chain (a mirrored on-chain check is also available
 * via the Verifier.sol contract for trustless verification).
 */
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    if (!proof || !publicSignals) {
      return res.status(400).json({ error: 'proof and publicSignals are required' });
    }

    const isValid = await zkService.verifyProof(proof, publicSignals);
    res.json({ valid: isValid });
  } catch (err) {
    console.error('[zk-verify] error:', err);
    res.status(500).json({ error: 'Failed to verify proof', details: err.message });
  }
});

module.exports = router;
