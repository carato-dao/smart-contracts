// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract dID is Ownable {
    mapping(string => address) identities;
    mapping(string => string) vault;
    mapping(address => string) hashes;

    /*
     * This method will write or overwrite the identity of a single user.
    */
    function setIdentity(string memory _identity, address _address, string memory _hash) public onlyOwner {
        vault[_hash] = _identity;
        identities[_hash] = _address;
        hashes[_address] = _hash;
    }

    /*
     * This method will return the initial vault to the owner if some user needs to recover it's wallet.
    */
    function returnEid(string memory _hash) public view returns(string memory) {
        return vault[_hash];
    }

    /*
     * This method will return the initial vault to the owner if some user needs to recover it's wallet.
    */
    function returnVault() public view returns(string memory) {
        string memory _hash = hashes[msg.sender];
        return vault[_hash];
    }

    /*
     * This method will register an identity for a given hash, it needs that the hash was never registered.
    */
    function registerIdentity(string memory _identity, string memory _hash) public {
        require(identities[_hash] == address(0), "dID: This hash have been registered yet.");
        vault[_hash] = _identity;
        identities[_hash] = msg.sender;
        hashes[msg.sender] = _hash;
    }

    /*
     * This method will return the public address of a given hash.
    */
    function returnPublicAddress(string memory _hash) public view returns(address){
        return identities[_hash];
    }

}
