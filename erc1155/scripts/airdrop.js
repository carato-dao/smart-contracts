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
        let addresses = []
        let inputStream = fs.createReadStream('./airdrops/example.csv', 'utf8');
        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                let address = row[0].toLowerCase().trim().replace(/\s/g, "-")
                console.log('Adding address: ' + address)
                addresses.push(address)
            })
            .on('end', async function () {
                console.log('Found ' + addresses.length + ' addresses');
                let max = Math.ceil(addresses.length / configs.minters.length) - 1
                let minter = 0
                for (let k in addresses) {
                    if (chunks[configs.minters[minter]] !== undefined && chunks[configs.minters[minter]].length > max) {
                        minter++
                    }
                    if (chunks[configs.minters[minter]] === undefined) {
                        console.log('Defining minter group')
                        chunks[configs.minters[minter]] = []
                    }
                    chunks[configs.minters[minter]].push(addresses[k])
                    console.log('Assigning address to ' + configs.minters[minter])
                }
                console.log('Chunks are', chunks)
                for (let k in configs.minters) {
                    transferNFT(configs, chunks[configs.minters[k]], configs.minters[k])
                }
            });
    } else {
        console.log('Please provide `owner_mnemonic` first.')
    }

}

const transferNFT = (async (configs, group, minter) => {
    return new Promise(async response => {
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
        for (let k in group) {
            const address = group[k]
            console.log('Transferring token ' + nft_type + ' to ' + address)
            try {
                let nonce = await web3Instance.eth.getTransactionCount(minter)
                const transfer = await contract.methods
                    .safeTransferFrom(minter, address, nft_type, 1, "0x0")
                    .send({ from: minter, nonce: nonce, gasPrice: "200000000000", gas: "1000000" })
                console.log('Transfer successful!', transfer.transactionHash)
                nonce = await web3Instance.eth.getTransactionCount(minter)
                response(transfer)
            } catch (e) {
                console.log('Transfer errored..', e.message)
                response(false)
            }
        }
    })
})


if (argv._ !== undefined) {
    main()
} else {
    console.log('Provide a deployed contract first.')
}