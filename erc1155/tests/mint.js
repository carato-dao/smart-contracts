const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.GANACHE_MNEMONIC;
const NFT_CONTRACT_ADDRESS = process.env.GANACHE_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.GANACHE_OWNER_ADDRESS;
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')

async function main() {
    const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
    if (configs.owner_mnemonic !== undefined) {
        const provider = new HDWalletProvider(
            configs.owner_mnemonic,
            configs.provider
        );
        const web3Instance = new web3(provider);

        const nftContract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address, { gasLimit: "5000000" }
        );
        // CUSTOMIZE THE AMOUNT MINTED AND TOKEN ID
        const nft_type = 1
        const amount = 100
        const k = 0
        const value = 3
        const eventDate = "06-12-2021".split("-");
        const eventTime = "10:00".split(":");
        const start_timestamp = parseInt(new Date(eventDate[2], eventDate[1] - 1, eventDate[0], eventTime[0], eventTime[1]).getTime() / 1000)
        console.log('Setting timestamp to ' + start_timestamp)
        const nonce = await web3Instance.eth.getTransactionCount(configs.minters[k])
        console.log('Trying minting NFT ' + nft_type + ' with ' + configs.minters[k] + ' with nonce ' + nonce + '...')
        try {
            const check = await nftContract.methods.balanceOf(configs.minters[k], nft_type).call()
            console.log('Balance of type ' + nft_type + ' is ' + check)
            if (parseInt(check) < amount) {
                const toMint = amount - parseInt(check)
                console.log('Need to mint ' + toMint + ' NFTs')
                const result = await nftContract.methods
                    .mint(configs.minters[k], nft_type, toMint, "0x0", value, start_timestamp)
                    .send({ from: configs.minters[k], nonce: nonce, gasPrice: "100000000000" });
                console.log("NFT minted! Transaction: " + result.transactionHash);
            } else {
                console.log('NFT ' + nft_type + ' minted yet')
            }
        } catch (e) {
            console.log(e)
        }
        console.log('Finished!')
        process.exit()
    } else {
        console.log('Please provide `owner_mnemonic` first.')
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}