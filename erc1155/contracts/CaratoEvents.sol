// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CaratoEvents is ERC1155, Ownable {
    
    address proxyRegistryAddress;
    string metadata_uri;
    mapping(address => bool) private _minters;
    mapping(uint256 => uint256) public _eventValues;
    mapping(uint256 => uint256) public _claimDeadline;
    mapping(uint256 => uint256) public _startTimestamp;
    uint256 public _maxValue = 5;
    bool public _mintingAuthored = false;
    address public _daoAddress;
    uint256 _deadlineDays = 7;

    constructor(address _proxyRegistryAddress) ERC1155("https://api.carato.org/nfts/{id}.json") {
        proxyRegistryAddress = _proxyRegistryAddress;
        metadata_uri = "https://api.carato.org/nfts/{id}.json";
    }

    function setURI(string memory newuri) public onlyOwner {
        metadata_uri = newuri;
        _setURI(newuri);
    }

    function setAuthored(bool state) public onlyOwner {
        _mintingAuthored = state;
    }

    function setDeadlineDays(uint256 newday) public onlyOwner {
        _deadlineDays = newday;
    }

    function setDaoAddress(address newaddress) public onlyOwner {
        _daoAddress = newaddress;
    }

    function setMaxValue(uint256 newvalue) public onlyOwner {
        _maxValue = newvalue;
    }

    function contractURI() public view returns (string memory){
        return metadata_uri;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data, uint256 value, uint256 start_timestamp) public {
        if(_mintingAuthored) {
            require(msg.sender == _daoAddress, "CaratoEvents: Minting is authored");
        } else {
            require(isMinter(msg.sender), "CaratoEvents: Only minters can mint");
        }
        require(block.timestamp < start_timestamp, "CaratoEvents: Can't mint token in the past");
        require(value > 0, "CaratoEvents: Value must be at least 1");
        require(value <= _maxValue, "CaratoEvents: Value too high");
        _eventValues[id] = value;
        _startTimestamp[id] = start_timestamp;
        _claimDeadline[id] = start_timestamp + (_deadlineDays * 2 days);
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
   * Overriding to disallow the transfer
   */
     function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal override {
        require(isMinter(msg.sender), "CaratoEvents: Only minters can transfer tokens");
        require(from == msg.sender, "CaratoEvents: Only owner can move tokens");
        // Require event started
        require(block.timestamp >= _startTimestamp[id], "CaratoEvents: Can't move before beginning");
        // Burn all tokens if try to transfer after deadline
        if(block.timestamp >= _claimDeadline[id]) {
            uint256 balance = ERC1155.balanceOf(from, id);
            return ERC1155._burn(from, id, balance);
        } else {
            require(ERC1155.balanceOf(to, id) == 0, "CaratoEvents: Can't send more than one NFT to same account");
            return ERC1155._safeTransferFrom(from, to, id, amount, data);
        }
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override pure {
        require(1 < 0, "CaratoEvents: Batch transfers are disabled");
    }

    /**
   * Override isApprovedForAll to auto-approve OS's proxy contract
   */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override virtual view returns (bool isOperator) {
       if (_operator == address(proxyRegistryAddress)) {
            return true;
        }
        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}