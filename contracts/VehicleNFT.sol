// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract VehicleNFT is ERC721URIStorage, Ownable {
    using ECDSA for bytes32;
    using SignatureChecker for address;
    
    struct Vehicle {
        string metadata;
        bool isStolen;
    }

    uint256 private _currentTokenId;

    mapping(uint256 => Vehicle) public vehicles;
    mapping(address => bool) public authorizedManufacturers;
    mapping(address => bool) public certifiedUsers;
    mapping(uint256 => address) public vehicleOwners;
    mapping(uint256 => uint256) public vehiclePrices;

    event ManufacturerAuthorized(address manufacturer);
    event UserCertified(address user);
    event VehicleMinted(uint256 tokenId, address manufacturer, string metadata);
    event OwnershipTransferred(uint256 tokenId, address from, address to, uint256 price);
    event VehicleReportedStolen(uint256 tokenId);
    event StolenStatusConfirmed(uint256 tokenId);
    event PriceUpdated(uint256 tokenId, uint256 newPrice);
    event VehicleListedForSale(uint256 tokenId, uint256 price);

    constructor() ERC721("VehicleNFT", "VNFT") Ownable(msg.sender) {}

    modifier onlyAuthorizedManufacturer() {
        require(authorizedManufacturers[msg.sender], "Not an authorized manufacturer");
        _;
    }

    modifier onlyCertifiedUser() {
        require(certifiedUsers[msg.sender], "Not a certified user");
        _;
    }

    modifier onlyCurrentOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the current owner");
        _;
    }

    modifier isListedForSale(uint256 tokenId) {
        require(vehiclePrices[tokenId] > 0, "Vehicle not listed for sale");
        _;
    }

    function authorizeManufacturer(address manufacturer) external onlyOwner {
        authorizedManufacturers[manufacturer] = true;
        emit ManufacturerAuthorized(manufacturer);
    }

    function certifyUser(address user) external onlyOwner {
        certifiedUsers[user] = true;
        emit UserCertified(user);
    }

    function mintVehicle(
    string memory metadata,
    uint256 price,
    bytes calldata signature
) external onlyAuthorizedManufacturer returns (uint256) {
    _currentTokenId++;
    uint256 newItemId = _currentTokenId;

    // Signature verification
    bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, metadata, price, newItemId));
    bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    
    require(SignatureChecker.isValidSignatureNow(msg.sender, ethSignedMessageHash, signature), "Invalid signature");

    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, metadata);

    vehicles[newItemId] = Vehicle(metadata, false);
    vehicleOwners[newItemId] = msg.sender;
    vehiclePrices[newItemId] = price;

    // Automatically list the vehicle for sale
    emit VehicleMinted(newItemId, msg.sender, metadata);
    emit VehicleListedForSale(newItemId, price);

    return newItemId;
}
    function listVehicleForSale(uint256 tokenId, uint256 price) external onlyCurrentOwner(tokenId) {
        require(price > 0, "Price must be greater than zero");
        vehiclePrices[tokenId] = price;
        emit VehicleListedForSale(tokenId, price);
    }

    function purchaseVehicle(uint256 tokenId) external payable onlyCertifiedUser isListedForSale(tokenId) {
        address currentOwner = ownerOf(tokenId);
        uint256 price = vehiclePrices[tokenId];
        
        require(msg.value == price, "Incorrect payment amount");
        require(msg.sender != currentOwner, "Owner cannot purchase their own vehicle");

        _transfer(currentOwner, msg.sender, tokenId);
        vehicleOwners[tokenId] = msg.sender;
        vehiclePrices[tokenId] = 0;

        payable(currentOwner).transfer(msg.value);

        emit OwnershipTransferred(tokenId, currentOwner, msg.sender, msg.value);
    }

    function setPrice(uint256 tokenId, uint256 newPrice) external onlyCurrentOwner(tokenId) {
        vehiclePrices[tokenId] = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }

    function reportStolen(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        vehicles[tokenId].isStolen = true;
        emit VehicleReportedStolen(tokenId);
    }

    function confirmStolen(uint256 tokenId) external onlyOwner {
        require(vehicles[tokenId].isStolen, "Vehicle not reported stolen");
        vehicles[tokenId].isStolen = true;
        emit StolenStatusConfirmed(tokenId);
    }

    function getVehicleMetadata(uint256 tokenId) external view returns (string memory) {
        return vehicles[tokenId].metadata;
    }

    function isVehicleStolen(uint256 tokenId) external view returns (bool) {
        return vehicles[tokenId].isStolen;
    }
}
