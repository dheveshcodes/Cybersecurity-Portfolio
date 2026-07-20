/**
 * Deployment script for FileRegistry, AccessControl, and the ZK Verifier.
 * Run with: npx hardhat run scripts/deploy.js --network <network>
 */
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const FileRegistry = await hre.ethers.getContractFactory('FileRegistry');
  const fileRegistry = await FileRegistry.deploy();
  await fileRegistry.waitForDeployment();
  console.log('FileRegistry deployed to:', await fileRegistry.getAddress());

  const AccessControl = await hre.ethers.getContractFactory('AccessControl');
  const accessControl = await AccessControl.deploy(await fileRegistry.getAddress());
  await accessControl.waitForDeployment();
  console.log('AccessControl deployed to:', await accessControl.getAddress());

  const Groth16Verifier = await hre.ethers.getContractFactory('Groth16Verifier');
  const groth16Verifier = await Groth16Verifier.deploy();
  await groth16Verifier.waitForDeployment();
  console.log('Groth16Verifier deployed to:', await groth16Verifier.getAddress());

  const OwnershipVerifier = await hre.ethers.getContractFactory('OwnershipVerifier');
  const ownershipVerifier = await OwnershipVerifier.deploy(await groth16Verifier.getAddress());
  await ownershipVerifier.waitForDeployment();
  console.log('OwnershipVerifier deployed to:', await ownershipVerifier.getAddress());

  console.log('\nAdd these to your .env file:');
  console.log(`FILE_REGISTRY_ADDRESS=${await fileRegistry.getAddress()}`);
  console.log(`ACCESS_CONTROL_ADDRESS=${await accessControl.getAddress()}`);
  console.log(`VERIFIER_ADDRESS=${await ownershipVerifier.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
