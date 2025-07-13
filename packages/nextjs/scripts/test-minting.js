const fs = require('fs');
const path = require('path');

// Test script to simulate completing all tasks for experience 2
const testMinting = () => {
  const dataPath = path.join(process.cwd(), "data", "experiences.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  
  const userAddress = "0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b";
  const experienceId = 2;
  
  console.log("🧪 Testing automatic NFT minting...");
  console.log(`User: ${userAddress}`);
  console.log(`Experience: ${experienceId}`);
  
  // Get current progress
  const currentProgress = data.userProgress[userAddress]?.[experienceId];
  console.log(`Current completed tasks: ${currentProgress?.completedTasks?.join(', ') || 'none'}`);
  
  // Get experience details
  const experience = data.experiences.find(exp => exp.id === experienceId);
  console.log(`Total tasks: ${experience.tasks.length}`);
  
  // Simulate completing all remaining tasks
  const remainingTasks = experience.tasks.filter(task => 
    !currentProgress?.completedTasks?.includes(task.id)
  );
  
  console.log(`\n📋 Remaining tasks to complete:`);
  remainingTasks.forEach(task => {
    console.log(`  - Task ${task.id}: ${task.name} (${task.taskType})`);
  });
  
  // Simulate completing each task
  console.log(`\n🔄 Simulating task completion...`);
  
  remainingTasks.forEach(task => {
    console.log(`  ✅ Completing task ${task.id}: ${task.name}`);
    
    // Add task to completed tasks
    if (!data.userProgress[userAddress]) {
      data.userProgress[userAddress] = {};
    }
    if (!data.userProgress[userAddress][experienceId]) {
      data.userProgress[userAddress][experienceId] = {
        experienceStarted: true,
        experienceCompleted: false,
        completedTasks: [],
      };
    }
    
    const userProgress = data.userProgress[userAddress][experienceId];
    userProgress.completedTasks.push(task.id);
    
    // Check if experience is now completed
    if (userProgress.completedTasks.length === experience.tasks.length) {
      userProgress.experienceCompleted = true;
      userProgress.completionDate = Date.now();
      console.log(`\n🎉 EXPERIENCE COMPLETED! NFT minting should be triggered!`);
    }
  });
  
  // Save updated data
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  
  // Final status
  const finalProgress = data.userProgress[userAddress][experienceId];
  console.log(`\n📊 Final status:`);
  console.log(`  - Completed tasks: ${finalProgress.completedTasks.join(', ')}`);
  console.log(`  - Experience completed: ${finalProgress.experienceCompleted}`);
  console.log(`  - Completion date: ${finalProgress.completionDate ? new Date(finalProgress.completionDate).toLocaleString() : 'N/A'}`);
  
  if (finalProgress.experienceCompleted) {
    console.log(`\n🚀 NFT minting should be triggered automatically!`);
    console.log(`   - User: ${userAddress}`);
    console.log(`   - Experience: ${experienceId}`);
    console.log(`   - Reward: ${experience.rewardAmount} ${experience.rewardToken}`);
  }
};

// Run the test
testMinting(); 