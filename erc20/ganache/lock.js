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
    console.log('Adding locked tokens...')
    await contract.methods.addlock(OWNER_ADDRESS, 10000).send({ from: OWNER_ADDRESS })
    await contract.methods.addlock(OWNER_ADDRESS, 5000).send({ from: OWNER_ADDRESS })
    const locked = await contract.methods.locks(OWNER_ADDRESS).call()
    console.log('Locked tokens:', locked)

    console.log('Minting locked tokens...')
    await contract.methods.mintlock(OWNER_ADDRESS).send({ from: OWNER_ADDRESS })

    const balance = await contract.methods.balanceOf(OWNER_ADDRESS).call()
    console.log('Balance:', balance)

    const locked_after = await contract.methods.locks(OWNER_ADDRESS).call()
    console.log('Locked tokens after mintings:', locked_after)

    console.log('Try minting tokens after minting, should error...')
    try {
      let errored = await contract.methods.mintlock(OWNER_ADDRESS).send({ from: OWNER_ADDRESS })
      console.log(errored)
    } catch (e) {
      console.log('Errored correctly!', e.message)
    }

  } catch (e) {
    console.log(e)
  }

}

main();
