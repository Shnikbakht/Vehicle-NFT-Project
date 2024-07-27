const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");

describe("VehicleNFT", function () {
  let vehicleNFT;
  let owner;
  let manufacturer;
  let certifiedUser;
  let unauthorizedUser;
  let expect;

  before(async function () {
    // Dynamically import chai for CommonJS
    const chai = await import("chai");
    expect = chai.expect;
  });

  beforeEach(async function () {
    [owner, manufacturer, certifiedUser, unauthorizedUser] = await ethers.getSigners();

    const VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();

    // Authorize a manufacturer and certify a user
    await vehicleNFT.authorizeManufacturer(manufacturer.address);
    await vehicleNFT.certifyUser(certifiedUser.address);
  });

  it("should authorize a manufacturer", async function () {
    expect(await vehicleNFT.authorizedManufacturers(manufacturer.address)).to.be.true;
  });

  it("should certify a user", async function () {
    expect(await vehicleNFT.certifiedUsers(certifiedUser.address)).to.be.true;
  });

  it("should mint a vehicle with valid signature", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");

    // Sign the message
    const messageHash = keccak256(
      ethers.utils.defaultAbiCoder.encode(["address", "bytes32", "uint256", "uint256"], [manufacturer.address, merkleRoot, price, 1])
    );
    const signature = await manufacturer.signMessage(ethers.utils.arrayify(messageHash));

    // Ensure the manufacturer is authorized
    expect(await vehicleNFT.authorizedManufacturers(manufacturer.address)).to.be.true;

    const tx = await vehicleNFT.mintVehicle(merkleRoot, price, signature);
    const receipt = await tx.wait();
    const newItemId = receipt.events[0].args.tokenId;

    expect(await vehicleNFT.ownerOf(newItemId)).to.equal(manufacturer.address);
    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(price);
  });

  it("should list a vehicle for sale", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");
    const newItemId = await mintVehicleForManufacturer();

    await vehicleNFT.listVehicleForSale(newItemId, price);
    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(price);
  });

  it("should purchase a vehicle", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");
    const newItemId = await mintVehicleForManufacturer();

    await vehicleNFT.listVehicleForSale(newItemId, price);

    await expect(vehicleNFT.connect(certifiedUser).purchaseVehicle(newItemId, { value: price }))
      .to.emit(vehicleNFT, "OwnershipTransferred")
      .withArgs(newItemId, manufacturer.address, certifiedUser.address, price);

    expect(await vehicleNFT.ownerOf(newItemId)).to.equal(certifiedUser.address);
  });

  it("should update the vehicle price", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");
    const newItemId = await mintVehicleForManufacturer();

    await vehicleNFT.listVehicleForSale(newItemId, price);
    const newPrice = ethers.utils.parseEther("2");
    await vehicleNFT.setPrice(newItemId, newPrice);

    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(newPrice);
  });

  it("should report a vehicle as stolen", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");
    const newItemId = await mintVehicleForManufacturer();

    await vehicleNFT.reportStolen(newItemId);
    expect(await vehicleNFT.isVehicleStolen(newItemId)).to.be.true;
  });

  it("should confirm a stolen vehicle status", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");
    const newItemId = await mintVehicleForManufacturer();

    await vehicleNFT.reportStolen(newItemId);
    await vehicleNFT.confirmStolen(newItemId);

    expect(await vehicleNFT.isVehicleStolen(newItemId)).to.be.true;
  });

  it("should verify Merkle proof", async function () {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const leaf = ethers.utils.formatBytes32String("leaf");
    const proof = [];

    const newItemId = await mintVehicleForManufacturer();

    await expect(vehicleNFT.verifyMerkleProof(newItemId, proof, leaf)).to.be.true;
  });

  async function mintVehicleForManufacturer() {
    const merkleRoot = ethers.utils.formatBytes32String("root");
    const price = ethers.utils.parseEther("1");

    const messageHash = keccak256(
      ethers.utils.defaultAbiCoder.encode(["address", "bytes32", "uint256", "uint256"], [manufacturer.address, merkleRoot, price, 1])
    );
    const signature = await manufacturer.signMessage(ethers.utils.arrayify(messageHash));

    const tx = await vehicleNFT.mintVehicle(merkleRoot, price, signature);
    const receipt = await tx.wait();
    return receipt.events[0].args.tokenId;
  }
});
