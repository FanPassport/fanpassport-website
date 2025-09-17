# MatchNFT Deployment Guide

This guide explains how to deploy and test the MatchNFT contract on different networks.

## Networks Supported

### Local Development
- **Network**: Localhost (31337)
- **RPC**: http://127.0.0.1:8545
- **Currency**: ETH

### Chiliz Testnet (Spicy)
- **Chain ID**: 88882 (0x15b32)
- **Network**: Chiliz Spicy Testnet
- **RPC**: https://spicy-rpc.chiliz.com
- **Currency**: CHZ
- **Explorer**: https://testnet.chiliscan.com

### Chiliz Mainnet
- **Chain ID**: 88888 (0x15b38)
- **Network**: Chiliz Chain
- **RPC**: https://rpc.ankr.com/chiliz
- **Currency**: CHZ
- **Explorer**: https://scan.chiliz.com

## Environment Setup

Create a `.env` file in the `packages/foundry` directory:

```bash
# For Chiliz networks
PRIVATE_KEY=your_private_key_here
CHILIZ_API_KEY=your_chilizscan_api_key_here

# For other networks (optional)
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Deployment Commands

### Deploy to Local Network
```bash
cd packages/foundry
forge script script/DeployMatchNFT.s.sol --rpc-url localhost --broadcast
```

### Deploy to Chiliz Testnet
```bash
cd packages/foundry
forge script script/DeployMatchNFT.s.sol --rpc-url chilizSpicyTestnet --broadcast --verify
```

### Deploy to Chiliz Mainnet
```bash
cd packages/foundry
forge script script/DeployMatchNFT.s.sol --rpc-url chiliz --broadcast --verify
```

## Testing

### Run Tests Locally
```bash
cd packages/foundry
forge test
```

### Run Tests on Specific Network
```bash
cd packages/foundry
forge test --rpc-url chilizSpicyTestnet
```

## Frontend Configuration

After deployment, update the contract addresses in:
- `packages/nextjs/contracts/externalContracts.ts`

Replace the placeholder addresses (`0x0000000000000000000000000000000000000000`) with the actual deployed contract addresses for each network.

## Contract Interaction

### Mint a Match NFT
```solidity
// Example call from frontend
await writeMatchNFTAsync({
  functionName: "mintMatchNFT",
  args: [
    userAddress,           // recipient
    "20250914-psg-lens",   // matchId
    "ligue1",              // competition
    "2025-09-14T15:15:00Z", // kickoff
    "parcdesprinces",      // venue
    "psg",                 // hometeam
    "lens",                // awayteam
    "2-0",                 // score
    "finished",            // status
    "https://example.com/metadata/match-nft.json" // tokenURI
  ],
});
```

## Match Data Structure

The contract stores the following match information:
- `matchId`: Unique identifier (e.g., "20250914-psg-lens")
- `competition`: Competition name (e.g., "ligue1", "champions-league")
- `kickoff`: Date/time in ISO format
- `venue`: Stadium name
- `hometeam`: Home team identifier
- `awayteam`: Away team identifier
- `score`: Final score (empty for scheduled matches)
- `status`: "scheduled" or "finished"

## Security Notes

- Only the contract owner can mint NFTs
- Users can only claim each match once
- Contract uses OpenZeppelin's battle-tested ERC721 implementation
- All match data is stored on-chain for transparency