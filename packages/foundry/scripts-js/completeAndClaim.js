import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";
const USER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const FAN_AI_PASSPORT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const FAN_AI_EXPERIENCE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const FAN_AI_EXPERIENCE_NFT = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const PASSPORT_ABI = [
  "function getAccount(uint256 tokenId) view returns (address)"
];
const EXPERIENCE_ABI = [
  "function completeQuizTask(uint256,uint256,string) external",
  "function completeQRCodeTask(uint256,uint256,string) external",
  "function completePhotoTask(uint256,uint256,uint256) external",
  "function completeCheckInTask(uint256,uint256) external",
  "function claimReward(uint256) external"
];
const EXPERIENCE_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const passport = new ethers.Contract(FAN_AI_PASSPORT, PASSPORT_ABI, wallet);
  const experience = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, wallet);
  const expNFT = new ethers.Contract(FAN_AI_EXPERIENCE_NFT, EXPERIENCE_NFT_ABI, wallet);

  const tokenId = 1;
  const experienceId = 1;

  // 1. Compléter toutes les tâches
  console.log("Complétion des tâches...");
  await (await experience.completeQuizTask(experienceId, 0, "1970")).wait();
  await (await experience.completeQRCodeTask(experienceId, 1, "qr_entrance_parc_princes")).wait();
  await (await experience.completePhotoTask(experienceId, 2, tokenId)).wait();
  await (await experience.completeCheckInTask(experienceId, 3)).wait();
  await (await experience.completeQuizTask(experienceId, 4, "Edinson Cavani")).wait();
  console.log("✅ Toutes les tâches sont complétées.");

  // 2. Réclamer la récompense
  console.log("Réclamation de la récompense...");
  await (await experience.claimReward(experienceId)).wait();
  console.log("✅ Récompense réclamée.");

  // 3. Vérifier le solde du TBA
  const tba = await passport.getAccount(tokenId);
  const ethBalance = await provider.getBalance(tba);
  const nftBalance = await expNFT.balanceOf(tba);
  console.log(`\nSolde ETH du TBA: ${ethers.utils.formatEther(ethBalance)} ETH`);
  console.log(`Solde NFT de récompense du TBA: ${nftBalance}`);
}

main().catch(e => console.error(e)); 