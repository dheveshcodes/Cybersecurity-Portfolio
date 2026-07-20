# DFMS — Decentralised File Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Solidity](https://img.shields.io/badge/solidity-0.8.24-363636)
![Status](https://img.shields.io/badge/status-final--year--project-orange)

A secure, tamper-resistant file sharing platform built on **IPFS** for
decentralized storage, **Ethereum smart contracts** for verifiable
ownership and access control, and **zero-knowledge proofs (zk-SNARKs)**
for privacy-preserving ownership verification.

> Final year project — demonstrates a full-stack decentralized application
> combining content-addressed storage, on-chain access control, and ZKP-based
> identity/ownership proofs.

![App Screenshot](screenshots/dashboard.png)
![Upload Flow](screenshots/upload-flow.png)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [1. Clone & Install](#1-clone--install)
  - [2. Configure Environment](#2-configure-environment)
  - [3. Run a Local IPFS Node](#3-run-a-local-ipfs-node)
  - [4. Compile & Deploy Smart Contracts](#4-compile--deploy-smart-contracts)
  - [5. Build the ZKP Circuit](#5-build-the-zkp-circuit)
  - [6. Run the Backend](#6-run-the-backend)
  - [7. Run the Frontend](#7-run-the-frontend)
- [Usage](#usage)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 📦 **Decentralized Storage** — files are content-addressed and pinned to IPFS.
- 🔗 **On-Chain Ownership** — `FileRegistry.sol` binds each CID to a wallet address and content hash, immutably and verifiably.
- 🔐 **Access Control** — `AccessControl.sol` lets owners grant/revoke per-file access to other wallets.
- 🕵️ **Zero-Knowledge Ownership Proofs** — prove you own a file without revealing your secret, using a custom `circom` circuit + Groth16 (`snarkjs`).
- 🪪 **Wallet-Based Auth** — sign-in-with-Ethereum-style nonce flow, no passwords.
- 🧪 **Tested** — Jest/Supertest backend tests, Hardhat/Chai contract tests.
- 🖥️ **React Frontend** — upload, download, inspect metadata, generate/verify proofs, manage permissions.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full breakdown of
the data flow between the frontend, backend, IPFS, smart contracts, and the
ZKP module.

```
Frontend (React) ⇄ Backend API (Express) ⇄ IPFS Node
                              ⇅
                    Smart Contracts (Hardhat/Solidity)
                              ⇅
                    ZKP Module (circom + snarkjs)
```

## Project Structure

```
decentralized-file-management-system/
├── backend/                 # Express API: IPFS + blockchain + ZKP integration
│   ├── src/
│   │   ├── routes/          # files, proofs, access endpoints
│   │   ├── services/        # ipfsService, blockchainService, zkService
│   │   ├── middleware/      # JWT auth
│   │   ├── config/          # env-based configuration
│   │   └── index.js         # app entry point
│   └── tests/                # Jest + Supertest integration tests
├── contracts/                # Hardhat project
│   ├── contracts/
│   │   ├── FileRegistry.sol
│   │   ├── AccessControl.sol
│   │   └── Verifier.sol      # Groth16 verifier (generated from zkp circuit)
│   ├── scripts/deploy.js
│   └── test/FileRegistry.test.js
├── zkp/                       # Zero-knowledge proof circuit & tooling
│   ├── circuits/ownership.circom
│   ├── scripts/               # compile, prove, verify helpers
│   └── build/                 # generated wasm/zkey/vkey (gitignored)
├── frontend/                  # React (Vite) UI
│   └── src/
│       ├── components/        # FileUpload, FileList, ProofVerifier, PermissionsManager
│       ├── services/          # api.js, web3.js
│       └── App.jsx
├── sample-data/               # demo files for testing uploads
├── docs/                       # architecture & contributing docs
├── screenshots/                 # README screenshots (placeholders)
├── .env.example
├── LICENSE
└── README.md
```

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18.x | for backend, contracts, frontend |
| npm | ≥ 9.x | comes with Node |
| IPFS (Kubo) | ≥ 0.28 | local daemon, or use a pinning service |
| Hardhat | via devDependency | Ethereum development environment |
| circom | ≥ 2.1.6 | ZK circuit compiler ([install guide](https://docs.circom.io/getting-started/installation/)) |
| snarkjs | via devDependency | zk-SNARK proving/verification |
| MetaMask (or compatible wallet) | latest | for frontend wallet sign-in |

## Setup & Installation

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/decentralized-file-management-system.git
cd decentralized-file-management-system

# Install dependencies for each module
(cd backend && npm install)
(cd contracts && npm install)
(cd zkp && npm install)
(cd frontend && npm install)
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env` with your values — at minimum:
- `PRIVATE_KEY` — a wallet private key for deploying contracts and calling registry functions from the backend (use a **test** wallet, never a real funded key in a public repo)
- `RPC_URL` — your local Hardhat node URL (`http://127.0.0.1:8545`) or a testnet RPC (e.g. Infura/Alchemy Sepolia endpoint)
- `IPFS_API_URL` — your local IPFS daemon's API endpoint

### 3. Run a Local IPFS Node

```bash
ipfs init          # first time only
ipfs daemon        # starts the daemon on 127.0.0.1:5001 (API) and :8080 (gateway)
```

Alternatively, point `IPFS_API_URL` at a remote pinning service that exposes a compatible HTTP API.

### 4. Compile & Deploy Smart Contracts

Start a local blockchain in one terminal:

```bash
cd contracts
npx hardhat node
```

In another terminal, compile and deploy:

```bash
cd contracts
npm run compile
npm run deploy:local
```

Copy the printed contract addresses into your `.env`:

```
FILE_REGISTRY_ADDRESS=0x...
ACCESS_CONTROL_ADDRESS=0x...
```

> Note: `VERIFIER_ADDRESS` is deployed after generating the real ZK verifier contract in step 5 — redeploy once `Verifier.sol` has been regenerated from your circuit's proving key.

### 5. Build the ZKP Circuit

```bash
cd zkp
npm install
npm run compile
```

This compiles `ownership.circom`, runs a (development-only) trusted setup,
and regenerates `contracts/contracts/Verifier.sol` with the real verifying
key. Recompile and redeploy contracts (`npm run deploy:local` in
`contracts/`) after this step so `Verifier.sol` picks up the real circuit.

See [`zkp/README.md`](zkp/README.md) for details on the ownership circuit
and how proofs map to on-chain commitments.

### 6. Run the Backend

```bash
cd backend
npm install
npm run dev     # nodemon, auto-reloads on change
# or: npm start
```

The API will be available at `http://localhost:5000`. Check `GET /health`.

### 7. Run the Frontend

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`, connect your wallet (MetaMask, pointed at
your local Hardhat network), and start uploading files.

## Usage

1. **Connect Wallet** — click "Connect Wallet" and sign the nonce message.
2. **Upload a File** — select a file and click "Upload to IPFS". The file
   is pinned to IPFS and its CID + content hash are registered on-chain.
3. **Inspect / Download** — view on-chain metadata (owner, hash, timestamp)
   or download the file back from IPFS.
4. **Prove Ownership** — enter a secret and its public commitment to
   generate and verify a zero-knowledge proof of ownership.
5. **Manage Permissions** — grant or revoke access to a file for other
   wallet addresses.

Try it end-to-end with the included [`sample-data/demo-file.txt`](sample-data/demo-file.txt).

## Testing

```bash
# Backend unit/integration tests
cd backend && npm test

# Smart contract tests
cd contracts && npm test
```

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| GET | `/api/access/nonce/:address` | Get sign-in nonce | No |
| POST | `/api/access/login` | Exchange signature for JWT | No |
| POST | `/api/files/upload` | Upload file to IPFS + register on-chain | Yes |
| GET | `/api/files/:cid` | Download file (access-checked) | Yes |
| GET | `/api/files/:cid/metadata` | On-chain file metadata | Yes |
| POST | `/api/access/grant` | Grant access to an address | Yes |
| POST | `/api/access/revoke` | Revoke access from an address | Yes |
| GET | `/api/access/check/:cid/:address` | Check access | Yes |
| POST | `/api/proofs/generate` | Generate ZK ownership proof | Yes |
| POST | `/api/proofs/verify` | Verify ZK ownership proof | Yes |

## Security Notes

- The trusted setup used in `zkp/scripts/compile.sh` is for **development
  only**. Run a proper multi-party ceremony before any production use.
- Never commit `.env`, private keys, or `contracts/artifacts` — see
  `.gitignore`.
- The in-memory nonce store in `access.js` is for demo purposes; use Redis
  or a database-backed store in production, with nonce expiry.
- This project is an academic demonstration and has not undergone a
  professional smart-contract security audit — do not deploy to mainnet
  with real value without one.

## Roadmap

- [ ] Batch file upload and folder support
- [ ] On-chain event indexing (subgraph) for faster file listing
- [ ] Support for additional pinning services (Pinata, Web3.Storage)
- [ ] Production-grade trusted setup ceremony
- [ ] Role-based access (read/write/admin tiers)

## Contributing

Contributions are welcome — see [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).
