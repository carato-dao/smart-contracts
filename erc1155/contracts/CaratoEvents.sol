// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CaratoEvents is ERC1155, Ownable {
    
    address proxyRegistryAddress;
    string metadata_uri;
    mapping(address => bool) private _minters;

    constructor(address _proxyRegistryAddress) ERC1155("https://api.carato.org/nfts/{id}.json") {
        proxyRegistryAddress = _proxyRegistryAddress;
        metadata_uri = "https://api.carato.org/nfts/{id}.json";
    }

    function setURI(string memory newuri) public onlyOwner {
        metadata_uri = newuri;
        _setURI(newuri);
    }

    function contractURI() public view returns (string memory){
        return metadata_uri;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
    {
        require(isMinter(msg.sender), "CaratoEvents: Only minters can mint");
        _mint(account, id, amount, data);
    }

    /*
        This method will add or remove minting roles.
    */
    function isMinter(address _toCheck) public view returns (bool) {
        return _minters[_toCheck] == true;
    }

    function addMinter(address _toAdd) public onlyOwner {
        _minters[_toAdd] = true;
    }

    function removeMinter(address _toRemove) public onlyOwner {
        _minters[_toRemove] = false;
    }

    /**
   * Override isApprovedForAll to auto-approve OS's proxy contract
   */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
       if (_operator == address(proxyRegistryAddress)) {
            return true;
        }
        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}