const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('VehicleNFT Purchase', function () {
  let VehicleNFT, vehicleNFT, owner, manufacturer, buyer;
  let merkleRoot, price, signature, newItemId;

  beforeEach(async function () {
    VehicleNFT = await ethers.getContractFactory('VehicleNFT');
    [owner, manufacturer, buyer, ...addrs] = await ethers.getSigners();
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();
    await vehicleNFT.authorizeManufacturer(manufacturer.address);
    await vehicleNFT.certifyUser(buyer.address);

    merkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('vehicle data')
    );
    price = ethers.utils.parseEther('1');
    newItemId = 1;

    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256', 'uint256'],
      [manufacturer.address, merkleRoot, price, newItemId]
    );
    signature = await manufacturer.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    await vehicleNFT
      .connect(manufacturer)
      .mintVehicle(merkleRoot, price, signature);
  });

  it('Should allow certified user to purchase vehicle', async function () {
    await expect(
      vehicleNFT.connect(buyer).purchaseVehicle(newItemId, { value: price })
    )
      .to.emit(vehicleNFT, 'VehiclePurchased')
      .withArgs(newItemId, manufacturer.address, buyer.address, price);

    expect(await vehicleNFT.ownerOf(newItemId)).to.equal(buyer.address);
    expect(await vehicleNFT.vehiclePrices(newItemId)).to.equal(0);
  });

  it('Should not allow purchase of unlisted vehicle', async function () {
    await vehicleNFT.connect(manufacturer).setPrice(newItemId, 0);
    await expect(
      vehicleNFT.connect(buyer).purchaseVehicle(newItemId, { value: price })
    ).to.be.revertedWith('Vehicle not listed for sale');
  });

  it('Should not allow purchase of stolen vehicle', async function () {
    await vehicleNFT.connect(manufacturer).reportStolen(newItemId);
    await expect(
      vehicleNFT.connect(buyer).purchaseVehicle(newItemId, { value: price })
    ).to.be.revertedWith('Vehicle is reported stolen');
  });

  it('Should not allow purchase with incorrect payment amount', async function () {
    const incorrectPrice = ethers.utils.parseEther('0.5');
    await expect(
      vehicleNFT
        .connect(buyer)
        .purchaseVehicle(newItemId, { value: incorrectPrice })
    ).to.be.revertedWith('Incorrect payment amount');
  });

  // it("Should not allow owner to purchase their own vehicle", async function () {
  //   await expect(vehicleNFT.connect(manufacturer).purchaseVehicle(newItemId, { value: price }))
  //     .to.be.revertedWith("Owner cannot purchase their own vehicle");
  // });

  it('Should not allow uncertified user to purchase vehicle', async function () {
    const uncertifiedBuyer = addrs[0];
    await expect(
      vehicleNFT
        .connect(uncertifiedBuyer)
        .purchaseVehicle(newItemId, { value: price })
    ).to.be.revertedWith('Not a certified user');
  });
});
