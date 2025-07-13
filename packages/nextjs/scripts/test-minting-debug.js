const fs = require('fs');
const path = require('path');

// Test script to debug NFT minting process
const testMintingDebug = () => {
  const dataPath = path.join(process.cwd(), "data", "experiences.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  
  const userAddress = "0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b";
  
  console.log("🔍 Debugging NFT minting process...");
  console.log(`User: ${userAddress}`);
  
  // Check all experiences for this user
  const userProgress = data.userProgress[userAddress];
  
  if (!userProgress) {
    console.log("❌ No user progress found");
    return;
  }
  
  console.log("\n📊 User Progress Summary:");
  Object.entries(userProgress).forEach(([experienceId, progress]) => {
    const experience = data.experiences.find(exp => exp.id === parseInt(experienceId));
    console.log(`  Experience ${experienceId} (${experience?.name}):`);
    console.log(`    - Started: ${progress.experienceStarted}`);
    console.log(`    - Completed: ${progress.experienceCompleted}`);
    console.log(`    - Tasks: ${progress.completedTasks.join(', ')}`);
    console.log(`    - Total tasks: ${experience?.tasks.length}`);
    
    if (progress.experienceCompleted) {
      console.log(`    - ✅ READY FOR NFT MINTING!`);
    }
  });
  
  // Check if any experience is completed
  const completedExperiences = Object.entries(userProgress).filter(([_, progress]) => progress.experienceCompleted);
  
  console.log(`\n🎯 Completed experiences: ${completedExperiences.length}`);
  
  if (completedExperiences.length > 0) {
    console.log("✅ User should be able to mint NFT!");
    console.log("📝 Next steps:");
    console.log("  1. Go to http://localhost:3001/experiences/2");
    console.log("  2. Connect wallet with address:", userAddress);
    console.log("  3. Check browser console for minting logs");
    console.log("  4. MetaMask should prompt for transaction confirmation");
  } else {
    console.log("❌ No completed experiences found");
  }
  
  // Check contract deployment
  console.log("\n📋 Contract Information:");
  console.log("  - FanAIPassport should be deployed at: 0xb19b36b1456e65e3a6d514d3f715f204bd59f431");
  console.log("  - Network: Local (31337)");
  console.log("  - Function: mint(address to)");
};

// Run the test
testMintingDebug(); 