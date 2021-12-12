const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config()

module.exports = {
    contracts_directory: "./contracts/",
    plugins: [
        'truffle-plugin-verify'
    ],
    api_keys: {
        polygonscan: "CI1U9JUBM1TURUJ7E63Z6KPVJ5VZGZVPI4"
    },
    networks: {
        ganache: {
            host: "localhost",
            port: 7545,
            gas: 5000000,
            gasPrice: 15000000000,
            network_id: "*", // Match any network id
        },
        mumbai: {
            provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER),
            network_id: 80001,
            confirmations: 2,
            gasPrice: "5000000000",
            timeoutBlocks: 200,
            skipDryRun: true
        },
        polygon: {
            provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER),
            network_id: 137,
            confirmations: 2,
            timeoutBlocks: 200,
            gasPrice: "6000000000",
            skipDryRun: true
        }
    },
    compilers: {
        solc: {
            version: "^0.8.4"
        },
    },
};