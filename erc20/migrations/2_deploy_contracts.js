const Carato20 = artifacts.require("./Carato20.sol");
const fs = require('fs')

module.exports = async(deployer, network) => {
    const name = process.env.NAME;
    const ticker = process.env.TICKER;
    const decimals = process.env.DECIMALS;
    await deployer.deploy(Carato20, name, ticker, decimals, { gas: 5000000 });
    const contract = await Carato20.deployed();
    let configs = JSON.parse(fs.readFileSync('./configs/' + network + '.json').toString())
    console.log('Saving address in config file..')
    configs.contract_address = contract.address
    fs.writeFileSync('./configs/' + network + '.json', JSON.stringify(configs, null, 4))
    console.log('--')
};