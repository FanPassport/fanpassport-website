import fs from 'fs';
import path from 'path';

// Test script to verify NFT claiming functionality
const testNFTClaim = () => {
  console.log("🎁 Testing NFT Claiming Functionality");
  console.log("=====================================");
  
  const dataPath = path.join(process.cwd(), "data", "experiences.json");
  
  if (!fs.existsSync(dataPath)) {
    console.log("❌ experiences.json not found");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  
  // Test user and experience
  const testUser = "0x227B392A0A826B6Ec0aE4677463b055a1e9e6E7B";
  const testExperienceId = 2;
  
  console.log(`\n📋 Test Configuration:`);
  console.log(`  - User: ${testUser}`);
  console.log(`  - Experience: ${testExperienceId}`);
  
  // Check if user has progress
  const userProgress = data.userProgress[testUser]?.[testExperienceId];
  
  if (!userProgress) {
    console.log("❌ No user progress found");
    return;
  }
  
  console.log(`\n📊 User Progress:`);
  console.log(`  - Experience Started: ${userProgress.experienceStarted}`);
  console.log(`  - Experience Completed: ${userProgress.experienceCompleted}`);
  console.log(`  - Completed Tasks: ${userProgress.completedTasks?.length || 0}`);
  console.log(`  - Last Reward Claim: ${userProgress.lastRewardClaimDate ? new Date(userProgress.lastRewardClaimDate).toLocaleString() : 'Not claimed'}`);
  
  // Check experience details
  const experience = data.experiences.find(exp => exp.id === testExperienceId);
  
  if (!experience) {
    console.log("❌ Experience not found");
    return;
  }
  
  console.log(`\n🎯 Experience Details:`);
  console.log(`  - Name: ${experience.name}`);
  console.log(`  - Total Tasks: ${experience.tasks.length}`);
  console.log(`  - Reward Amount: ${experience.rewardAmount} ${experience.rewardToken}`);
  
  // Check if experience is completed
  if (userProgress.experienceCompleted) {
    console.log(`\n✅ Experience is completed!`);
    
    if (userProgress.lastRewardClaimDate) {
      console.log(`🎁 NFT reward already claimed on ${new Date(userProgress.lastRewardClaimDate).toLocaleString()}`);
    } else {
      console.log(`🎁 NFT reward ready to claim!`);
      console.log(`\n📝 Next steps:`);
      console.log(`  1. Go to the experience page`);
      console.log(`  2. Click "🎁 Claim NFT Reward"`);
      console.log(`  3. Confirm the transaction in MetaMask`);
      console.log(`  4. Check your Token Bound Account for the NFT`);
    }
  } else {
    console.log(`\n⏳ Experience not completed yet`);
    console.log(`   - Completed: ${userProgress.completedTasks?.length || 0}/${experience.tasks.length} tasks`);
    
    if (userProgress.completedTasks?.length > 0) {
      console.log(`   - Remaining tasks: ${experience.tasks.length - (userProgress.completedTasks?.length || 0)}`);
    }
  }
  
  console.log(`\n🔧 Contract Information:`);
  console.log(`  - FanAIPassportExperience: Should be deployed on local network`);
  console.log(`  - Function: claimReward(uint256 _experienceId)`);
  console.log(`  - Network: Localhost 8545 (31337)`);
  
  console.log(`\n💡 Troubleshooting:`);
  console.log(`  - Make sure you're connected to local network in MetaMask`);
  console.log(`  - Ensure you have minted a FAN Passport NFT`);
  console.log(`  - Check that the experience is fully completed`);
  console.log(`  - Verify the smart contract is deployed and accessible`);
};

// Run the test
testNFTClaim(); 