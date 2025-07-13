import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE"; // Anvil account 0
const USER_ADDRESS = process.env.USER_ADDRESS || "0xFd70b60411692F1a4c0d57046ab64b81D3DC3a83";
const FAN_AI_EXPERIENCE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const EXPERIENCE_ABI = [
  "function claimReward(uint256 experienceId) external"
];

async function claimNFTReward() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const experience = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, wallet);

  const experienceId = 1;

  console.log(`🎁 Claiming NFT reward for experience ${experienceId}...`);
  try {
    const tx = await experience.claimReward(experienceId);
    console.log(`   Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   ✅ NFT reward claimed in block ${receipt.blockNumber}`);
  } catch (error) {
    console.error("   ❌ Error claiming NFT reward:", error.message);
  }
}

claimNFTReward().catch(console.error); 