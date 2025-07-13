// Script to debug token ownership
const debugTokenOwnership = () => {
  console.log("🔍 Debugging token ownership...");
  console.log("");
  console.log("📋 Steps to debug:");
  console.log("");
  console.log("1. Open browser console (F12)");
  console.log("2. Run these commands:");
  console.log("");
  console.log(`
// Check your connected address
console.log("Connected address:", connectedAddress);

// Check your NFT balance
console.log("NFT Balance:", userBalance?.toString());

// Check who owns token ID 1
const { data: owner1 } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "ownerOf",
  args: [1],
});
console.log("Owner of token 1:", owner1);

// Check who owns token ID 2
const { data: owner2 } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "ownerOf",
  args: [2],
});
console.log("Owner of token 2:", owner2);

// Check who owns token ID 0
const { data: owner0 } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "ownerOf",
  args: [0],
});
console.log("Owner of token 0:", owner0);
  `);
  console.log("");
  console.log("3. Compare your address with the token owners");
  console.log("4. Make sure you're connected with the right wallet");
  console.log("");
  console.log("💡 Common issues:");
  console.log("- Wrong wallet connected");
  console.log("- Token belongs to another address");
  console.log("- Wrong network (should be 31337)");
  console.log("- Contract not deployed properly");
};

debugTokenOwnership(); 