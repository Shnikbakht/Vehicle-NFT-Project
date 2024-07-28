const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleNFT Minting", function () {
  let VehicleNFT, vehicleNFT, owner, manufacturer, user;

  beforeEach(async function () {
    VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    [owner, manufacturer, user, ...addrs] = await ethers.getSigners();
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();
    await vehicleNFT.authorizeManufacturer(manufacturer.address);
  });

  it("Should allow authorized manufacturer to mint a vehicle", async function () {
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vehicle data"));
    const price = ethers.utils.parseEther("1");
    const newItemId = 1;

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "bytes32", "uint256", "uint256"],
      [manufacturer.address, merkleRoot, price, newItemId]
    );
    const signature = await manufacturer.signMessage(ethers.utils.arrayify(messageHash));

    await expect(vehicleNFT.connect(manufacturer).mintVehicle(merkleRoot, price, signature))
      .to.emit(vehicleNFT, "VehicleMinted")
      .withArgs(newItemId, manufacturer.address, merkleRoot)
      .and.to.emit(vehicleNFT, "VehicleListedForSale")
      .withArgs(newItemId, price);

    expect(await vehicleNFT.ownerOf(newItemId)).to.equal(manufacturer.address);
    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(price);
  });

  it("Should not allow unauthorized manufacturer to mint a vehicle", async function () {
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vehicle data"));
    const price = ethers.utils.parseEther("1");
    const signature = "0x00";

    await expect(vehicleNFT.connect(user).mintVehicle(merkleRoot, price, signature))
      .to.be.revertedWith("Not an authorized manufacturer");
  });

  it("Should not allow minting with invalid signature", async function () {
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vehicle data"));
    const price = ethers.utils.parseEther("1");
    const invalidSignature = "0x00";

    await expect(vehicleNFT.connect(manufacturer).mintVehicle(merkleRoot, price, invalidSignature))
      .to.be.revertedWith("Invalid signature");
  });
});