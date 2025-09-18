import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { rainbowkitBurnerWallet } from "burner-connector";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

const { onlyLocalBurnerWallet, targetNetworks } = scaffoldConfig;

const wallets = [
  // Socios shortcut: uses WalletConnect under the hood but shows as "Socios"
  // This helps users who don't realize Socios uses WalletConnect.
  (options: any) => {
    const wc = walletConnectWallet(options as any);
    return {
      ...wc,
      id: "socios",
      name: "Socios",
      // Use attached Socios image so brand is recognizable.
      // Use PNG for maximum compatibility and fall back to ICO if needed.
      iconUrl: "/socios-wallet.png",
    } as any;
  },
  metaMaskWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  rainbowWallet,
  safeWallet,
  ...(!targetNetworks.some(network => network.id !== (chains.hardhat as chains.Chain).id) || !onlyLocalBurnerWallet
    ? [rainbowkitBurnerWallet]
    : []),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],

  {
    appName: "FAN Passport",
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
