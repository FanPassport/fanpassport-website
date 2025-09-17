#!/bin/bash

# MatchNFT Deployment Helper Script
# Usage: ./deploy.sh [network]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default network
NETWORK=${1:-localhost}

echo -e "${BLUE}🚀 Deploying MatchNFT to ${NETWORK}${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Please create one with your PRIVATE_KEY${NC}"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY not found in .env file${NC}"
    exit 1
fi

# Navigate to foundry directory
cd packages/foundry

# Build contracts
echo -e "${YELLOW}🔨 Building contracts...${NC}"
forge build

# Deploy based on network
case $NETWORK in
    "localhost")
        echo -e "${YELLOW}📡 Deploying to localhost...${NC}"
        DEPLOY_OUTPUT=$(forge script script/DeployMatchNFT.s.sol --rpc-url localhost --broadcast)
        ;;
    "chiliz-testnet"|"chilizSpicyTestnet")
        echo -e "${YELLOW}📡 Deploying to Chiliz Spicy Testnet...${NC}"
        if [ -z "$CHILIZ_API_KEY" ]; then
            echo -e "${RED}❌ CHILIZ_API_KEY not found in .env file${NC}"
            exit 1
        fi
        DEPLOY_OUTPUT=$(forge script script/DeployMatchNFT.s.sol --rpc-url chilizSpicyTestnet --broadcast --verify)
        ;;
    "chiliz"|"chiliz-mainnet")
        echo -e "${YELLOW}📡 Deploying to Chiliz Mainnet...${NC}"
        if [ -z "$CHILIZ_API_KEY" ]; then
            echo -e "${RED}❌ CHILIZ_API_KEY not found in .env file${NC}"
            exit 1
        fi
        echo -e "${RED}⚠️  WARNING: Deploying to mainnet!${NC}"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        DEPLOY_OUTPUT=$(forge script script/DeployMatchNFT.s.sol --rpc-url chiliz --broadcast --verify)
        ;;
    *)
        echo -e "${RED}❌ Unknown network: ${NETWORK}${NC}"
        echo -e "${YELLOW}Available networks:${NC}"
        echo "  localhost"
        echo "  chiliz-testnet (or chilizSpicyTestnet)"
        echo "  chiliz (or chiliz-mainnet)"
        exit 1
        ;;
esac

# Extract contract address from output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "MatchNFT deployed at:" | sed 's/.*MatchNFT deployed at: //')

if [ -n "$CONTRACT_ADDRESS" ]; then
    echo -e "${GREEN}✅ MatchNFT deployed successfully!${NC}"
    echo -e "${GREEN}📍 Contract Address: ${CONTRACT_ADDRESS}${NC}"

    # Save to file
    echo "$CONTRACT_ADDRESS" > ".deployed_${NETWORK}.txt"
    echo -e "${BLUE}💾 Address saved to .deployed_${NETWORK}.txt${NC}"

    # Display network info
    case $NETWORK in
        "localhost")
            echo -e "${BLUE}🌐 Network: Localhost (31337)${NC}"
            ;;
        "chiliz-testnet"|"chilizSpicyTestnet")
            echo -e "${BLUE}🌐 Network: Chiliz Spicy Testnet (88882)${NC}"
            echo -e "${BLUE}🔍 Explorer: https://testnet.chiliscan.com/address/${CONTRACT_ADDRESS}${NC}"
            ;;
        "chiliz"|"chiliz-mainnet")
            echo -e "${BLUE}🌐 Network: Chiliz Mainnet (88888)${NC}"
            echo -e "${BLUE}🔍 Explorer: https://scan.chiliz.com/address/${CONTRACT_ADDRESS}${NC}"
            ;;
    esac

    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Update the contract address in packages/nextjs/contracts/externalContracts.ts"
    echo "2. Test the contract on the target network"
    echo "3. Update your frontend configuration"

else
    echo -e "${RED}❌ Deployment failed or contract address not found${NC}"
    echo -e "${YELLOW}Deployment output:${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi