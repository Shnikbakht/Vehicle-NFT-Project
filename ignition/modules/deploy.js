const { ethers } = require("hardhat");

async function main() {
    // Get the contract factory
    const VehicleNFT = await ethers.getContractFactory("VehicleNFT");

    // Deploy the contract
    console.log("Deploying VehicleNFT contract...");
    const vehicleNFT = await VehicleNFT.deploy();

    // Wait for the contract to be deployed
    await vehicleNFT.deployed();

    console.log(`VehicleNFT contract deployed to address: ${vehicleNFT.address}`);
}

// Run the deploy function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
