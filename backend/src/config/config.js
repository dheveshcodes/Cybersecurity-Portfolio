/**
 * Central configuration loader.
 * All values are pulled from environment variables (see .env.example).
 */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  ipfs: {
    // Use a local IPFS daemon or a pinning service (e.g. Infura, Web3.Storage) endpoint
    apiUrl: process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0',
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs',
  },
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
    privateKey: process.env.PRIVATE_KEY || '',
    fileRegistryAddress: process.env.FILE_REGISTRY_ADDRESS || '',
    accessControlAddress: process.env.ACCESS_CONTROL_ADDRESS || '',
    verifierAddress: process.env.VERIFIER_ADDRESS || '',
  },
  zkp: {
    wasmPath: process.env.ZKP_WASM_PATH || '../zkp/build/ownership_js/ownership.wasm',
    zkeyPath: process.env.ZKP_ZKEY_PATH || '../zkp/build/ownership_final.zkey',
    vkeyPath: process.env.ZKP_VKEY_PATH || '../zkp/build/verification_key.json',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  },
};
