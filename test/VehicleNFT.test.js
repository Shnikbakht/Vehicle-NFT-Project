const{ethers} = require("hardhat");
describe("VehicleNFT", function () {
  let VehicleNFT, vehicleNFT, owner, addr1, addr2;

  beforeEach(async function () {
    const chai = await import("chai");
    expect = chai.expect;
    VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    [owner, addr1, addr2] = await ethers.getSigners();
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();
  });

  it("Should set the right owner", async function () {
    expect(await vehicleNFT.owner()).to.equal(owner.address);
  });

  it("Should have the correct name and symbol", async function () {
    expect(await vehicleNFT.name()).to.equal("VehicleNFT");
    expect(await vehicleNFT.symbol()).to.equal("VNFT");
  });
});