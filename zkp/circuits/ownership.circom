pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";

/*
 * Ownership Circuit
 * ------------------
 * Proves that the prover knows a secret value (ownerSecret) whose Poseidon
 * hash equals a public commitment, WITHOUT revealing ownerSecret itself.
 *
 * Usage in DFMS:
 *   1. When a user registers a file, they generate a random ownerSecret and
 *      compute commitment = Poseidon(ownerSecret). The commitment (not the
 *      secret) is stored alongside the file's on-chain record.
 *   2. To prove ownership later (e.g. to unlock file access or claim a
 *      dispute), the user generates a proof with this circuit, supplying
 *      ownerSecret as a private input and commitment as a public input.
 *   3. The Verifier.sol contract or backend zkService checks the proof
 *      against the stored commitment, confirming ownership without ever
 *      learning ownerSecret.
 */
template Ownership() {
    // Private input: known only to the prover
    signal input ownerSecret;

    // Public input: the on-chain commitment being proven against
    signal input commitment;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== ownerSecret;

    // Constrain the computed hash to equal the public commitment
    commitment === hasher.out;
}

component main { public [commitment] } = Ownership();
