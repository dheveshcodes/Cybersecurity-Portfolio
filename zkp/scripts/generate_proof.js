/**
 * Standalone CLI helper to generate a Groth16 ownership proof.
 * Usage: node generate_proof.js <ownerSecret> <commitment>
 *
 * This mirrors what backend/src/services/zkService.js does internally,
 * useful for quick testing of the circuit outside the API server.
 */
const path = require('path');
const snarkjs = require('snarkjs');

async function main() {
  const [, , ownerSecret, commitment] = process.argv;

  if (!ownerSecret || !commitment) {
    console.error('Usage: node generate_proof.js <ownerSecret> <commitment>');
    process.exit(1);
  }

  const wasmPath = path.join(__dirname, '../build/ownership_js/ownership.wasm');
  const zkeyPath = path.join(__dirname, '../build/ownership_final.zkey');

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { ownerSecret, commitment },
    wasmPath,
    zkeyPath
  );

  console.log('Proof:', JSON.stringify(proof, null, 2));
  console.log('Public signals:', publicSignals);
}

main().catch((err) => {
  console.error('Proof generation failed:', err);
  process.exit(1);
});
