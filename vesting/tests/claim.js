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
        const idEvent = 1
        console.log('Claiming tokens..')
        const claimed = await vestingContract.methods.claimTokens(idEvent).send({ from: configs.receiver_user, gasPrice: "100000000000" })
        console.log(claimed)
        process.exit();
    } catch (e) {
        console.log(e)
        process.exit();
    }
}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}