import { ethers } from "ethers";

// Configuration
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";
const USER_ADDRESS = process.env.USER_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Adresses des contrats (depuis le déploiement)
const FAN_AI_PASSPORT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const FAN_AI_EXPERIENCE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const FAN_AI_EXPERIENCE_NFT = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// ABI simplifiés pour les fonctions nécessaires
const PASSPORT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getAccount(uint256 tokenId) view returns (address)"
];

const EXPERIENCE_ABI = [
  "function linkUserToNFT(address user, uint256 tokenId) external",
  "function startExperience(uint256 _experienceId) external",
  "function completeQuizTask(uint256 _experienceId, uint256 _taskId, string memory _answer) external",
  "function completeCheckInTask(uint256 _experienceId, uint256 _taskId) external",
  "function claimReward(uint256 _experienceId) external",
  "function userToTokenId(address user) view returns (uint256)",
  "function nftProgress(uint256 tokenId, uint256 experienceId) view returns (bool experienceStarted, bool experienceCompleted, uint256 completedTasks, uint256 completionDate)"
];

const EXPERIENCE_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function experienceOf(uint256 tokenId) view returns (uint256)"
];

async function testExperienceFlow() {
  console.log("🚀 Test du flux d'expérience complet...\n");

  // Connexion au provider
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Instanciation des contrats
  const passportContract = new ethers.Contract(FAN_AI_PASSPORT, PASSPORT_ABI, wallet);
  const experienceContract = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, wallet);
  const experienceNFTContract = new ethers.Contract(FAN_AI_EXPERIENCE_NFT, EXPERIENCE_NFT_ABI, wallet);

  try {
    // 1. Vérifier le propriétaire du NFT
    console.log("1. Vérification du propriétaire du NFT...");
    const tokenId = 1;
    const owner = await passportContract.ownerOf(tokenId);
    console.log(`   Token ID ${tokenId} appartient à: ${owner}`);
    console.log(`   Adresse utilisateur: ${USER_ADDRESS}`);
    console.log(`   Match: ${owner.toLowerCase() === USER_ADDRESS.toLowerCase()}\n`);

    // 2. Obtenir l'adresse du TBA
    console.log("2. Récupération du Token Bound Account...");
    const tbaAddress = await passportContract.getAccount(tokenId);
    console.log(`   TBA Address: ${tbaAddress}\n`);

    // 3. Lier l'utilisateur au NFT
    console.log("3. Liaison utilisateur-NFT...");
    const linkTx = await experienceContract.linkUserToNFT(USER_ADDRESS, tokenId);
    await linkTx.wait();
    console.log(`   ✅ Utilisateur lié au NFT ${tokenId}\n`);

    // 4. Vérifier le lien
    console.log("4. Vérification du lien...");
    const linkedTokenId = await experienceContract.userToTokenId(USER_ADDRESS);
    console.log(`   Token ID lié: ${linkedTokenId}\n`);

    // 5. Commencer l'expérience
    console.log("5. Démarrage de l'expérience...");
    const startTx = await experienceContract.startExperience(1);
    await startTx.wait();
    console.log(`   ✅ Expérience démarrée\n`);

    // 6. Compléter les tâches
    console.log("6. Complétion des tâches...");
    
    // Tâche 0: Quiz Historique
    console.log("   - Tâche 0: Quiz Historique");
    const quizTx = await experienceContract.completeQuizTask(1, 0, "1970");
    await quizTx.wait();
    console.log("     ✅ Quiz complété");

    // Tâche 1: QR Code (simulation)
    console.log("   - Tâche 1: QR Code (simulation)");
    const qrTx = await experienceContract.completeQRCodeTask(1, 1, "qr_entrance_parc_princes");
    await qrTx.wait();
    console.log("     ✅ QR Code complété");

    // Tâche 2: Photo (nécessite owner)
    console.log("   - Tâche 2: Photo (simulation par owner)");
    const photoTx = await experienceContract.completePhotoTask(1, 2, tokenId);
    await photoTx.wait();
    console.log("     ✅ Photo complétée");

    // Tâche 3: Check-in
    console.log("   - Tâche 3: Check-in");
    const checkinTx = await experienceContract.completeCheckInTask(1, 3);
    await checkinTx.wait();
    console.log("     ✅ Check-in complété");

    // Tâche 4: Quiz Joueur
    console.log("   - Tâche 4: Quiz Joueur");
    const quiz2Tx = await experienceContract.completeQuizTask(1, 4, "Edinson Cavani");
    await quiz2Tx.wait();
    console.log("     ✅ Quiz Joueur complété\n");

    // 7. Vérifier la progression
    console.log("7. Vérification de la progression...");
    const progress = await experienceContract.nftProgress(tokenId, 1);
    console.log(`   Expérience démarrée: ${progress.experienceStarted}`);
    console.log(`   Expérience complétée: ${progress.experienceCompleted}`);
    console.log(`   Tâches complétées: ${progress.completedTasks}/5\n`);

    // 8. Réclamer la récompense
    console.log("8. Réclamation de la récompense...");
    const claimTx = await experienceContract.claimReward(1);
    await claimTx.wait();
    console.log(`   ✅ Récompense réclamée\n`);

    // 9. Vérifier les récompenses
    console.log("9. Vérification des récompenses...");
    
    // Balance ETH du TBA
    const tbaBalance = await provider.getBalance(tbaAddress);
    console.log(`   Balance ETH du TBA: ${ethers.utils.formatEther(tbaBalance)} ETH`);
    
    // NFTs d'expérience du TBA
    const nftBalance = await experienceNFTContract.balanceOf(tbaAddress);
    console.log(`   NFTs d'expérience du TBA: ${nftBalance}`);
    
    if (nftBalance > 0) {
      const tokenId = await experienceNFTContract.tokenOfOwnerByIndex(tbaAddress, 0);
      const experienceId = await experienceNFTContract.experienceOf(tokenId);
      console.log(`   Token ID de l'expérience: ${tokenId}`);
      console.log(`   ID de l'expérience: ${experienceId}`);
    }

    console.log("\n🎉 Test terminé avec succès !");

  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

testExperienceFlow(); 