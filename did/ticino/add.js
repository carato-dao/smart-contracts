const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
const crypto = require('crypto');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet')
const ETHWallet = require('ethereumjs-wallet')
const Wallet = ETHWallet.default
const strings = require('@supercharge/strings')
require('dotenv').config()
const ETH_DERIVATION_PATH = 'm/44\'/60\'/0\'/0';

const MNEMONIC = process.env.TICINO_MNEMONIC;
const CONTRACT_ADDRESS = process.env.TICINO_CONTRACT;
const OWNER_ADDRESS = process.env.TICINO_OWNER;
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
    { gasLimit: "5000000", gasPrice: "1000000000" }
  );

  try {
    console.log('Adding identity to smart contract...')
    // First create a random hash, usually should be something predefined, like a printed QR-Code.
    console.log('--')
    const card_hash = "ddea535da3f46ca6e881a81f2b7b983ac76fb5f01e84d59252e18fcfbf932cc0"
    console.log('CARD HASH IS:', card_hash)
    console.log('--')
    const pin = "123456"

    // Calculate the public hash, which is an hash of the printed one.
    const public_hash = crypto.createHash('sha256').update(card_hash).digest('hex')
    // Then merge the hash with the user pin, to create a new unique hash.
    const mnemonic_hash = crypto.createHash('sha256').update(card_hash + '*' + pin).digest('hex')
    // Generate and print the mnemonic, this will be always the same.
    const mnemonic = bip39.entropyToMnemonic(mnemonic_hash)
    console.log('GENERATED MNEMONIC IS: ' + mnemonic)
    console.log('--')
    // Calculate the IV by the original qr-code.
    const iv = card_hash.substr(0, 8) + card_hash.substr(-8)
    console.log('CALCULATED IV:', iv)
    // Then encrypt the mnemonic (or whathever you want) with the pin of the user and the IV derived from the printed qr-code.
    const identity = encrypt(mnemonic, iv, pin)
    console.log('GENERATED IDENTITY:', identity)
    console.log('--')
    // Finally return the public address.
    const address = await returnaddress(mnemonic)
    console.log('PUBLIC ADDRESS IS:', address)
    console.log('--')

    await contract.methods.setIdentity(identity, address, public_hash).send({ from: OWNER_ADDRESS })
    // Now checking if eID is stored correctly
    const stored = await contract.methods.returnEid(public_hash).call({ from: OWNER_ADDRESS })
    if (identity === stored) {
      console.log('Identity added successfully!')
      console.log('eID is:', stored)
    } else {
      console.log('Something goes wrong')
    }
    process.exit()
  } catch (e) {
    let error = e.message
    console.log("--")
    console.log(error)
    console.log("--")
    process.exit()
  }

}

main();
