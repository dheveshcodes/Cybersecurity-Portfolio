# ZKP Module — Ownership Circuit

This module contains the zk-SNARK circuit and tooling used to prove file
ownership without revealing the underlying secret.

## How it works

1. On file registration, the client generates a random `ownerSecret` and
   computes `commitment = Poseidon(ownerSecret)`.
2. The `commitment` is stored on-chain (or in the backend) alongside the
   file's CID — the secret itself never leaves the client.
3. To prove ownership later, the client runs the `ownership.circom` circuit
   with `ownerSecret` as a private input and `commitment` as a public input,
   producing a Groth16 proof.
4. Anyone (the backend, another user, or the `Verifier.sol` contract) can
   verify the proof against the public commitment, confirming ownership
   with zero knowledge of the secret.

## Setup

```bash
cd zkp
npm install
npm run compile   # compiles the circuit and runs the trusted setup
```

This produces:
- `build/ownership_js/ownership.wasm` — witness generator
- `build/ownership_final.zkey` — proving key
- `build/verification_key.json` — verification key
- `../contracts/contracts/Verifier.sol` — on-chain verifier (auto-generated)

## Generating and verifying a proof manually

```bash
node scripts/generate_proof.js <ownerSecret> <commitment>
node scripts/verify_proof.js proof.json public.json
```

> ⚠️ The trusted setup contribution in `compile.sh` is for development only.
> For a production deployment, run a proper multi-party Powers of Tau
> ceremony and do not reuse this repository's demo `.ptau`/`.zkey` files.
