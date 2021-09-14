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
    console.log('Transferring token...')
    const transfer = await contract.methods.transfer("0x0977979BFe5ccBC7feCA2bE15b9E303c96Bb1B6d", 1000).send({ from: OWNER_ADDRESS })
    console.log(transfer)
  } catch (e) {
    console.log(e)
  }

}

main();
