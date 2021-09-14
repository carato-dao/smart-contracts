const Carato721 = artifacts.require("./Carato721.sol");

module.exports = async(deployer, network) => {
    const umiProxyAddress = process.env.PROXY;
    const realOwnerAddress = process.env.OWNER;
    const contractName = process.env.NAME;
    const contractTicker = process.env.TICKER;
    const contractDescription = process.env.DESCRIPTION;
    const baseURI = process.env.BASEURI;
    const proxyEnabled = ((process.env.PROXY_ENABLED === 'true') ? true : false)
    const burningEnabled = ((process.env.BURNING_ENABLED === 'true') ? true : false)
    console.log('Proxy is:', proxyEnabled);
    console.log('Burning is:', burningEnabled);

    await deployer.deploy(Carato721, contractName, contractTicker, contractDescription, umiProxyAddress, proxyEnabled, burningEnabled, baseURI, { gas: 5000000 });
    const contract = await Carato721.deployed();
    console.log('CONTRACT ADDRESS IS*||*' + contract.address + '*||*')
};