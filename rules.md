# GitHub Copilot Rules for dapp-website

## Package Management Rules

### MANDATORY: Use Yarn Instead of npm

**Rule**: Always use `yarn` for all package management operations. Never use `npm`.

**Examples of correct usage**:
- ✅ `yarn install` (NOT `npm install`)
- ✅ `yarn add package-name` (NOT `npm install package-name`)
- ✅ `yarn add --dev package-name` (NOT `npm install --save-dev package-name`)
- ✅ `yarn remove package-name` (NOT `npm uninstall package-name`)
- ✅ `yarn dev` (NOT `npm run dev`)
- ✅ `yarn build` (NOT `npm run build`)
- ✅ `yarn test` (NOT `npm test`)
- ✅ `yarn start` (NOT `npm start`)

**Rationale**: This project uses yarn as its package manager. Using npm can cause dependency conflicts and lock file issues.

**Enforcement**: Any suggestion or command using npm should be automatically converted to the yarn equivalent.

## Project Structure Rules

### Framework Context
- This is a Next.js project with TypeScript
- Uses Scaffold-ETH framework for Web3 functionality
- Located in `packages/nextjs/` directory
- Smart contracts are in `packages/foundry/` directory

### Network Configuration
- Supports Chiliz testnet (88882) and mainnet (88888)
- Avoid hardcoded localhost (31337) references in production code
- Use dynamic chain selection based on connected wallet

## Development Workflow Rules

### Commands
- Always run commands from the appropriate directory
- Use `cd packages/nextjs && yarn command` for Next.js operations
- Use `cd packages/foundry && make command` for smart contract operations

### File Editing
- Include 3-5 lines of context before and after when using replace_string_in_file
- Test changes after editing to ensure functionality
- Use TypeScript strict mode - fix all compilation errors

These rules apply to all GitHub Copilot agents working on this project.