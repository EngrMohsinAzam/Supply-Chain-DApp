require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gas: 8000000, // Higher gas limit for complex contract
      gasPrice: 20000000000, // 20 gwei
      timeout: 60000, // 60 seconds timeout
    },
    hardhat: {
      chainId: 31337,
      gas: 12000000, // Higher gas limit for local testing
      gasPrice: 8000000000,
    },
  },
  mocha: {
    timeout: 60000 // 60 seconds timeout for tests
  }
};