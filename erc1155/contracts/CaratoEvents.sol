// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CaratoEvents
 * CaratoEvents - Smart contract events
 */
contract CaratoEvents is ERC1155, Ownable {
    IME private _me;
    string metadata_uri;
    mapping(uint256 => string) public _idToEventMetadata;
    mapping(string => uint256) public _metadataToEventId;
    mapping(uint256 => address) public _creators;
    mapping(address => uint256[]) public _created;
    mapping(address => uint256[]) public _received;
    mapping(uint256 => uint256) internal _endTimestamp;
    mapping(uint256 => uint256) internal _startTimestamp;
    mapping(uint256 => mapping(address => bool)) internal _addressWhitelist;
    mapping(uint256 => mapping(address => bool)) internal _addressBlacklist;
    mapping(uint256 => bool) public _eventValidated;
    mapping(uint256 => uint256) public _eventValues;
    uint256 nonce = 0;
    uint256 MAX_VALUE = 5;
    address daoAddreess;

    constructor()
        ERC1155("https://nft.carato.org/{id}.json")
    {
        metadata_uri = "https://nft.carato.org/{id}.json";
    }

    /**
     * Admin functions to fix base uri if needed
     */
    function setURI(string memory newuri) public onlyOwner {
        metadata_uri = newuri;
        _setURI(newuri);
    }

    /**
     * Admin functions to set dao address
     */
    function setDaoAddress(address newaddress) public onlyOwner {
        daoAddreess = newaddress;
    }

    /**
     * Admin functions to set max value
     */
    function setMaxValue(uint256 newvalue) public onlyOwner {
        MAX_VALUE = newvalue;
    }

    /**
     * Validate prepared event
     */
    function validate(uint256 id) public {
        require(msg.sender == daoAddress, "CaratoEvents: Not Dao address");
        _eventValidated[id] = true;
    }

    function returnEventValue(uint256 id) public view returns (uint256) {
        require(_eventValues[id] > 0, "CaratoEvents: Event doesn't exists");
        return _eventValues[id];
    }

    function prepare(
        uint256 start_timestamp,
        uint256 end_timestamp,
        string memory metadata,
        uint256 value
    ) public returns (uint256) {
        require(value <= MAX_VALUE, "Value must be less than max");
        require(
            block.timestamp < start_timestamp,
            "CaratoEvents: Start time must be in the future"
        );
        require(
            _metadataToEventId[metadata] == 0,
            "CaratoEvents: Trying to push same event to another id"
        );
        uint256 id = uint256(
            keccak256(
                abi.encodePacked(nonce, msg.sender, blockhash(block.number - 1))
            )
        );
        while (_startTimestamp[id] > 0) {
            nonce += 1;
            id = uint256(
                keccak256(
                    abi.encodePacked(
                        nonce,
                        msg.sender,
                        blockhash(block.number - 1)
                    )
                )
            );
        }
        _eventValues[id] = value;
        _idToEventMetadata[id] = metadata;
        _metadataToEventId[metadata] = id;
        _startTimestamp[id] = start_timestamp;
        _endTimestamp[id] = end_timestamp;
        _creators[id] = msg.sender;
        _created[msg.sender].push(id);
        return id;
    }

    function created(address _creator)
        public
        view
        returns (uint256[] memory createdTokens)
    {
        return _created[_creator];
    }

    function received(address _receiver)
        public
        view
        returns (uint256[] memory receivedTokens)
    {
        return _received[_receiver];
    }

    function tokenCID(uint256 id)
        public
        view
        returns (string memory)
    {
        return _idToEventMetadata[id];
    }

    function mint(uint256 id, uint256 amount) public {
        require(_startTimestamp[id] > 0, "CaratoEvents: This event doesn't exists");
        require(_eventValidated, "CaratoEvents: Event has not been validated");
        require(
            _creators[id] == msg.sender,
            "CaratoEvents: Can't mint tokens you haven't created"
        );
        require(
            block.timestamp < _endTimestamp[id],
            "CaratoEvents: Can't mint after the end of the event"
        );
        _mint(msg.sender, id, amount, bytes(""));
    }

    function claim(uint256 id) public {
        require(_startTimestamp[id] > 0, "CaratoEvents: This event doesn't exists");
        require(_eventValidated, "CaratoEvents: Event has not been validated");
        require(
            block.timestamp < _endTimestamp[id],
            "CaratoEvents: Can't claim after the end of the event"
        );
        address to = msg.sender;
        require(
            ERC1155.balanceOf(to, id) == 0,
            "CaratoEvents: Can't send more than one NFT to same account"
        );
        require(_addressBlacklist[id][to] == false, "Address is in blacklist");
        require(_addressWhitelist[id][to] == true, "Address is in blacklist");
        _received[to].push(id);
        _mint(to, id, 1, bytes(""));
    }

    function manageAddressWhitelist(
        uint256 id,
        address[] memory addresses,
        bool state,
        uint256 list
    ) public {
        require(
            _creators[id] == msg.sender,
            "CaratoEvents: Can't manage whitelist, not the owner"
        );
        require(_startTimestamp[id] > 0, "CaratoEvents: This event doesn't exists");
        require(
            block.timestamp < _endTimestamp[id],
            "CaratoEvents: Can't manage after the end of the event"
        );
        if (list == 0) {
            for (uint256 i = 0; i < addresses.length; i++) {
                _addressWhitelist[id][addresses[i]] = state;
            }
        } else {
            for (uint256 i = 0; i < addresses.length; i++) {
                _addressBlacklist[id][addresses[i]] = state;
            }
        }
    }

    /**
     * Function to get the creator of a specific event
     */
    function creatorOfEvent(uint256 tknId) public view returns (address) {
        return _creators[tknId];
    }

    /**
     * Function to get the whitelist status
     */
    function isInAddressWhitelist(uint256 id, address who)
        public
        view
        returns (bool)
    {
        return _addressWhitelist[id][who];
    }

    /**
     * Function to get the blacklist status
     */
    function isInAddressBlacklist(uint256 id, address who)
        public
        view
        returns (bool)
    {
        return _addressBlacklist[id][who];
    }

    function transferBadge(
        address to,
        uint256 id
    ) public {
        require(
            creatorOfEvent(id) == msg.sender,
            "CaratoEvents: Only creator can transfer tokens"
        );
        require(
            to != address(0),
            "CaratoEvents: Must specify address"
        );
        require(
            ERC1155.balanceOf(msg.sender, id) > 0,
            "CaratoEvents: Must own that token"
        );
        // Require event started
        require(
            block.timestamp >= _startTimestamp[id],
            "CaratoEvents: Can't move before beginning"
        );
        // Burn all tokens if try to transfer after deadline
        if (block.timestamp >= _endTimestamp[id]) {
            uint256 balance = ERC1155.balanceOf(msg.sender, id);
            return ERC1155._burn(msg.sender, id, balance);
        } else {
            // Check if transaction has address
            require(
                ERC1155.balanceOf(to, id) == 0,
                "CaratoEvents: Can't send more than one NFT to same account"
            );
            require(
                _addressBlacklist[id][to] == false,
                "Address is in blacklist"
            );
            _received[to].push(id);
            return ERC1155._safeTransferFrom(msg.sender, to, id, 1, bytes(""));
        }
    }

    // Overriding native transfer functions

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public pure override {
        require(1 < 0, "CaratoEvents: Native transfers are disabled");
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal pure override {
        require(1 < 0, "CaratoEvents: Native transfers are disabled");
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public pure override {
        require(1 < 0, "CaratoEvents: Native transfers are disabled");
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal pure override {
        require(1 < 0, "CaratoEvents: Native transfers are disabled");
    }
}
