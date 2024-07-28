const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleNFT Listing", function () {
  let VehicleNFT, vehicleNFT, owner, manufacturer, user;
  let merkleRoot, price, signature, newItemId;

  beforeEach(async function () {
    VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    [owner, manufacturer, user, ...addrs] = await ethers.getSigners();
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();
    await vehicleNFT.authorizeManufacturer(manufacturer.address);

    merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vehicle data"));
    price = ethers.utils.parseEther("1");
    newItemId = 1;

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "bytes32", "uint256", "uint256"],
      [manufacturer.address, merkleRoot, price, newItemId]
    );
    signature = await manufacturer.signMessage(ethers.utils.arrayify(messageHash));

    await vehicleNFT.connect(manufacturer).mintVehicle(merkleRoot, price, signature);
  });

  it("Should allow owner to list vehicle for sale", async function () {
    const newPrice = ethers.utils.parseEther("2");
    await expect(vehicleNFT.connect(manufacturer).listVehicleForSale(newItemId, newPrice))
      .to.emit(vehicleNFT, "VehicleListedForSale")
      .withArgs(newItemId, newPrice);

    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(newPrice);
  });

  it("Should not allow non-owner to list vehicle for sale", async function () {
    const newPrice = ethers.utils.parseEther("2");
    await expect(vehicleNFT.connect(user).listVehicleForSale(newItemId, newPrice))
      .to.be.revertedWith("Not the current owner");
  });

  it("Should not allow listing stolen vehicle for sale", async function () {
    await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
    const newPrice = ethers.utils.parseEther("2");
    await expect(vehicleNFT.connect(manufacturer).listVehicleForSale(newItemId, newPrice))
      .to.be.revertedWith("Vehicle is reported stolen");
  });

  it("Should not allow listing with zero price", async function () {
    await expect(vehicleNFT.connect(manufacturer).listVehicleForSale(newItemId, 0))
      .to.be.revertedWith("Price must be greater than zero");
  });

  it("Should allow owner to set new price", async function () {
    const newPrice = ethers.utils.parseEther("2");
    await expect(vehicleNFT.connect(manufacturer).setPrice(newItemId, newPrice))
      .to.emit(vehicleNFT, "PriceUpdated")
      .withArgs(newItemId, newPrice);

    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(newPrice);
  });

  it("Should not allow non-owner to set new price", async function () {
    const newPrice = ethers.utils.parseEther("2");
    await expect(vehicleNFT.connect(user).setPrice(newItemId, newPrice))
      .to.be.revertedWith("Not the current owner");
  });
});