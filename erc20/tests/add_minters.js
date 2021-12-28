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
        const nftContract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address
        );
        let minters = configs.minters
        for (let k in minters) {
            console.log('Checking if ' + minters[k] + ' is enabled..')
            const before = await nftContract.methods.isMinter(minters[k]).call();
            if (!before) {
                await nftContract.methods.addMinter(minters[k]).send({
                    from: configs.owner_address,
                    gasPrice: "100000000000"
                })
                const after = await nftContract.methods.isMinter(minters[k]).call();
                console.log(minters[k] + ' enabled to mint:', after)
            } else {
                console.log(minters[k] + ' enabled to mint yet')
            }
        }
        console.log('Adding owner..')
        const before = await nftContract.methods.isMinter(configs.owner_address).call();
        if (!before) {
            await nftContract.methods.addMinter(configs.owner_address).send({
                from: configs.owner_address,
                gasPrice: "100000000000"
            })
            const after = await nftContract.methods.isMinter(configs.owner_address).call();
            console.log('Owner enabled to mint:', after)
        } else {
            console.log('Owner is enabled yet.')
        }
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