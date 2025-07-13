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
  "function linkUserToNFT(address user, uint256 tokenId) external"
];

async function linkUserToNFT() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const passport = new ethers.Contract(FAN_AI_PASSPORT, PASSPORT_ABI, provider);
  const experience = new ethers.Contract(FAN_AI_EXPERIENCE, EXPERIENCE_ABI, wallet);

  console.log("🔗 Linking user to NFT...\n");

  // 1. Vérifier le token ID de l'utilisateur
  console.log("1. Vérification du token ID actuel...");
  const currentLinkedTokenId = await experience.userToTokenId(USER_ADDRESS);
  console.log(`   Token ID actuellement lié: ${currentLinkedTokenId}`);

  if (currentLinkedTokenId === 0) {
    console.log("   ❌ Utilisateur non lié à un NFT, liaison en cours...");
    // 2. Trouver le token ID de l'utilisateur
    console.log("\n2. Recherche du token ID de l'utilisateur...");
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

    if (userTokenId === 0) {
      console.log("   ❌ Aucun NFT trouvé pour l'utilisateur");
      return;
    }

    console.log(`   ✅ Token ID trouvé: ${userTokenId}`);

    // 3. Lier l'utilisateur à son NFT
    console.log("\n3. Liaison de l'utilisateur à son NFT...");
    try {
      const tx = await experience.linkUserToNFT(USER_ADDRESS, userTokenId);
      console.log(`   Transaction hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`   ✅ Transaction confirmée dans le bloc ${receipt.blockNumber}`);
      
      // 4. Vérifier la liaison
      console.log("\n4. Vérification de la liaison...");
      const newLinkedTokenId = await experience.userToTokenId(USER_ADDRESS);
      console.log(`   Nouveau token ID lié: ${newLinkedTokenId}`);
      
      if (newLinkedTokenId === userTokenId) {
        console.log("   ✅ Liaison réussie!");
      } else {
        console.log("   ❌ Échec de la liaison");
      }
    } catch (error) {
      console.log("   ❌ Erreur lors de la liaison:", error.message);
    }
  } else {
    console.log("   ✅ Utilisateur déjà lié à un NFT");
    return;
  }
}

linkUserToNFT().catch(console.error); 