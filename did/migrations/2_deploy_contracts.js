const dID = artifacts.require("./dID.sol");

module.exports = async (deployer) => {
  await deployer.deploy(dID, { gas: 5000000 });
};
