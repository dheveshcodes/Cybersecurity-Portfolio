require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '../.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      url: process.env.RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
