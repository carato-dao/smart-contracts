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

const decrypt = ((encrypted, password) => {
  if (password === undefined) {
    password = key
  }
  try {
    let parts = encrypted.split('*')
    let pwd = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32)
    let decipher = crypto.createDecipheriv('aes-256-cbc', pwd, parts[0])
    let decrypted = decipher.update(parts[1], 'hex', 'utf8')
    return (decrypted + decipher.final('utf8'))
  } catch (e) {
    return false
  }
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
    console.log('Recovering identity from smart contract...')
    // Set a predefined card hash, should be something offline and available to the user.
    const card_hash = "fd82ea775b7b622c2ab6ad4829a2910693f952a5f32594d35fea1058dc3808cc";
    const pin = "123456"
    console.log('CARD HASH IS:', card_hash)
    console.log('--')
    // Calculate the public hash, which is an hash of the printed one.
    const public_hash = crypto.createHash('sha256').update(card_hash).digest('hex')
    // Derive the IV to create the final string
    const iv = card_hash.substr(0, 8) + card_hash.substr(-8)
    console.log('CALCULATED IV:', iv)
    console.log('--')

    const vault = await contract.methods.returnEid(public_hash).call()
    console.log('VAULT IS:', vault)
    console.log('--')

    // Create the original encrypted string
    const eid = iv + '*' + vault
    // Try to recover the mnemonic
    const mnemonic = decrypt(eid, pin)
    console.log('MNEMONIC IS:', mnemonic)
    console.log('--')
    // Finally recover the public address.
    const address = await returnaddress(mnemonic)
    console.log('PUBLIC ADDRESS IS:', address)

  } catch (e) {
    console.log(e)
  }

}

main();
