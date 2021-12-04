const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.GANACHE_MNEMONIC;
const NFT_CONTRACT_ADDRESS = process.env.GANACHE_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.GANACHE_OWNER_ADDRESS;
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const CsvReadableStream = require('csv-reader')
const fs = require('fs')
let chunks = {}
async function main() {
    const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
    if (configs.owner_mnemonic !== undefined) {
        const provider = new HDWalletProvider(
            configs.owner_mnemonic,
            configs.provider
        );
        const web3Instance = new web3(provider)
        const gasPrice = await web3Instance.eth.getGasPrice() * 15
        console.log('USING GAS ' + gasPrice)
        const contract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address
        );

        // CHANGE THIS PARAM TO SEND ANOTHER TYPE OF AIRDROP
        const nft_type = 1
        const k = 0
        const receiver = '0xbB6Ac9074A71B4653f698B30bCcDf1C95D86bd96'
        const check = await contract.methods.balanceOf(receiver, nft_type).call()
        console.log('NFT balance is: ' + check)
        if (parseInt(check) === 0) {
            try {
                let nonce = await web3Instance.eth.getTransactionCount(configs.minters[k])
                const transfer = await contract.methods
                    .safeTransferFrom(configs.minters[k], receiver, nft_type, 1, "0x0")
                    .send({ from: configs.minters[k], nonce: nonce, gasPrice: "200000000000", gas: "1000000" })
                console.log('Transfer successful!', transfer.transactionHash)
            } catch (e) {
                console.log('Transfer errored..', e.message)
            }
        } else {
            console.log('NFT already sent to ' + receiver)
        }
    }
}

if (argv._ !== undefined) {
    main()
} else {
    console.log('Provide a deployed contract first.')
}