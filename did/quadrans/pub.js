const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
const crypto = require('crypto');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet')
const ETHWallet = require('ethereumjs-wallet')
const Wallet = ETHWallet.default
require('dotenv').config()
const ETH_DERIVATION_PATH = 'm/44\'/60\'/0\'/0';

const MNEMONIC = process.env.QUADRANS_MNEMONIC;
const CONTRACT_ADDRESS = process.env.QUADRANS_CONTRACT;
const OWNER_ADDRESS = process.env.QUADRANS_OWNER;
const ABI = require('../abi.json')

const encrypt = ((val, iv, password) => {
  if (password === undefined) {
    password = key
  }
  let pwd = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32)
  let cipher = crypto.createCipheriv('aes-256-cbc', pwd, iv)
  let encrypted = cipher.update(val, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
})

const returnaddress = (async (mnemonic) => {
  const hdwallet = hdkey.fromMasterSeed(await bip39.mnemonicToSeed(mnemonic));
  const derivePath = hdwallet.derivePath(ETH_DERIVATION_PATH).deriveChild(0);
  const privkey = derivePath.getWallet().getPrivateKeyString();
  const wallet = Wallet.fromPrivateKey(Buffer.from(privkey.replace('0x', ''), 'hex'));
  const address = wallet.getAddressString()
  return address
})

async function main() {
  const provider = new HDWalletProvider(
    MNEMONIC,
    "https://rpctest.quadrans.io"
  );
  const web3Instance = new web3(provider);

  const contract = new web3Instance.eth.Contract(
    ABI,
    CONTRACT_ADDRESS,
    { gasLimit: "5000000" }
  );

  try {
    console.log('Adding identity to smart contract...')

    const card_hash = "ddea535da3f46ca6e881a81f2b7b983ac76fb5f01e84d59252e18fcfbf932cc0";
    const public_hash = crypto.createHash('sha256').update(card_hash).digest('hex')
    const stored = await contract.methods.returnPublicAddress(public_hash).call()
    console.log('Public address:', stored)

  } catch (e) {
    console.log(e)
  }

}

main();
