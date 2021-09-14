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
    console.log('Minting new tokens...')
    const mint = await contract.methods.mint(OWNER_ADDRESS, 10000000).send({ from: OWNER_ADDRESS })
    console.log(mint)
  } catch (e) {
    console.log(e)
  }

}

main();
