import * as chains from "viem/chains";

export type BaseConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export type ScaffoldConfig = BaseConfig;

export const DEFAULT_ALCHEMY_API_KEY = "YOUR_ALCHEMY_API_KEY_HERE";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [
    {
      id: 88882,
      name: "Chiliz Spicy Testnet",
      nativeCurrency: {
        decimals: 18,
        name: "CHZ",
        symbol: "CHZ",
      },
      rpcUrls: {
        default: {
          http: ["https://spicy-rpc.chiliz.com"],
        },
        public: {
          http: ["https://spicy-rpc.chiliz.com"],
        },
      },
      blockExplorers: {
        default: {
          name: "Chiliz Explorer",
          url: "https://scan.chiliz.com",
        },
      },
    } as chains.Chain,
    {
      id: 31337,
      name: "Localhost 8545",
      nativeCurrency: {
        decimals: 18,
        name: "ETH",
        symbol: "ETH",
      },
      rpcUrls: {
        default: {
          http: ["http://127.0.0.1:8545"],
        },
        public: {
          http: ["http://127.0.0.1:8545"],
        },
      },
      blockExplorers: {
        default: {
          name: "Local Explorer",
          url: "http://localhost:3000/blockexplorer",
        },
      },
    } as chains.Chain,
    {
      id: 88888,
      name: "Chiliz Chain",
      nativeCurrency: {
        decimals: 18,
        name: "CHZ",
        symbol: "CHZ",
      },
      rpcUrls: {
        default: {
          http: ["https://rpc.ankr.com/chiliz"],
        },
        public: {
          http: ["https://rpc.ankr.com/chiliz"],
        },
      },
      blockExplorers: {
        default: {
          name: "Chiliz Explorer",
          url: "https://scan.chiliz.com",
        },
      },
    } as chains.Chain,
  ],
  // The interval at which your front-end polls the RPC servers for new data (it has no effect if you only target the local network (default is 4000))
  pollingInterval: 5000,
  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    // Example:
    // [chains.mainnet.id]: "https://mainnet.buidlguidl.com",
  },
  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
