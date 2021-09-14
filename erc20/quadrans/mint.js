const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.QUADRANS_MNEMONIC;
const CONTRACT_ADDRESS = process.env.QUADRANS_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.QUADRANS_OWNER_ADDRESS;
const ABI = require('../abi.json')

async function main() {
  if (MNEMONIC !== undefined && CONTRACT_ADDRESS !== undefined && OWNER_ADDRESS !== undefined) {
    const provider = new HDWalletProvider(
      MNEMONIC,
      `https://rpc.quadrans.io`
    );
    const web3Instance = new web3(provider);

    const contract = new web3Instance.eth.Contract(
      ABI,
      CONTRACT_ADDRESS,
      { gasLimit: "5000000" }
    );

    try {
      console.log('Minting new supply...')
      let amount = 100000000
      const mint = await contract.methods.mint(OWNER_ADDRESS, amount).send({ from: OWNER_ADDRESS })
      console.log(mint)
    } catch (e) {
      console.log(e)
    }
  } else {
    console.log('Provide a needed details first.')
  }
}

main();
