import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const USER_ADDRESS = "0xFd70b60411692F1a4c0d57046ab64b81D3DC3a83";
const FAN_AI_PASSPORT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const FAN_AI_EXPERIENCE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const PASSPORT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

const EXPERIENCE_ABI = [
  "function userToTokenId(address user) view returns (uint256)",
  "function nftProgress(uint256 tokenId, uint256 experienceId) view returns (bool experienceStarted, bool experienceCompleted, uint256 completedTasks, uint256 completionDate)",
  "function linkUserToNFT(address user, uint256 tokenId) external"
];

async function debugClaimReward() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const passport = new ethers.Contract(FAN_AI_PASSPORT, PASSPORT_ABI, provider);
  const experience = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, provider);

  console.log("🔍 Debugging claimReward transaction revert...\n");

  // 1. Check if user owns any NFTs
  console.log("1. Checking NFT ownership...");
  const userNFTBalance = await passport.balanceOf(USER_ADDRESS);
  console.log(`   User NFT balance: ${userNFTBalance}`);

  if (userNFTBalance > 0) {
    // Find the user's token ID by checking ownership
    const totalSupply = await passport.totalSupply();
    console.log(`   Total supply: ${totalSupply}`);
    
    let userTokenId = 0;
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await passport.ownerOf(i);
        if (owner.toLowerCase() === USER_ADDRESS.toLowerCase()) {
          userTokenId = i;
          break;
        }
      } catch (error) {
        // Token doesn't exist, continue
      }
    }
    
    if (userTokenId > 0) {
      console.log(`   User's token ID: ${userTokenId}`);
      
      // 2. Check if user is linked to NFT
      console.log("\n2. Checking user-NFT linking...");
      const linkedTokenId = await experience.userToTokenId(USER_ADDRESS);
      console.log(`   Linked token ID: ${linkedTokenId}`);
      
      if (linkedTokenId === 0) {
        console.log("   ❌ User is NOT linked to any NFT");
        console.log("   💡 Need to call linkUserToNFT() first");
      } else {
        console.log("   ✅ User is linked to NFT");
        
        // 3. Check experience progress
        console.log("\n3. Checking experience progress...");
        const progress = await experience.nftProgress(linkedTokenId, 1);
        console.log(`   Experience started: ${progress.experienceStarted}`);
        console.log(`   Experience completed: ${progress.experienceCompleted}`);
        console.log(`   Completed tasks: ${progress.completedTasks}`);
        console.log(`   Completion date: ${progress.completionDate}`);
        
        if (!progress.experienceCompleted) {
          console.log("   ❌ Experience is NOT completed");
          console.log("   💡 Need to complete all tasks first");
        } else {
          console.log("   ✅ Experience is completed");
        }
      }
    } else {
      console.log("   ❌ Could not find user's token ID");
    }
  } else {
    console.log("   ❌ User doesn't own any NFTs");
    console.log("   💡 Need to mint an NFT first");
  }

  console.log("\n📋 Summary of requirements for claimReward:");
  console.log("   1. User must own an NFT ✅");
  console.log("   2. User must be linked to their NFT ❌ (if not linked)");
  console.log("   3. Experience must be completed ❌ (if not completed)");
}

debugClaimReward().catch(console.error); 