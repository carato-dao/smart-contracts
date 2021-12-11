const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')

async function main() {
    try {
        const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
        const provider = new HDWalletProvider(
            configs.owner_mnemonic,
            configs.provider
        );
        const web3Instance = new web3(provider);
        const vestingContract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address
        );
        console.log('Fixing addresses..')
        await vestingContract.methods.selectErc20(configs.erc_20).send({ from: configs.owner_address, gasPrice: "100000000000" })
        await vestingContract.methods.selectErc1155(configs.erc_1155).send({ from: configs.owner_address, gasPrice: "100000000000" })
        console.log('Done')
        process.exit();
    } catch (e) {
        console.log(e.message)
        process.exit();
    }
}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}