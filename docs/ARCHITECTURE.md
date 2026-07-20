# Architecture Overview

## System Components

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────┐
│   Frontend   │────▶│   Backend API     │────▶│   IPFS Node     │
│  (React/Vite)│◀────│  (Node/Express)   │◀────│  (file storage) │
└──────────────┘      └──────────────────┘      └────────────────┘
                              │      ▲
                              ▼      │
                       ┌──────────────────┐
                       │   Blockchain      │
                       │ FileRegistry.sol  │
                       │ AccessControl.sol │
                       │ Verifier.sol (ZK) │
                       └──────────────────┘
                              ▲
                              │
                       ┌──────────────────┐
                       │   ZKP Module      │
                       │ circom + snarkjs  │
                       └──────────────────┘
```

## Data Flow

1. **Upload**: The client sends a file to the backend, which pins it to
   IPFS and receives a content identifier (CID). The backend hashes the
   raw bytes (SHA-256) and calls `FileRegistry.registerFile(cid, hash)`,
   which permanently binds the CID and hash to the caller's wallet address
   on-chain.
2. **Ownership commitment**: Separately, the client can generate a random
   secret and compute a Poseidon hash commitment client-side (or via the
   zk service). This commitment can be attached to a file record for later
   zero-knowledge ownership proofs, without ever exposing the secret.
3. **Access control**: File owners call `AccessControl.grantAccess` /
   `revokeAccess` to manage a per-CID allowlist. `checkAccess` is consulted
   by the backend before serving file content from IPFS.
4. **Zero-knowledge proof of ownership**: A user proves they know the
   secret behind a commitment using the `ownership.circom` circuit and
   snarkjs, producing a Groth16 proof that can be verified off-chain (via
   `zkService.verifyProof`) or on-chain (via `Verifier.sol`).
5. **Authentication**: The frontend uses a "sign-in with Ethereum"-style
   flow — request a nonce, sign it with the wallet, exchange the signature
   for a JWT — so no passwords are stored anywhere.

## Why Zero-Knowledge Proofs?

Traditional ownership verification (e.g. "type your password") requires
revealing a secret to a verifier. In a decentralized system, this creates a
single point of trust and a leakage risk. Using a zk-SNARK, a user can prove
"I know the secret behind this on-chain commitment" without ever revealing
that secret to the backend, a smart contract, or any observer of the
transaction — preserving both integrity (only the true holder can prove
ownership) and privacy (no secret material is ever transmitted).

## Trust Assumptions

- IPFS ensures content-addressing and tamper-evidence (a CID changes if the
  file content changes), but does not guarantee persistence — pinning
  services or your own node must keep content available.
- FileRegistry/AccessControl are the on-chain source of truth for
  ownership and permissions; the backend is a convenience layer, not a
  trust anchor.
- The zk-SNARK trusted setup (Powers of Tau + circuit-specific phase 2)
  must be run properly (ideally as a multi-party ceremony) before
  production use — see `zkp/README.md`.
