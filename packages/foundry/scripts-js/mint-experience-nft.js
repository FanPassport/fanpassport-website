import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c';
const RPC_URL = 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE'; // Anvil default key

// ABI minimal pour mintExperienceNFT
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "experienceId",
        "type": "uint256"
      }
    ],
    "name": "mintExperienceNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function mintExperienceNFT() {
  try {
    console.log('🎨 Minting Experience NFT...');
    
    // Connect to provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    // Parameters
    const userAddress = '0xFd70b60411692F1a4c0d57046ab64b81D3DC3a83';
    const experienceId = 1;
    
    console.log(`   User: ${userAddress}`);
    console.log(`   Experience ID: ${experienceId}`);
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    
    // Mint NFT
    const tx = await contract.mintExperienceNFT(userAddress, experienceId);
    console.log(`   Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`   ✅ NFT minted successfully!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    
    // Get token ID (should be 1 since it's the first mint)
    const tokenId = 1;
    console.log(`   Token ID: ${tokenId}`);
    
  } catch (error) {
    console.error('   ❌ Error minting NFT:', error.message);
  }
}

mintExperienceNFT(); 