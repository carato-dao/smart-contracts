// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Carato20 is ERC20, ERC20Burnable, Pausable, Ownable {
    uint8 token_decimals;
    mapping(address => bool) private _minters;

    constructor(string memory _name, string memory _ticker, uint8 _decimals) ERC20(_name, _ticker) {
        token_decimals = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return token_decimals;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public {
        require(isMinter(msg.sender), "Carato20: Only minters can mint");
        _mint(to, amount);
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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
