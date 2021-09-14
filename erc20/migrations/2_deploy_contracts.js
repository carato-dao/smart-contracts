const Carato20 = artifacts.require("./Carato20.sol");

module.exports = async(deployer) => {
    const name = process.env.NAME;
    const ticker = process.env.TICKER;
    const decimals = process.env.DECIMALS;
    const realOwnerAddress = process.env.OWNER;
    await deployer.deploy(Carato20, name, ticker, decimals, { gas: 5000000 });
    const contract = await Carato20.deployed();
    console.log('CONTRACT ADDRESS IS*||*' + contract.address + '*||*')
};