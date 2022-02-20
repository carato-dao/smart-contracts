// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IERC1155.sol";

contract CaratoVesting is Ownable {
    IERC1155 private MEGO;
    IERC20 private Carato20;
    mapping(uint256 => mapping(address => bool)) public _tokensClaimed;
    mapping(uint256 => uint256) public _approved;
    event Claimed(
        address indexed _by,
        uint256 indexed _id_event,
        uint256 _value
    );
    address _daoAddress;

    function selectDaoAddress(address _address) public onlyOwner {
        _daoAddress = _address;
    }

    function selectErc20(address _address) public onlyOwner {
        Carato20 = IERC20(_address);
    }

    function selectErc1155(address _address) public onlyOwner {
        MEGO = IERC1155(_address);
    }

    function approveEvent(uint256 _id_event, uint256 _value) public {
        require(
            msg.sender == _daoAddrerss,
            "CaratoVesting: Only Dao can approve events"
        );
        _approved[_id_event] = _value;
    }

    function claimTokens(uint256 _id_event) public {
        uint256 value = _approved[_id_event];
        require(value > 0, "CaratoVesting: Event doesn't exists");
        require(
            _tokensClaimed[_id_event][msg.sender] == false,
            "CaratoVesting: You already claimed your tokens"
        );
        require(
            Carato1155.balanceOf(msg.sender, _id_event) > 0,
            "CaratoVesting: You must own the 1155 token"
        );
        _tokensClaimed[_id_event][msg.sender] = true;
        Carato20.mint(msg.sender, value);
        emit Claimed(msg.sender, _id_event, value);
    }
}
