/**
 * Unit tests for FileRegistry and AccessControl contracts using Hardhat + Chai.
 */
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

describe('FileRegistry', function () {
  let fileRegistry, owner, other;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const FileRegistry = await ethers.getContractFactory('FileRegistry');
    fileRegistry = await FileRegistry.deploy();
    await fileRegistry.waitForDeployment();
  });

  it('registers a new file with the caller as owner', async function () {
    const cid = 'QmTestCid';
    const hash = ethers.keccak256(ethers.toUtf8Bytes('file-content'));

    await expect(fileRegistry.registerFile(cid, hash))
      .to.emit(fileRegistry, 'FileRegistered')
      .withArgs(cid, owner.address, hash, anyValue);

    const record = await fileRegistry.getFile(cid);
    expect(record.owner).to.equal(owner.address);
    expect(record.contentHash).to.equal(hash);
  });

  it('reverts when registering a duplicate CID', async function () {
    const cid = 'QmDuplicate';
    const hash = ethers.keccak256(ethers.toUtf8Bytes('content'));
    await fileRegistry.registerFile(cid, hash);

    await expect(fileRegistry.registerFile(cid, hash)).to.be.revertedWith(
      'FileRegistry: file already registered'
    );
  });

  it('allows the owner to transfer ownership', async function () {
    const cid = 'QmTransfer';
    const hash = ethers.keccak256(ethers.toUtf8Bytes('content'));
    await fileRegistry.registerFile(cid, hash);

    await fileRegistry.transferOwnership(cid, other.address);
    const record = await fileRegistry.getFile(cid);
    expect(record.owner).to.equal(other.address);
  });

  it('rejects ownership transfer from a non-owner', async function () {
    const cid = 'QmProtected';
    const hash = ethers.keccak256(ethers.toUtf8Bytes('content'));
    await fileRegistry.registerFile(cid, hash);

    await expect(
      fileRegistry.connect(other).transferOwnership(cid, other.address)
    ).to.be.revertedWith('FileRegistry: caller is not the owner');
  });

  it('verifies file integrity correctly', async function () {
    const cid = 'QmIntegrity';
    const hash = ethers.keccak256(ethers.toUtf8Bytes('original-content'));
    await fileRegistry.registerFile(cid, hash);

    expect(await fileRegistry.verifyIntegrity(cid, hash)).to.equal(true);
    const wrongHash = ethers.keccak256(ethers.toUtf8Bytes('tampered-content'));
    expect(await fileRegistry.verifyIntegrity(cid, wrongHash)).to.equal(false);
  });
});

describe('AccessControl', function () {
  let fileRegistry, accessControl, owner, grantee, stranger;

  beforeEach(async function () {
    [owner, grantee, stranger] = await ethers.getSigners();

    const FileRegistry = await ethers.getContractFactory('FileRegistry');
    fileRegistry = await FileRegistry.deploy();
    await fileRegistry.waitForDeployment();

    const AccessControl = await ethers.getContractFactory('AccessControl');
    accessControl = await AccessControl.deploy(await fileRegistry.getAddress());
    await accessControl.waitForDeployment();

    const hash = ethers.keccak256(ethers.toUtf8Bytes('content'));
    await fileRegistry.registerFile('QmAccessTest', hash);
  });

  it('grants and checks access for a new address', async function () {
    await accessControl.grantAccess('QmAccessTest', grantee.address);
    expect(await accessControl.checkAccess('QmAccessTest', grantee.address)).to.equal(true);
    expect(await accessControl.checkAccess('QmAccessTest', stranger.address)).to.equal(false);
  });

  it('revokes previously granted access', async function () {
    await accessControl.grantAccess('QmAccessTest', grantee.address);
    await accessControl.revokeAccess('QmAccessTest', grantee.address);
    expect(await accessControl.checkAccess('QmAccessTest', grantee.address)).to.equal(false);
  });

  it('always grants the file owner access', async function () {
    expect(await accessControl.checkAccess('QmAccessTest', owner.address)).to.equal(true);
  });

  it('rejects grant calls from non-owners', async function () {
    await expect(
      accessControl.connect(stranger).grantAccess('QmAccessTest', grantee.address)
    ).to.be.revertedWith('AccessControl: caller is not the file owner');
  });
});
