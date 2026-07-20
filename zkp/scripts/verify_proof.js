/**
 * Standalone CLI helper to verify a Groth16 ownership proof against the
 * verification key. Expects proof.json and public.json in the current
 * directory (the default snarkjs output file names), or pass paths as args.
 * Usage: node verify_proof.js [proof.json] [public.json]
 */
const path = require('path');
const fs = require('fs');
const snarkjs = require('snarkjs');

async function main() {
  const proofPath = process.argv[2] || 'proof.json';
  const publicPath = process.argv[3] || 'public.json';
  const vkeyPath = path.join(__dirname, '../build/verification_key.json');

  const proof = JSON.parse(fs.readFileSync(proofPath));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath));
  const vKey = JSON.parse(fs.readFileSync(vkeyPath));

  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  console.log(isValid ? '✅ Proof is valid' : '❌ Proof is invalid');
  process.exit(isValid ? 0 : 1);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
