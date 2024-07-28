const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleNFT Stolen Functions", function () {
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

  describe("reportStolen", function () {
    it("Should allow owner to report vehicle as stolen", async function () {
      await expect(vehicleNFT.connect(manufacturer).reportStolen(newItemId))
        .to.emit(vehicleNFT, "VehicleReportedStolen")
        .withArgs(newItemId);

      expect(await vehicleNFT.isVehicleStolen(newItemId)).to.be.true;
    });

    it("Should not allow non-owner to report vehicle as stolen", async function () {
      await expect(vehicleNFT.connect(user).reportStolen(newItemId))
        .to.be.revertedWith("Not the owner");
    });

    it("Should allow reporting an already stolen vehicle", async function () {
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      await expect(vehicleNFT.connect(manufacturer).reportStolen(newItemId))
        .to.emit(vehicleNFT, "VehicleReportedStolen")
        .withArgs(newItemId);
    });
  });

  describe("confirmStolen", function () {
    it("Should allow owner to confirm stolen status", async function () {
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      await expect(vehicleNFT.connect(owner).confirmStolen(newItemId))
        .to.emit(vehicleNFT, "StolenStatusConfirmed")
        .withArgs(newItemId);
    });

    it("Should not allow non-regulatory authorities to confirm stolen status", async function () {
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      await expect(vehicleNFT.connect(user).confirmStolen(newItemId))
        .to.be.revertedWith("OwnableUnauthorizedAccount");
    });

    it("Should not allow confirming a non-reported vehicle", async function () {
      await expect(vehicleNFT.connect(owner).confirmStolen(newItemId))
        .to.be.revertedWith("Vehicle not reported stolen");
    });
  });

  describe("isVehicleStolen", function () {
    it("Should return false for non-stolen vehicle", async function () {
      expect(await vehicleNFT.isVehicleStolen(newItemId)).to.be.false;
    });

    it("Should return true for reported stolen vehicle", async function () {
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      expect(await vehicleNFT.isVehicleStolen(newItemId)).to.be.true;
    });

    it("Should return true for confirmed stolen vehicle", async function () {
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      await vehicleNFT.connect(owner).confirmStolen(newItemId);
      expect(await vehicleNFT.isVehicleStolen(newItemId)).to.be.true;
    });
  });

  describe("Stolen vehicle interactions", function () {
    it("Should not allow listing a stolen vehicle for sale", async function () {
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      await expect(vehicleNFT.connect(manufacturer).listVehicleForSale(newItemId, price))
        .to.be.revertedWith("Vehicle is reported stolen");
    });

    it("Should not allow purchasing a stolen vehicle", async function () {
      await vehicleNFT.certifyUser(user.address);
      await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
      await expect(vehicleNFT.connect(user).purchaseVehicle(newItemId, { value: price }))
        .to.be.revertedWith("Vehicle is reported stolen");
    });
  });
});