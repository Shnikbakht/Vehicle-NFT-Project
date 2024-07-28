// uploadMetadata.js
require('dotenv').config();
const axios = require('axios');

async function uploadToPinata(metadata) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const response = await axios.post(url, metadata, {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
    },
  });
  return response.data.IpfsHash;
}

const carMetadata = [
  {
    name: 'Vehicle #1',
    description: 'This is a vehicle with tokenId 1',
    image:
      'https://ipfs.io/ipfs/QmcEXex5C5BG3a46vY8bp7EHg5NczjC7tNp3sRFSaGESJL?filename=car1.png',
    attributes: [
      {
        trait_type: 'Manufacturer',
        value: 'BMW',
      },
      {
        trait_type: 'Model',
        value: 'X5',
      },
      {
        trait_type: 'Year',
        value: '2019',
      },
      {
        trait_type: 'Token ID',
        value: '1',
      },
      {
        trait_type: 'Make',
        value: 'BMW',
      },
      {
        trait_type: 'VIN',
        value: '5UXKR6C57F1234567',
      },
      {
        trait_type: 'Color',
        value: 'White',
      },
      {
        trait_type: 'Features',
        value:
          'All-Wheel Drive, Sunroof, Harman Kardon Surround Sound, Wireless Charging',
      },
    ],
  },
];

async function uploadAllMetadata() {
  const results = [];
  for (const metadata of carMetadata) {
    const ipfsHash = await uploadToPinata(metadata);
    results.push({ metadata, ipfsHash });
    console.log(
      `Pinata IPFS Hash for ${metadata.make} ${metadata.model}: ${ipfsHash}`
    );
  }
  return results;
}

module.exports = {
  uploadAllMetadata,
  carMetadata,
};
