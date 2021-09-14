const Carato20 = artifacts.require("./Carato20.sol");

module.exports = async(deployer) => {
    await deployer.deploy(Carato20, { gas: 5000000 });
};