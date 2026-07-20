/**
 * IPFS Service
 * Handles adding files to IPFS and retrieving them via the configured gateway.
 */
const { create } = require('ipfs-http-client');
const config = require('../config/config');

const client = create({ url: config.ipfs.apiUrl });

/**
 * Upload a file buffer to IPFS.
 * @param {Buffer} fileBuffer - raw file content
 * @param {string} fileName - original file name (stored as metadata only)
 * @returns {Promise<{cid: string, size: number, gatewayUrl: string}>}
 */
async function uploadFile(fileBuffer, fileName) {
  const { cid, size } = await client.add(
    { path: fileName, content: fileBuffer },
    { pin: true }
  );

  return {
    cid: cid.toString(),
    size,
    gatewayUrl: `${config.ipfs.gatewayUrl}/${cid.toString()}`,
  };
}

/**
 * Fetch a file's content from IPFS by CID.
 * @param {string} cid
 * @returns {Promise<Buffer>}
 */
async function getFile(cid) {
  const chunks = [];
  for await (const chunk of client.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Unpin a file from the local IPFS node (does not guarantee removal from the network).
 * @param {string} cid
 */
async function unpinFile(cid) {
  await client.pin.rm(cid);
}

module.exports = { uploadFile, getFile, unpinFile };
