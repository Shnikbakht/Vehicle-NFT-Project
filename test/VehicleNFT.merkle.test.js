const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleNFT Merkle Functions", function () {
  let VehicleNFT, vehicleNFT, owner, manufacturer, user;
  let merkleRoot, price, signature, newItemId;

  function generateMerkleProof(leaves) {
    const layers = [leaves];
    while (layers[0].length > 1) {
      const currentLayer = layers[0];
      const newLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          const left = currentLayer[i];
          const right = currentLayer[i + 1];
          const hash = ethers.utils.keccak256(ethers.utils.concat([left, right]));
          newLayer.push(hash);
        } else {
          newLayer.push(currentLayer[i]);
        }
      }
      layers.unshift(newLayer);
    }
    return layers;
  }

  beforeEach(async function () {
    VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    [owner, manufacturer, user, ...addrs] = await ethers.getSigners();
    vehicleNFT = await VehicleNFT.deploy();
    await vehicleNFT.deployed();
    await vehicleNFT.authorizeManufacturer(manufacturer.address);

    // Generate Merkle root and proof
    const leaves = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data1")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data2")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data3")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data4")),
    ];
    const layers = generateMerkleProof(leaves);
    merkleRoot = layers[0][0];
    
    price = ethers.utils.parseEther("1");
    newItemId = 1;

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "bytes32", "uint256", "uint256"],
      [manufacturer.address, merkleRoot, price, newItemId]
    );
    signature = await manufacturer.signMessage(ethers.utils.arrayify(messageHash));

    await vehicleNFT.connect(manufacturer).mintVehicle(merkleRoot, price, signature);
  });

  describe("getVehicleMerkleRoot", function () {
    it("Should return the correct Merkle root for a minted vehicle", async function () {
      const retrievedRoot = await vehicleNFT.getVehicleMerkleRoot(newItemId);
      expect(retrievedRoot).to.equal(merkleRoot);
    });

    it("Should revert for non-existent token", async function () {
      await expect(vehicleNFT.getVehicleMerkleRoot(999))
        .to.be.revertedWith("VehicleNFT: Token ID does not exist");
    });
  });


  describe("verifyMerkleProof", function () {
    it("Should verify a valid Merkle proof", async function () {
      const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data1"));
      const proof = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data2")),
        ethers.utils.keccak256(ethers.utils.concat([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data3")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data4"))
        ]))
      ];

      const isValid = await vehicleNFT.verifyMerkleProof(newItemId, proof, leaf);
      expect(isValid).to.be.true;
    });

    it("Should reject an invalid Merkle proof", async function () {
      const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("invalid_data"));
      const proof = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data2")),
        ethers.utils.keccak256(ethers.utils.concat([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data3")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data4"))
        ]))
      ];

      const isValid = await vehicleNFT.verifyMerkleProof(newItemId, proof, leaf);
      expect(isValid).to.be.false;
    });

    // it("Should verify Merkle proof for different leaf positions", async function () {
    //   const leaves = [
    //     ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data1")),
    //     ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data2")),
    //     ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data3")),
    //     ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data4")),
    //   ];

  //     for (let i = 0; i < leaves.length; i++) {
  //       const leaf = leaves[i];
  //       const proof = [];
  //       let currentIndex = i;
  //       for (let j = 1; j < layers.length; j++) {
  //         const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
  //         if (siblingIndex < layers[j].length) {
  //           proof.push(layers[j][siblingIndex]);
  //         }
  //         currentIndex = Math.floor(currentIndex / 2);
  //       }

  //       const isValid = await vehicleNFT.verifyMerkleProof(newItemId, proof, leaf);
  //       expect(isValid).to.be.true;
  //     }
  //   });
  // });

  describe("verifyMerkleProof (public pure function)", function () {
    it("Should verify a valid Merkle proof", async function () {
      const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data1"));
      const proof = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data2")),
        ethers.utils.keccak256(ethers.utils.concat([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data3")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data4"))
        ]))
      ];

      const isValid = await vehicleNFT._verifyMerkleProof(merkleRoot, proof, leaf);
      expect(isValid).to.be.true;
    });

    it("Should reject an invalid Merkle proof", async function () {
      const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("invalid_data"));
      const proof = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data2")),
        ethers.utils.keccak256(ethers.utils.concat([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data3")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("data4"))
        ]))
      ];

      const isValid = await vehicleNFT._verifyMerkleProof(merkleRoot, proof, leaf);
      expect(isValid).to.be.false;
    });

    it("Should handle empty proof", async function () {
      const leaf = merkleRoot;
      const proof = [];

      const isValid = await vehicleNFT._verifyMerkleProof(merkleRoot, proof, leaf);
      expect(isValid).to.be.true;
    });
  });
});
});