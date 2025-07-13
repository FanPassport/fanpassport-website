import fs from 'fs';
import path from 'path';

// Debug script to check NFT balances and contract state
const debugNFTBalance = () => {
  console.log("🔍 Debugging NFT Balance Issues");
  console.log("==================================");
  
  // Check if we're in the right directory
  const currentDir = process.cwd();
  console.log("Current directory:", currentDir);
  
  // Check if deployedContracts.ts exists
  const deployedContractsPath = path.join(currentDir, "contracts", "deployedContracts.ts");
  if (fs.existsSync(deployedContractsPath)) {
    console.log("✅ deployedContracts.ts found");
  } else {
    console.log("❌ deployedContracts.ts not found");
  }
  
  // Check if the contract addresses are properly configured
  try {
    const deployedContractsContent = fs.readFileSync(deployedContractsPath, 'utf8');
    
    // Check for FanAIPassport contract
    if (deployedContractsContent.includes('FanAIPassport')) {
      console.log("✅ FanAIPassport contract found in deployedContracts.ts");
    } else {
      console.log("❌ FanAIPassport contract not found in deployedContracts.ts");
    }
    
    // Check for balanceOf function
    if (deployedContractsContent.includes('balanceOf')) {
      console.log("✅ balanceOf function found in contract ABI");
    } else {
      console.log("❌ balanceOf function not found in contract ABI");
    }
    
  } catch (error) {
    console.log("❌ Error reading deployedContracts.ts:", error.message);
  }
  
  console.log("\n📋 Troubleshooting Steps:");
  console.log("1. Make sure you're connected to the correct network (31337 for local)");
  console.log("2. Check that the contract is deployed and accessible");
  console.log("3. Verify the wallet address is correct");
  console.log("4. Check browser console for debug logs");
  console.log("5. Try refreshing the page after minting");
  console.log("6. Check if the transaction was actually confirmed on the blockchain");
  
  console.log("\n🔧 Common Issues:");
  console.log("- Wrong network selected in MetaMask");
  console.log("- Contract not deployed or wrong address");
  console.log("- Cache not invalidated after transaction");
  console.log("- Transaction failed but UI shows success");
  console.log("- Wrong wallet address connected");
  
  console.log("\n💡 Solutions:");
  console.log("- Switch to local network (31337) in MetaMask");
  console.log("- Redeploy contracts with 'yarn deploy'");
  console.log("- Clear browser cache and reload");
  console.log("- Check transaction hash in block explorer");
  console.log("- Verify wallet connection");
  console.log("- Check console logs for debug information");
};

// Run the debug function
debugNFTBalance(); 