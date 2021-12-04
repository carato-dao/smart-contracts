// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract Contract is Ownable {
    IERC1155 private Carato1155;
    IERC20 private Carato20;

    function selectErc20(address _address) public onlyOwner {
        Carato20 = IERC20(_address);
    }
    function selectErc1155(address _address) public onlyOwner {
        Carato1155 = IERC1155(_address);
    }
}