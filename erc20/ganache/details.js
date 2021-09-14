const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.MNEMONIC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const ABI = require('../abi.json')

async function main() {
  const provider = new HDWalletProvider(
    MNEMONIC,
    "http://localhost:7545"
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

}

main();
