/**
 * Blockchain Service
 * Wraps ethers.js interactions with the FileRegistry, AccessControl,
 * and ZK Verifier smart contracts.
 */
const { ethers } = require('ethers');
const config = require('../config/config');

const FileRegistryABI = require('../../../contracts/artifacts/contracts/FileRegistry.sol/FileRegistry.json').abi;
const AccessControlABI = require('../../../contracts/artifacts/contracts/AccessControl.sol/AccessControl.json').abi;

const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
const wallet = config.blockchain.privateKey
  ? new ethers.Wallet(config.blockchain.privateKey, provider)
  : null;

function getFileRegistryContract(signerOrProvider = wallet || provider) {
  return new ethers.Contract(
    config.blockchain.fileRegistryAddress,
    FileRegistryABI,
    signerOrProvider
  );
}

function getAccessControlContract(signerOrProvider = wallet || provider) {
  return new ethers.Contract(
    config.blockchain.accessControlAddress,
    AccessControlABI,
    signerOrProvider
  );
}

/**
 * Register a file's IPFS CID and content hash on-chain, establishing the
 * caller's wallet as the verifiable owner.
 * @param {string} cid - IPFS content identifier
 * @param {string} contentHash - keccak256 hash of the raw file bytes
 */
async function registerFile(cid, contentHash) {
  const contract = getFileRegistryContract();
  const tx = await contract.registerFile(cid, contentHash);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Read file ownership/metadata from the FileRegistry contract.
 * @param {string} cid
 */
async function getFileRecord(cid) {
  const contract = getFileRegistryContract();
  const record = await contract.getFile(cid);
  return {
    owner: record.owner,
    contentHash: record.contentHash,
    timestamp: Number(record.timestamp),
  };
}

/**
 * Grant a wallet address access to a specific file (owner-only on-chain check).
 * @param {string} cid
 * @param {string} granteeAddress
 */
async function grantAccess(cid, granteeAddress) {
  const contract = getAccessControlContract();
  const tx = await contract.grantAccess(cid, granteeAddress);
  return tx.wait();
}

/**
 * Revoke a previously granted access permission.
 * @param {string} cid
 * @param {string} granteeAddress
 */
async function revokeAccess(cid, granteeAddress) {
  const contract = getAccessControlContract();
  const tx = await contract.revokeAccess(cid, granteeAddress);
  return tx.wait();
}

/**
 * Check whether an address currently has access to a file.
 * @param {string} cid
 * @param {string} address
 */
async function hasAccess(cid, address) {
  const contract = getAccessControlContract();
  return contract.checkAccess(cid, address);
}

module.exports = {
  provider,
  wallet,
  registerFile,
  getFileRecord,
  grantAccess,
  revokeAccess,
  hasAccess,
  getFileRegistryContract,
  getAccessControlContract,
};
