import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const MATCH_NFT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

const MATCH_NFT_ABI = [
  "function getMatchData(uint256 tokenId) view returns (tuple(string matchId, string competition, string kickoff, string venue, string hometeam, string awayteam, string score, string status))"
];

async function getMatchData() {
  console.log("🏟️ Getting MatchNFT data for token ID 1...\n");

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const matchNFT = new ethers.Contract(MATCH_NFT_ADDRESS, MATCH_NFT_ABI, provider);

  try {
    const matchData = await matchNFT.getMatchData(1);
    
    console.log("Match Data for Token ID 1:");
    console.log("─────────────────────────────");
    console.log(`Match ID: ${matchData.matchId}`);
    console.log(`Competition: ${matchData.competition}`);
    console.log(`Kickoff: ${matchData.kickoff}`);
    console.log(`Venue: ${matchData.venue}`);
    console.log(`Home Team: ${matchData.hometeam}`);
    console.log(`Away Team: ${matchData.awayteam}`);
    console.log(`Score: ${matchData.score}`);
    console.log(`Status: ${matchData.status}`);

  } catch (error) {
    console.error("❌ Error getting match data:", error.message);
  }
}

getMatchData().catch(console.error);