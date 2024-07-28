const { expect } = require('chai');
const { waffle } = require('hardhat');
const { loadFixture } = waffle;

describe("VehicleNFT Authorization", function () {
  let VehicleNFT, vehicleNFT, owner, addr1, addr2;

  beforeEach(async function () {
    VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();
  });

  describe("Manufacturer Authorization", function () {
    it("Should allow owner to authorize a manufacturer", async function () {
      await vehicleNFT.authorizeManufacturer(addr1.address);
      expect(await vehicleNFT.authorizedManufacturers(addr1.address)).to.be.true;
    });

    it("Should emit ManufacturerAuthorized event", async function () {
      await expect(vehicleNFT.authorizeManufacturer(addr1.address))
        .to.emit(vehicleNFT, "ManufacturerAuthorized")
        .withArgs(addr1.address);
    });

    it("Should not allow non-owner to authorize a manufacturer", async function () {
      await expect(vehicleNFT.connect(addr1).authorizeManufacturer(addr2.address))
        .to.be.revertedWith("OwnableUnauthorizedAccount");
    });
  });

  describe("User Certification", function () {
    it("Should allow owner to certify a user", async function () {
      await vehicleNFT.certifyUser(addr2.address);
      expect(await vehicleNFT.certifiedUsers(addr2.address)).to.be.true;
    });

    it("Should emit UserCertified event", async function () {
      await expect(vehicleNFT.certifyUser(addr2.address))
        .to.emit(vehicleNFT, "UserCertified")
        .withArgs(addr2.address);
    });

    it("Should not allow non-owner to certify a user", async function () {
      await expect(vehicleNFT.connect(addr1).certifyUser(addr2.address))
        .to.be.revertedWith("OwnableUnauthorizedAccount");
    });
  });
});
