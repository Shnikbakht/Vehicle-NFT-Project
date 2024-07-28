const crypto = require('crypto');

function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function calculateMerkleRoot(cids) {
    if (cids.length === 0) {
        return null;
    }

    // Hash the individual CIDs
    let hashes = cids.map(cid => sha256(cid));

    // Build the Merkle tree
    while (hashes.length > 1) {
        if (hashes.length % 2 !== 0) {
            hashes.push(hashes[hashes.length - 1]);
        }

        const newHashes = [];
        for (let i = 0; i < hashes.length; i += 2) {
            const combined = hashes[i] + hashes[i + 1];
            const newHash = sha256(combined);
            newHashes.push(newHash);
        }

        hashes = newHashes;
    }

    return hashes[0];
}

// The given CIDs
const cids = [
    "QmbFVMpqb7SkR6nutocgGPgYww5XxHSiqNx9tzGkuStCGJ",
    "QmU5UUiU3aVAhqJapPrVC378fb6GZjEiqr2FxbcqUVEgZb",
    "QmXY6f6ShgRagae7vYqzwSTk71BEpxqHHFQD6wHCobCYa8",
    "QmfL6vtCpLfb42RWuUnSQPpNtyC19dk8WJ2aJseVWHQxNa"
];

const merkleRoot = calculateMerkleRoot(cids);
console.log(`Merkle Root Hash: ${merkleRoot}`);