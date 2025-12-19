import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6";
const EXPERIENCE_NFT_ADDRESS = "0xa15bb66138824a1c7167f5e85b957d04dd34e468";

const EXPERIENCE_NFT_ABI = [
  "function mintExperienceNFT(address to, uint256 experienceId) external",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getExperienceId(uint256 tokenId) view returns (uint256)"
];

async function mintTestNFTs() {
  console.log("🎨 Minting Test NFTs for Marketplace");
  console.log("=====================================");
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const experienceNFT = new ethers.Contract(EXPERIENCE_NFT_ADDRESS, EXPERIENCE_NFT_ABI, wallet);
  
  console.log(`📋 Contract Address: ${EXPERIENCE_NFT_ADDRESS}`);
  console.log(`👤 Wallet Address: ${wallet.address}`);
  
  // Get current total supply
  const currentSupply = await experienceNFT.totalSupply();
  console.log(`📊 Current Total Supply: ${currentSupply}`);
  
  // Test addresses (different wallets)
  const testAddresses = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Anvil account 0
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Anvil account 1
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Anvil account 2
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Anvil account 3
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Anvil account 4
  ];
  
  // Experience IDs to mint (1-5 for different experiences)
  const experienceIds = [1, 2, 3, 4, 5];
  
  console.log(`\n🎯 Minting NFTs for different experiences and addresses...`);
  
  for (let i = 0; i < 10; i++) {
    const address = testAddresses[i % testAddresses.length];
    const experienceId = experienceIds[i % experienceIds.length];
    
    try {
      console.log(`\n🔄 Minting NFT for experience ${experienceId} to ${address}...`);
      
      const tx = await experienceNFT.mintExperienceNFT(address, experienceId);
      console.log(`📝 Transaction hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ NFT minted in block ${receipt.blockNumber}`);
      
      // Get the new token ID
      const newTotalSupply = await experienceNFT.totalSupply();
      const tokenId = newTotalSupply;
      console.log(`🎨 New Token ID: ${tokenId}`);
      
      // Verify the mint
      const owner = await experienceNFT.ownerOf(tokenId);
      const mintedExperienceId = await experienceNFT.getExperienceId(tokenId);
      
      console.log(`✅ Verification:`);
      console.log(`  - Owner: ${owner}`);
      console.log(`  - Experience ID: ${mintedExperienceId}`);
      console.log(`  - Expected Owner: ${address}`);
      console.log(`  - Expected Experience ID: ${experienceId}`);
      
      if (owner.toLowerCase() === address.toLowerCase() && mintedExperienceId.toNumber() === experienceId) {
        console.log(`✅ NFT #${tokenId} verified successfully!`);
      } else {
        console.log(`❌ NFT #${tokenId} verification failed!`);
      }
      
    } catch (error) {
      console.error(`❌ Error minting NFT for experience ${experienceId}:`, error.message);
    }
    
    // Add delay between mints
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final check
  const finalSupply = await experienceNFT.totalSupply();
  console.log(`\n📊 Final Total Supply: ${finalSupply}`);
  console.log(`🎉 Minted ${finalSupply - currentSupply} new NFTs`);
  
  console.log(`\n🚀 Next Steps:`);
  console.log(`  1. Go to the marketplace: http://localhost:3000/marketplace`);
  console.log(`  2. Check that all ${finalSupply} NFTs are visible`);
  console.log(`  3. Verify that club colors and logos are displayed`);
  console.log(`  4. Test the filter functionality (All/My NFTs)`);
  console.log(`  5. Try the regeneration buttons`);
};

mintTestNFTs().catch(console.error); 