const dID = artifacts.require("./dID.sol");
const fs = require('fs')

module.exports = async(deployer, network) => {
    await deployer.deploy(dID);
    const contract = await dID.deployed();
    let configs = JSON.parse(fs.readFileSync('./configs/' + network + '.json').toString())
    console.log('Saving address in config file..')
    configs.contract_address = contract.address
    fs.writeFileSync('./configs/' + network + '.json', JSON.stringify(configs, null, 4))
    console.log('--')
};