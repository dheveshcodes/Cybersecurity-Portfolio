# Contributing to DFMS

Thanks for your interest in improving the Decentralised File Management
System! This is primarily an academic/final-year project, but contributions,
issues, and suggestions are welcome.

## Getting Started

1. Fork the repository and clone your fork.
2. Follow the setup steps in the main `README.md` to get backend, contracts,
   ZKP tooling, and frontend running locally.
3. Create a feature branch: `git checkout -b feature/your-feature-name`.

## Code Style

- JavaScript/Node: standard CommonJS in `backend/`, ES modules in
  `frontend/`. Keep functions small and documented with JSDoc comments.
- Solidity: follow the existing NatSpec comment style; run
  `npx hardhat compile` before submitting changes to contracts.
- Circom: keep circuits minimal and well-commented; document public vs.
  private signals clearly.

## Testing

- Backend: `cd backend && npm test`
- Contracts: `cd contracts && npm test`
- Please add or update tests for any behavioral change.

## Submitting Changes

1. Ensure all tests pass locally.
2. Write clear commit messages (imperative mood, e.g. "Add access revoke
   endpoint").
3. Open a pull request describing the change, why it's needed, and how it
   was tested.

## Reporting Issues

Please include:
- Steps to reproduce
- Expected vs. actual behavior
- Relevant logs (redact any private keys or secrets!)
