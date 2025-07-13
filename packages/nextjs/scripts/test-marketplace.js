import fs from 'fs';
import path from 'path';

// Test script to verify marketplace functionality
const testMarketplace = () => {
  console.log("🏪 Testing Marketplace Functionality");
  console.log("====================================");
  
  const dataPath = path.join(process.cwd(), "data", "experiences.json");
  
  if (!fs.existsSync(dataPath)) {
    console.log("❌ experiences.json not found");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  
  console.log(`\n📋 Experience Data:`);
  console.log(`  - Total experiences: ${data.experiences.length}`);
  
  // Check each experience
  data.experiences.forEach((exp, index) => {
    console.log(`\n🎯 Experience ${index + 1}:`);
    console.log(`  - ID: ${exp.id}`);
    console.log(`  - Name: ${exp.name}`);
    console.log(`  - Club ID: ${exp.clubId}`);
    console.log(`  - Tasks: ${exp.tasks.length}`);
    console.log(`  - Reward: ${exp.rewardAmount} ${exp.rewardToken}`);
  });
  
  // Check clubs data
  const clubsPath = path.join(process.cwd(), "data", "clubs.json");
  if (fs.existsSync(clubsPath)) {
    const clubsData = JSON.parse(fs.readFileSync(clubsPath, "utf8"));
    console.log(`\n🏆 Clubs Data:`);
    console.log(`  - Total clubs: ${clubsData.clubs.length}`);
    
    clubsData.clubs.forEach((club, index) => {
      console.log(`\n  Club ${index + 1}:`);
      console.log(`    - ID: ${club.id}`);
      console.log(`    - Name: ${club.name}`);
      console.log(`    - Short Name: ${club.shortName}`);
    });
  }
  
  console.log(`\n🔧 Marketplace Issues to Check:`);
  console.log(`  1. Make sure the blockchain is running (yarn chain)`);
  console.log(`  2. Check that ExperienceNFT contract is deployed`);
  console.log(`  3. Verify that NFTs have been minted`);
  console.log(`  4. Check browser console for API errors`);
  console.log(`  5. Verify network connection to localhost:8545`);
  
  console.log(`\n📊 Expected Behavior:`);
  console.log(`  - Marketplace should show all minted NFTs`);
  console.log(`  - Each NFT should display club colors and logos`);
  console.log(`  - Owner addresses should be visible`);
  console.log(`  - Filter buttons should work (All/My NFTs)`);
  console.log(`  - Regeneration buttons should update NFT metadata`);
  
  console.log(`\n🚀 Next Steps:`);
  console.log(`  1. Start the blockchain: yarn chain`);
  console.log(`  2. Deploy contracts: yarn deploy`);
  console.log(`  3. Start the frontend: yarn start`);
  console.log(`  4. Navigate to /marketplace`);
  console.log(`  5. Check browser console for detailed logs`);
  console.log(`  6. Try minting some NFTs to test the marketplace`);
};

testMarketplace(); 