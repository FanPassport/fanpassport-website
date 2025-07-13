import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE"; // Anvil account 0
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
  "function startExperience(uint256 experienceId) external",
  "function completeQuizTask(uint256 experienceId, uint256 taskId, string answer) external",
  "function completeQRCodeTask(uint256 experienceId, uint256 taskId, string qrHash) external",
  "function completeCheckInTask(uint256 experienceId, uint256 taskId) external",
  "function completePhotoTask(uint256 experienceId, uint256 taskId, uint256 tokenId) external",
  "function claimReward(uint256 experienceId) external"
];

async function completeAllTasksAndClaim() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const passport = new ethers.Contract(FAN_AI_PASSPORT, PASSPORT_ABI, provider);
  const experience = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, wallet);

  const experienceId = 1;

  // 1. Récupérer le tokenId lié à l'utilisateur
  const tokenId = await experience.userToTokenId(USER_ADDRESS);
  if (tokenId === 0) {
    console.log("❌ L'utilisateur n'est pas lié à un NFT Passport. Veuillez lier d'abord.");
    return;
  }

  // 2. Démarrer l'expérience
  try {
    const tx = await experience.startExperience(experienceId);
    await tx.wait();
    console.log("✅ Expérience démarrée");
  } catch (e) {
    console.log("(Info) Expérience déjà démarrée ou erreur :", e.message);
  }

  // 3. Compléter les tâches (selon le contrat _createPSGStadiumTour)
  // Task 0: Quiz Historique
  try {
    const tx = await experience.completeQuizTask(experienceId, 0, "1970");
    await tx.wait();
    console.log("✅ Quiz Historique complété");
  } catch (e) { console.log("(Info) Quiz Historique déjà fait ou erreur :", e.message); }

  // Task 1: QR Code Entrée
  try {
    const tx = await experience.completeQRCodeTask(experienceId, 1, "qr_entrance_parc_princes");
    await tx.wait();
    console.log("✅ QR Code Entrée complété");
  } catch (e) { console.log("(Info) QR Code déjà fait ou erreur :", e.message); }

  // Task 2: Photo Tribune (nécessite owner, donc on skip ici)
  // Task 3: Check-in Vestiaires
  try {
    const tx = await experience.completeCheckInTask(experienceId, 3);
    await tx.wait();
    console.log("✅ Check-in Vestiaires complété");
  } catch (e) { console.log("(Info) Check-in déjà fait ou erreur :", e.message); }

  // Task 4: Quiz Joueur
  try {
    const tx = await experience.completeQuizTask(experienceId, 4, "Edinson Cavani");
    await tx.wait();
    console.log("✅ Quiz Joueur complété");
  } catch (e) { console.log("(Info) Quiz Joueur déjà fait ou erreur :", e.message); }

  // 4. Claim la récompense
  try {
    const tx = await experience.claimReward(experienceId);
    await tx.wait();
    console.log("🎁 NFT reward claimed!");
  } catch (e) {
    console.log("❌ Erreur lors du claim :", e.message);
  }
}

completeAllTasksAndClaim().catch(console.error); 