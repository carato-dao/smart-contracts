// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../erc20/IERC20.sol";
import "../../erc1155/IERC1155.sol";

contract CaratoVesting is Ownable {
    IERC1155 private Carato1155;
    IERC20 private Carato20;
    mapping(uint256 => mapping(address => bool)) public _tokensClaimed;
    event Claimed(address indexed _by, uint256 indexed _id_event, uint256 _value);

    function selectErc20(address _address) public onlyOwner {
        Carato20 = IERC20(_address);
    }

    function selectErc1155(address _address) public onlyOwner {
        Carato1155 = IERC1155(_address);
    }

    function claimTokens(uint256 _id_event) public {
        uint256 value = Carato1155.returnEventValue(_id_event);
        require(value > 0, "CaratoVesting: Event doesn't exists");
        require(_tokensClaimed[_id_event][msg.sender] == false, "CaratoVesting: You already claimed your tokens");
        require(Carato1155.balanceOf(msg.sender, _id_event) > 0, "CaratoVesting: You must own the 1155 token");
        _tokensClaimed[_id_event][msg.sender] = true;
        Carato20.mint(msg.sender, value);
        emit Claimed(msg.sender, _id_event, value);
    }
}