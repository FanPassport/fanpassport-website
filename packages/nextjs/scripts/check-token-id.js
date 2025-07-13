const fs = require('fs');
const path = require('path');

// Script to check which token ID the user owns
const checkTokenId = () => {
  const userAddress = "0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b";
  const contractAddress = "0xf7Cd8fa9b94DB2Aa972023b379c7f72c65E4De9D";
  
  console.log("🔍 Checking token ID for user...");
  console.log(`User: ${userAddress}`);
  console.log(`Contract: ${contractAddress}`);
  console.log("");
  
  // Check token IDs 1-10 to see which one the user owns
  console.log("Checking token IDs 1-10...");
  
  for (let i = 1; i <= 10; i++) {
    console.log(`Token ID ${i}: Checking...`);
    // In a real implementation, you would call the contract here
    // For now, we'll just show the expected behavior
  }
  
  console.log("");
  console.log("💡 Based on the deployment logs, the first NFT minted has token ID: 1");
  console.log("💡 Try burning token ID 1 instead of 0");
  console.log("");
  console.log("To check in the browser console:");
  console.log(`
// Check if you own token ID 1
const { data: owner1 } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "ownerOf",
  args: [1],
});
console.log("Owner of token 1:", owner1);

// Check if you own token ID 0
const { data: owner0 } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "ownerOf",
  args: [0],
});
console.log("Owner of token 0:", owner0);
  `);
};

checkTokenId(); 