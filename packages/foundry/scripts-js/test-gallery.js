import { ethers } from "ethers";

// Configuration
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with your deployed contract address
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE"; // Anvil account 0
const RPC_URL = "http://localhost:8545";

// Contract ABI (just the functions we need)
const ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function mintExperienceNFT(uint256 experienceId) external",
];

async function testGallery() {
  console.log("🚀 Testing Gallery and Marketplace functionality...\n");

  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  try {
    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log(`📊 Total NFTs minted: ${totalSupply.toString()}`);

    // Get user balance
    const userBalance = await contract.balanceOf(wallet.address);
    console.log(`👤 User NFT balance: ${userBalance.toString()}`);

    // Get all NFTs details
    console.log("\n🎨 NFT Details:");
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        const tokenURI = await contract.tokenURI(i);
        
        console.log(`  NFT #${i}:`);
        console.log(`    Owner: ${owner}`);
        console.log(`    Token URI: ${tokenURI}`);
        
        // Decode the SVG from base64
        const svgData = tokenURI.replace("data:image/svg+xml;base64,", "");
        const svg = Buffer.from(svgData, 'base64').toString();
        console.log(`    SVG: ${svg.substring(0, 100)}...`);
        
      } catch (error) {
        console.log(`  NFT #${i}: Error - ${error.message}`);
      }
    }

    // Test minting a new NFT
    console.log("\n🪙 Testing minting...");
    const experienceId = totalSupply.toNumber() + 1;
    console.log(`Minting NFT for experience ${experienceId}...`);
    
    const tx = await contract.mintExperienceNFT(experienceId);
    await tx.wait();
    
    console.log(`✅ Successfully minted NFT for experience ${experienceId}`);
    console.log(`Transaction hash: ${tx.hash}`);

    // Get updated total supply
    const newTotalSupply = await contract.totalSupply();
    console.log(`📊 New total NFTs: ${newTotalSupply.toString()}`);

    // Get the new NFT details
    const newTokenId = newTotalSupply;
    const newOwner = await contract.ownerOf(newTokenId);
    const newTokenURI = await contract.tokenURI(newTokenId);
    
    console.log(`\n🎨 New NFT #${newTokenId}:`);
    console.log(`  Owner: ${newOwner}`);
    console.log(`  Token URI: ${newTokenURI}`);

  } catch (error) {
    console.error("❌ Error testing gallery:", error);
  }
}

// Run the test
testGallery()
  .then(() => {
    console.log("\n✅ Gallery test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Gallery test failed:", error);
    process.exit(1);
  }); 