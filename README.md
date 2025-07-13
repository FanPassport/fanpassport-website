# 🎫 FAN Passport - Web3 Fan Experience Platform

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Scaffold-ETH 2</a>
</h4>

## 🌟 About FAN Passport

FAN Passport is a revolutionary Web3 platform that transforms how sports fans interact with their favorite clubs. Built on Ethereum blockchain technology, it provides exclusive fan experiences through NFT-based digital passports.

### 🏆 Key Features

- **🎫 NFT Passports**: Unique digital passports for each fan with club-specific branding
- **🎮 Interactive Experiences**: Gamified experiences with quizzes, QR codes, and photo challenges
- **🏆 NFT Rewards**: Earn exclusive NFTs by completing club experiences
- **🔗 Token Bound Accounts**: Advanced wallet technology for secure asset management
- **⚡ Multi-Club Support**: Support for multiple sports clubs (PSG, Barcelona, etc.)
- **🎨 Dynamic NFT Generation**: Automatically generated NFTs with club colors and branding

### 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, Foundry, ERC-721, ERC-6551 (Token Bound Accounts)
- **Web3**: Wagmi, Viem, RainbowKit
- **Deployment**: Vercel, IPFS

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (>= v20.18.3)
- [Yarn](https://yarnpkg.com/) (v1 or v2+)
- [Git](https://git-scm.com/)
- [Foundry](https://getfoundry.sh/) (for smart contract development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dapp-website

# Install dependencies
yarn install
```

## 🛠️ Development Commands

### Local Development

```bash
# Start local blockchain network
yarn chain

# Deploy contracts to local network
yarn deploy

# Start the frontend development server
yarn start

# Run smart contract tests
yarn test

# Compile smart contracts
yarn compile

# Format code
yarn format

# Lint code
yarn lint
```

### Smart Contract Development

```bash
# Compile contracts
yarn foundry:compile

# Run tests
yarn foundry:test

# Deploy contracts
yarn foundry:deploy

# Verify contracts on block explorer
yarn foundry:verify

# Generate TypeScript ABIs
yarn foundry:generate-abis

# Flatten contracts
yarn foundry:flatten

# Fork mainnet for testing
yarn foundry:fork
```

### Account Management

```bash
# Generate new account
yarn account:generate

# Import existing account
yarn account:import

# Check account balance
yarn account

# Reveal private key
yarn account:reveal-pk
```

## 🌐 Network Configuration

### Supported Networks

1. **Localhost (31337)**: Development and testing
2. **Chiliz Spicy Testnet (88882)**: Public testnet deployment

### Network-Specific Commands

#### Local Development
```bash
# Start local chain
yarn chain

# Deploy to local network
yarn deploy

# Start frontend (connects to localhost)
yarn start
```

#### Testnet Deployment
```bash
# Deploy to Chiliz Spicy Testnet
RPC_URL=https://spicy-rpc.chiliz.com yarn foundry:deploy

# Verify contracts on Chiliz Explorer
RPC_URL=https://spicy-rpc.chiliz.com yarn foundry:verify

# Start frontend with testnet configuration
yarn start
```

## 🏗️ Build & Deployment

### Local Build

```bash
# Build the frontend
yarn next:build

# Serve the built application
yarn next:serve

# Check TypeScript types
yarn next:check-types
```

### Production Deployment

#### Vercel Deployment
```bash
# Deploy to Vercel
yarn vercel

# Deploy with build errors ignored (for testing)
yarn vercel:yolo

# Login to Vercel
yarn vercel:login
```

#### IPFS Deployment
```bash
# Build and deploy to IPFS
yarn ipfs
```

## 🧪 Testing

### Smart Contract Testing
```bash
# Run all tests
yarn test

# Run specific test file
forge test --match-test testName

# Run tests with verbose output
forge test -vvv
```

### Frontend Testing
```bash
# Run linting
yarn next:lint

# Check types
yarn next:check-types

# Run tests (if configured)
yarn test
```

## 🔧 Advanced Commands

### Contract Management
```bash
# Deploy specific contract
DEPLOY_SCRIPT=script/DeployExperienceNFT.s.sol yarn deploy

# Deploy and verify in one command
yarn foundry:deploy-verify

# Fork specific network
FORK_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY yarn foundry:fork
```

### Development Utilities
```bash
# Clean build artifacts
yarn foundry:clean

# Generate keystore files
yarn foundry:generate

# Import accounts from keystore
yarn foundry:account-import
```

## 📁 Project Structure

```
dapp-website/
├── packages/
│   ├── foundry/          # Smart contracts & deployment
│   │   ├── contracts/    # Solidity contracts
│   │   ├── script/       # Deployment scripts
│   │   ├── test/         # Contract tests
│   │   └── scripts-js/   # JavaScript utilities
│   └── nextjs/           # Frontend application
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       └── services/     # Business logic
├── data/                 # Static data (clubs, experiences)
└── public/              # Static assets
```

## 🎯 Core Features

### Fan Passport NFT
- ERC-721 compliant NFTs with club-specific branding
- Token Bound Account (ERC-6551) integration
- Dynamic metadata generation

### Club Experiences
- Interactive quiz challenges
- QR code verification tasks
- Photo upload and verification
- Check-in location validation

### Reward System
- NFT rewards for completed experiences
- Club-specific reward NFTs
- Dynamic NFT generation with club colors

## 🔐 Security

- Smart contracts audited and tested
- Secure wallet integration
- Environment variable protection
- Input validation and sanitization

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENCE](LICENCE) file for details.

## 🆘 Support

- 📖 [Documentation](https://docs.scaffoldeth.io)
- 🐛 [Report Issues](https://github.com/scaffold-eth/scaffold-eth-2/issues)
- 💬 [Discord Community](https://discord.gg/scaffold-eth)

---

**Built with ❤️ using [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)**