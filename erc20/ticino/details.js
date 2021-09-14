const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.TICINO_MNEMONIC;
const CONTRACT_ADDRESS = process.env.TICINO_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.TICINO_OWNER_ADDRESS;
const ABI = require('../abi.json')

async function main() {
  if (MNEMONIC !== undefined && CONTRACT_ADDRESS !== undefined && OWNER_ADDRESS !== undefined) {
    const provider = new HDWalletProvider(
      MNEMONIC,
      `https://rpctest.quadrans.io`
    );
    const web3Instance = new web3(provider);

    const contract = new web3Instance.eth.Contract(
      ABI,
      CONTRACT_ADDRESS,
      { gasLimit: "5000000" }
    );

    try {
      console.log('Getting token details...')
      const supply = await contract.methods.totalSupply().call()
      console.log('Supply is', supply)
      const symbol = await contract.methods.symbol().call()
      console.log('Symbol is', symbol)
      const decimals = await contract.methods.decimals().call()
      console.log('Decimals are', decimals)
      const balance = await contract.methods.balanceOf(OWNER_ADDRESS).call()
      console.log('Balance is', balance)
    } catch (e) {
      console.log(e)
    }
  } else {
    console.log('Provide a needed details first.')
  }
}

main();
