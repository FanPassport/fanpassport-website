const fs = require('fs');
const path = require('path');

// Test script to verify interface data structure
const testInterface = () => {
  const dataPath = path.join(process.cwd(), "data", "experiences.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  
  const userAddress = "0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b";
  
  console.log("🧪 Testing interface data structure...");
  console.log(`User: ${userAddress}`);
  
  // Test experience 2 (completed)
  const experience2 = data.experiences.find(exp => exp.id === 2);
  const userProgress2 = data.userProgress[userAddress]?.[2];
  
  console.log(`\n📊 Experience 2 (PSG FIFA Cup Final):`);
  console.log(`  - Name: ${experience2.name}`);
  console.log(`  - Total tasks: ${experience2.tasks.length}`);
  console.log(`  - User progress: ${userProgress2 ? 'Yes' : 'No'}`);
  
  if (userProgress2) {
    console.log(`  - Experience started: ${userProgress2.experienceStarted}`);
    console.log(`  - Experience completed: ${userProgress2.experienceCompleted}`);
    console.log(`  - Completed tasks: ${userProgress2.completedTasks.join(', ')}`);
    console.log(`  - Completion date: ${userProgress2.completionDate ? new Date(userProgress2.completionDate).toLocaleString() : 'N/A'}`);
    
    // Calculate progress
    const progress = (userProgress2.completedTasks.length / experience2.tasks.length) * 100;
    console.log(`  - Progress: ${progress.toFixed(1)}%`);
    
    if (userProgress2.experienceCompleted) {
      console.log(`  - ✅ NFT should be automatically minted!`);
    }
  }
  
  // Test experience 1 (not started)
  const experience1 = data.experiences.find(exp => exp.id === 1);
  const userProgress1 = data.userProgress[userAddress]?.[1];
  
  console.log(`\n📊 Experience 1 (PSG Stadium Tour):`);
  console.log(`  - Name: ${experience1.name}`);
  console.log(`  - Total tasks: ${experience1.tasks.length}`);
  console.log(`  - User progress: ${userProgress1 ? 'Yes' : 'No'}`);
  
  if (userProgress1) {
    console.log(`  - Experience started: ${userProgress1.experienceStarted}`);
    console.log(`  - Experience completed: ${userProgress1.experienceCompleted}`);
    console.log(`  - Completed tasks: ${userProgress1.completedTasks?.join(', ') || 'none'}`);
  } else {
    console.log(`  - No progress yet`);
  }
  
  console.log(`\n✅ Interface data structure test completed!`);
};

// Run the test
testInterface(); 