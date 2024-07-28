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

## Metadata Upload

The uploadMetadata.js script uses Pinata to upload vehicle metadata to IPFS:

# Usage and Deployment

### Prerequisites

- Node.js: Ensure Node.js is installed. It can be downloaded from nodejs.org.
- npm: Comes with Node.js or can be installed separately.

## Setting Up the Project

### Clone the Repository

```sh
git clone https://github.com/Shnikbakht/Vehicle-NFT-Project
cd your-repository-folder
```

### Install Dependencies

```sh
npm install
```

### Create Environment File

Create a .env file in the root of the project directory.
Add the following environment variables to .env:

```sh
INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Configuring Hardhat

The Hardhat configuration is located in hardhat.config.js. It includes settings for different networks:

- Sepolia: A test network using Infura.
- Localhost: A local Ethereum node running on port 8545.
- Ganache: A local blockchain emulator running on port 7545.

### Running the Project

Start Local Blockchain (for Localhost or Ganache)

If using Localhost:

```sh
npx hardhat node
```

If using Ganache, make sure Ganache is running.

### Deploy Contracts

- For Sepolia:

````sh
npx hardhat run ignition/modules/deploy.js --network sepolia
```-
For Localhost:

```sh
npx hardhat run ignition/modules/deploy.js --network localhost
````

- For Ganache:

```sh
npx hardhat run ignition/modules/deploy.js --network ganache
```

### Verify Contracts on Etherscan

```sh
npx hardhat verify --network sepolia <contract-address> <constructor-arguments>
```

# Storing Metadata Using IPFS and Pinata

In this project, we leverage IPFS (InterPlanetary File System) for decentralized storage of vehicle metadata, and Pinata for simplified interactions with IPFS. This approach ensures that the metadata is stored in a distributed manner, enhancing its reliability and accessibility.

We have stored metadata for four vehicles on IPFS. Below are the Content Identifiers (CIDs) for each vehicle's metadata. These CIDs can be used for verification purposes, and the Merkle root has been computed based on these CIDs:

- Vehicle Metadata 1: QmbFVMpqb7SkR6nutocgGPgYww5XxHSiqNx9tzGkuStCGJ
- Vehicle Metadata 2: QmU5UUiU3aVAhqJapPrVC378fb6GZjEiqr2FxbcqUVEgZb
- Vehicle Metadata 3: QmXY6f6ShgRagae7vYqzwSTk71BEpxqHHFQD6wHCobCYa8
- Vehicle Metadata 4: QmfL6vtCpLfb42RWuUnSQPpNtyC19dk8WJ2aJseVWHQxNa

These CIDs are integral to the system as the Merkle root is derived from them, ensuring the integrity and consistency of the vehicle metadata stored on IPFS.

### Uploading Metadata to IPFS

To upload vehicle metadata to IPFS using Pinata, you can use the uploadMetadata.js script provided in the project. This script facilitates the uploading process and handles interaction with Pinata.

Configure the uploadMetadata.js script with your Pinata API key and secret. Instructions for this can be found within the script.

Run the script to upload your metadata:

```sh
node uploadMetadata.js
```

The script will output the CIDs for each uploaded metadata file, which you can use for verification and further processing.

### Calculating the Merkle Root

To calculate the Merkle root from these CIDs, you can use the calculateMerkleRoot.js file provided in the project. This script processes the CIDs to compute the root hash, which is used in the smart contract for verification.
Run the script:

```sh
node calculateMerkleRoot.js
```

The script will output the Merkle root, which you can compare with the root used in the smart contract.

#### Prepare Your Environment:

- Install Dependencies: Ensure Node.js is installed. Then, install the necessary packages:

```sh
npm install axios dotenv
```

#### Set Up Environment Variables:

Create a .env file in your project root directory with your Pinata API keys:

```sh
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
```

### Upload Metadata:

Use the uploadMetadata.js script to upload vehicle metadata to IPFS. This script will print the IPFS hash for each vehicle's metadata.

### Running the Script:

```sh
node uploadMetadata.js
```

- Script Details: The uploadMetadata.js script uploads the defined vehicle metadata to IPFS using Pinata. The IPFS hashes are printed to the console for each entry in the metadata array.

## Conclusion

The VehicleNFT smart contract is designed to manage vehicle ownership using blockchain technology efficiently. By integrating off-chain data verification and signature validation, it ensures secure and reliable operations.
