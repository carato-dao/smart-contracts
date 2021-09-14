const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')

async function main() {
    const configs = JSON.parse(fs.readFileSync('./deployed/' + argv._ + '.json').toString())
    const provider = new HDWalletProvider(
        configs.proxy_mnemonic,
        configs.provider
    );
    const web3Instance = new web3(provider);

    const nftContract = new web3Instance.eth.Contract(
        NFT_CONTRACT_ABI,
        configs.contract_address, { gasLimit: "5000000", gasPrice: "200000000000" }
    );

    const name = await nftContract.methods.name().call();
    const symbol = await nftContract.methods.symbol().call();
    const owner = await nftContract.methods.owner().call();
    console.log('|* NFT DETAILS *|')
    console.log('>', name, symbol, '<')
    console.log('Owner is', owner)

    try {
        console.log('Trying transfer NFT...')
        const result = await nftContract.methods
            .transferFrom(configs.proxy_address, configs.proxy_address, 0)
            .send({ from: configs.proxy_address });
        console.log("NFT transferred! Transaction: " + result.transactionHash);
        console.log(result)
    } catch (e) {
        console.log(e)
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}