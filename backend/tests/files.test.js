/**
 * Example integration tests for the backend API.
 * Uses jest + supertest. Mocks the IPFS and blockchain services so tests
 * run without a live IPFS daemon or blockchain node.
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../src/config/config');

jest.mock('../src/services/ipfsService', () => ({
  uploadFile: jest.fn().mockResolvedValue({
    cid: 'QmTestCid123',
    size: 1024,
    gatewayUrl: 'https://ipfs.io/ipfs/QmTestCid123',
  }),
  getFile: jest.fn().mockResolvedValue(Buffer.from('test content')),
}));

jest.mock('../src/services/blockchainService', () => ({
  registerFile: jest.fn().mockResolvedValue({ hash: '0xTestTxHash' }),
  getFileRecord: jest.fn().mockResolvedValue({
    owner: '0xOwnerAddress',
    contentHash: '0xabc123',
    timestamp: 1700000000,
  }),
  hasAccess: jest.fn().mockResolvedValue(true),
}));

const app = require('../src/index');

function makeToken(address = '0xOwnerAddress') {
  return jwt.sign({ address }, config.jwt.secret, { expiresIn: '1h' });
}

describe('Files API', () => {
  const token = makeToken();

  test('rejects upload without auth token', async () => {
    const res = await request(app).post('/api/files/upload');
    expect(res.status).toBe(401);
  });

  test('rejects upload without a file', async () => {
    const res = await request(app)
      .post('/api/files/upload')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('uploads a file and registers it on-chain', async () => {
    const res = await request(app)
      .post('/api/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('hello world'), 'hello.txt');

    expect(res.status).toBe(201);
    expect(res.body.cid).toBe('QmTestCid123');
    expect(res.body.txHash).toBe('0xTestTxHash');
  });

  test('returns file metadata for an owner', async () => {
    const res = await request(app)
      .get('/api/files/QmTestCid123/metadata')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.owner).toBe('0xOwnerAddress');
  });

  test('health check responds ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
