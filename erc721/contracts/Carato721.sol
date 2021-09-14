// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Carato721
 * Carato721 - Smart contract for Carato's events
 */
contract Carato721 is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    mapping(string => address) private _creatorsMapping;
    mapping(uint256 => string) private _tokenIdsMapping;
    mapping(string => uint256) private _tokenIdsToHashMapping;
    address openseaProxyAddress;
    address umiProxyAddress;
    string public contract_ipfs_json;
    bool public proxyMintingEnabled = false;
    bool public burningEnabled = false;
    string private baseURI;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(
        string memory _name,
        string memory _ticker,
        string memory _contract_ipfs,
        address _umiProxyAddress,
        bool _proxyMintingEnabled,
        bool _burningEnabled,
        string memory _base_uri
    ) ERC721(_name, _ticker) {
        umiProxyAddress = _umiProxyAddress;
        contract_ipfs_json = _contract_ipfs;
        proxyMintingEnabled = _proxyMintingEnabled;
        burningEnabled = _burningEnabled;
        baseURI = _base_uri;
    }

    function _baseURI() internal override view returns (string memory) {
        return baseURI;
    }

    function _burn(uint256 _tokenId) internal override(ERC721, ERC721URIStorage) {
        require(burningEnabled, "UMi721: Burning is disabled");
        super._burn(_tokenId);
    }

    function burnToken(uint256 _tokenId) public {
        super._burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(_tokenId);
    }

    function enableProxyMinting() public onlyOwner {
        proxyMintingEnabled = true;
    }

    function disableProxyMinting() public onlyOwner {
        proxyMintingEnabled = false;
    }

    function enableBurning() public onlyOwner {
        burningEnabled = true;
    }

    function disableBurning() public onlyOwner {
        burningEnabled = false;
    }

    function contractURI() public view returns (string memory) {
        return contract_ipfs_json;
    }

    function nftExists(string memory tokenHash) internal view returns (bool) {
        address owner = _creatorsMapping[tokenHash];
        return owner != address(0);
    }

    function returnTokenIdByHash(string memory tokenHash)
        public
        view
        returns (uint256)
    {
        return _tokenIdsToHashMapping[tokenHash];
    }

    function returnTokenURI(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return _tokenIdsMapping[tokenId];
    }

    function returnCreatorByNftHash(string memory hash)
        public
        view
        returns (address)
    {
        return _creatorsMapping[hash];
    }

    function canMint(string memory _tokenURI) internal view returns (bool) {
        require(!nftExists(_tokenURI), "Carato721: Trying to mint existent nft");
        return true;
    }

    function mintNFT(string memory _tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        require(canMint(_tokenURI), "Carato721: Can't mint token");
        uint256 tokenId = mintTo(msg.sender, _tokenURI);
        _creatorsMapping[_tokenURI] = msg.sender;
        _tokenIdsMapping[tokenId] = _tokenURI;
        _tokenIdsToHashMapping[_tokenURI] = tokenId;
        return tokenId;
    }

    /*
        This method will first mint the token to the owner, then will transfer the token to the user.
    */
    function dropNFT(
        address from,
        address to,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        require(canMint(_tokenURI), "Carato721: Can't mint token");
        uint256 tokenId = mintTo(from, _tokenURI);
        super.transferFrom(from, to, tokenId);
        _creatorsMapping[_tokenURI] = to;
        _tokenIdsMapping[tokenId] = _tokenURI;
        _tokenIdsToHashMapping[_tokenURI] = tokenId;
        return tokenId;
    }

    /*
        This method will mint the to provided user.
    */
    function ownerMintNFT(address to, string memory _tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        require(canMint(_tokenURI), "Carato721: Can't mint token");
        uint256 tokenId = mintTo(to, _tokenURI);
        _creatorsMapping[_tokenURI] = to;
        _tokenIdsMapping[tokenId] = _tokenURI;
        _tokenIdsToHashMapping[_tokenURI] = tokenId;
        return tokenId;
    }

    /*
        This method will mint the token to provided user, can be called just by the proxy address.
    */
    function proxyMintNFT(address to, string memory _tokenURI)
        public
        returns (uint256)
    {
        require(proxyMintingEnabled, "Carato721: Proxy minting is disabled");
        require(canMint(_tokenURI), "Carato721: Can't mint token");
        require(
            msg.sender == umiProxyAddress,
            "Carato721: Only Proxy Address can Proxy Mint"
        );
        uint256 tokenId = mintTo(to, _tokenURI);
        _creatorsMapping[_tokenURI] = to;
        _tokenIdsMapping[tokenId] = _tokenURI;
        _tokenIdsToHashMapping[_tokenURI] = tokenId;
        return tokenId;
    }

    /*
        Private method that mints the token
    */
    function mintTo(address _to, string memory _tokenURI)
        private
        returns (uint256)
    {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _mint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        return newTokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * Override isApprovedForAll to whitelist proxy accounts
     */
    function isApprovedForAll(address _owner, address _operator)
        public
        override
        view
        returns (bool isOperator)
    {
        // Adding another burning address
        if (_owner == address(0x000000000000000000000000000000000000dEaD)) {
            return false;
        }
        // Approving for UMi and Opensea address
        if (_operator == address(umiProxyAddress)) {
            return true;
        }

        return super.isApprovedForAll(_owner, _operator);
    }
}
