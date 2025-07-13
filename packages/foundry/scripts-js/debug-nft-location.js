import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const USER_ADDRESS = "0xFd70b60411692F1a4c0d57046ab64b81D3DC3a83";
const FAN_AI_PASSPORT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const FAN_AI_EXPERIENCE = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const FAN_AI_EXPERIENCE_NFT = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const PASSPORT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getAccount(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)"
];

const EXPERIENCE_ABI = [
  "function userToTokenId(address user) view returns (uint256)"
];

const EXPERIENCE_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)"
];

async function debugNFTLocation() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const passport = new ethers.Contract(FAN_AI_PASSPORT, PASSPORT_ABI, provider);
  const experience = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, provider);
  const expNFT = new ethers.Contract(FAN_AI_EXPERIENCE_NFT, EXPERIENCE_NFT_ABI, provider);

  console.log("🔍 Debugging NFT location after claimReward...\n");

  // 1. Vérifier le token ID de l'utilisateur
  console.log("1. Vérification du token ID de l'utilisateur...");
  const linkedTokenId = await experience.userToTokenId(USER_ADDRESS);
  console.log(`   Token ID lié: ${linkedTokenId}`);

  if (linkedTokenId === 0) {
    console.log("   ❌ Utilisateur non lié à un NFT");
    return;
  }

  // 2. Vérifier le TBA (Token Bound Account)
  console.log("\n2. Vérification du TBA...");
  const tba = await passport.getAccount(linkedTokenId);
  console.log(`   TBA: ${tba}`);

  // 3. Vérifier les NFTs dans le TBA
  console.log("\n3. Vérification des NFTs dans le TBA...");
  try {
    const tbaNFTBalance = await expNFT.balanceOf(tba);
    console.log(`   Balance NFT dans le TBA: ${tbaNFTBalance}`);

    if (tbaNFTBalance > 0) {
      console.log("   ✅ NFT trouvé dans le TBA!");
      
      // Lister tous les NFTs du TBA
      for (let i = 0; i < tbaNFTBalance; i++) {
        try {
          const tokenId = await expNFT.tokenOfOwnerByIndex(tba, i);
          console.log(`   - Token ID ${i}: ${tokenId}`);
        } catch (error) {
          console.log(`   - Token ID ${i}: Erreur lors de la récupération`);
        }
      }
    } else {
      console.log("   ❌ Aucun NFT trouvé dans le TBA");
    }
  } catch (error) {
    console.log("   ❌ Erreur lors de la vérification du TBA:", error.message);
  }

  // 4. Vérifier les NFTs dans l'adresse principale
  console.log("\n4. Vérification des NFTs dans l'adresse principale...");
  try {
    const mainAddressNFTBalance = await expNFT.balanceOf(USER_ADDRESS);
    console.log(`   Balance NFT dans l'adresse principale: ${mainAddressNFTBalance}`);

    if (mainAddressNFTBalance > 0) {
      console.log("   ✅ NFT trouvé dans l'adresse principale!");
      
      for (let i = 0; i < mainAddressNFTBalance; i++) {
        try {
          const tokenId = await expNFT.tokenOfOwnerByIndex(USER_ADDRESS, i);
          console.log(`   - Token ID ${i}: ${tokenId}`);
        } catch (error) {
          console.log(`   - Token ID ${i}: Erreur lors de la récupération`);
        }
      }
    } else {
      console.log("   ❌ Aucun NFT trouvé dans l'adresse principale");
    }
  } catch (error) {
    console.log("   ❌ Erreur lors de la vérification de l'adresse principale:", error.message);
  }

  // 5. Vérifier le total supply du contrat NFT
  console.log("\n5. Vérification du total supply...");
  try {
    const totalSupply = await expNFT.totalSupply();
    console.log(`   Total supply: ${totalSupply}`);
  } catch (error) {
    console.log("   ❌ Erreur lors de la vérification du total supply:", error.message);
  }

  console.log("\n📋 Résumé:");
  console.log("   - L'NFT de récompense devrait être dans le TBA, pas dans l'adresse principale");
  console.log("   - Le TBA est l'adresse qui peut recevoir des NFTs pour votre FAN Passport");
  console.log("   - Vérifiez le TBA dans le block explorer pour voir l'NFT de récompense");
}

debugNFTLocation().catch(console.error); 