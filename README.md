# Overview

The VehicleNFT smart contract is an ERC721-based non-fungible token (NFT) implementation tailored for managing vehicle ownership and associated metadata. It leverages off-chain computation through Merkle trees for secure data verification and signatures for manufacturer authorization.

# Key Features

### ERC721 Token Standard:

Implements the ERC721 standard to represent each vehicle as a unique NFT (Non-Fungible Token). This ensures that each vehicle has a distinct identifier and associated metadata, facilitating individual ownership and transferability on the blockchain.

### Merkle Trees:

Utilizes Merkle trees to manage and verify vehicle metadata off-chain. The merkleRoot stored in the contract represents the root hash of a Merkle tree containing the vehicle’s metadata. This approach allows for efficient and secure verification of data without the need to store large amounts of metadata on-chain. The verifyMerkleProof function enables validation of whether specific data is part of the Merkle tree, maintaining data integrity while reducing on-chain storage costs.

### Signature Verification:

Manufacturers are required to provide a digital signature when minting new vehicle NFTs. This signature is validated using the SignatureChecker library, ensuring that only authorized entities can create new tokens. The use of signatures helps to prevent unauthorized minting and ensures the authenticity of the vehicle NFTs.

### Sale and Ownership Management:

Facilitates the buying and selling of vehicles by allowing owners to list their vehicles for sale and set prices. The contract manages the transfer of ownership upon successful purchase and updates the vehicle's price as needed. This system streamlines the process of vehicle transactions and ownership changes within the NFT ecosystem.

### Stolen Vehicle Reporting:

Provides functionality for vehicle owners to report their vehicles as stolen. Once reported, the stolen status can be confirmed by the contract owner. This feature helps in tracking and managing stolen vehicles, adding a layer of security and accountability within the NFT system.

## Imports and Inheritance:

- Ownable: Restricts certain functions to the contract owner.
- ERC721URIStorage: Provides basic ERC721 functionalities with storage for token URIs.
- SignatureChecker: Verifies off-chain signatures.
- ECDSA: Utility functions for ECDSA signature handling.

### Data Structures:

- Vehicle: Struct containing Merkle root and stolen status.

### Mappings:

- vehicles: Maps token IDs to Vehicle structs.
- authorizedManufacturers: Tracks authorized manufacturers.
- certifiedUsers: Lists certified users.
- vehicleOwners: Maps token IDs to current owners.
- vehiclePrices: Maps token IDs to sale prices.

### Modifiers:

- onlyAuthorizedManufacturer: Restricts access to authorized manufacturers.
- onlyCertifiedUser: Restricts access to certified users.
- onlyCurrentOwner: Ensures the function caller is the current owner of the token.
- isListedForSale: Checks if the vehicle is listed for sale.

### Functions

#### Authorization:

- authorizeManufacturer(address manufacturer): Adds a manufacturer to the authorized list.
- certifyUser(address user): Adds a user to the certified list.

#### Minting and Managing Vehicles:

- mintVehicle(bytes32 merkleRoot, uint256 price, bytes calldata signature): Mints a new vehicle NFT after verifying the signature and Merkle root.
- listVehicleForSale(uint256 tokenId, uint256 price): Lists a vehicle for sale.
- purchaseVehicle(uint256 tokenId): Allows certified users to purchase a vehicle.

#### Reporting and Confirmation:

- reportStolen(uint256 tokenId): Reports a vehicle as stolen.
- confirmStolen(uint256 tokenId): Confirms the stolen status by the contract owner.

#### Merkle Proof Verification:

- verifyMerkleProof(uint256 tokenId, bytes32[] calldata proof, bytes32 leaf): Verifies if a leaf node is part of the Merkle tree rooted at the stored Merkle root.

#### Gas Cost Optimizations

- Data Storage: Efficient use of mappings and struct storage to minimize gas costs associated with state changes.
- Off-Chain Computation: Leveraging Merkle trees for large data sets reduces on-chain storage requirements and associated costs.
- Signature Verification: Ensures that only authorized manufacturers can mint vehicles, reducing the risk of fraudulent activity and unnecessary transactions.

#### Security Considerations

- Access Control: Restricted access to sensitive functions via Ownable, onlyAuthorizedManufacturer, and onlyCertifiedUser modifiers.
- Signature Validation: Uses ECDSA and SignatureChecker to ensure that only valid signatures are accepted for minting new vehicles.
- Merkle Tree Verification: Provides a method to verify the integrity of off-chain data using Merkle proofs.

#### Deployment

## Metadata Upload

The uploadMetadata.js script uses Pinata to upload vehicle metadata to IPFS:

## Conclusion

The VehicleNFT smart contract is designed to manage vehicle ownership using blockchain technology efficiently. By integrating off-chain data verification and signature validation, it ensures secure and reliable operations.
