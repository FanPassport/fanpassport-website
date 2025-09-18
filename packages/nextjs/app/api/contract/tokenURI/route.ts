import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Define chain configurations
const supportedChains = {
  31337: {
    id: 31337,
    name: "Localhost 8545",
    nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
    rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
  },
  88882: {
    id: 88882,
    name: "Chiliz Spicy Testnet",
    nativeCurrency: { decimals: 18, name: "CHZ", symbol: "CHZ" },
    rpcUrls: { default: { http: ["https://spicy-rpc.chiliz.com"] } },
  },
  88888: {
    id: 88888,
    name: "Chiliz Chain",
    nativeCurrency: { decimals: 18, name: "CHZ", symbol: "CHZ" },
    rpcUrls: { default: { http: ["https://rpc.ankr.com/chiliz"] } },
  },
};

// POST /api/contract/tokenURI - Get the tokenURI for a specific NFT
export async function POST(request: NextRequest) {
  let body: any = undefined;
  try {
    body = await request.json();
    const { tokenId, contractName = "ExperienceNFT", chainId } = body;

    if (!tokenId) {
      console.error("❌ Token ID is required");
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    console.log(`🔍 Getting tokenURI for token ID: ${tokenId} from contract: ${contractName}`);

    // Get the contract address and ABI based on contractName
    const resolvedChainId: number = Number(chainId ?? process.env.NEXT_PUBLIC_CHAIN_ID ?? localhost.id);
    console.log(`🔎 Resolved chainId: ${resolvedChainId} (requested=${chainId})`);

    const contracts = (deployedContracts as any)[resolvedChainId];
    if (!contracts || !contracts[contractName as keyof typeof contracts]) {
      console.error(`❌ Contract ${contractName} not found for chain ${resolvedChainId}`);
      return NextResponse.json(
        { error: `Contract ${contractName} not found for chain ${resolvedChainId}` },
        { status: 400 },
      );
    }

    // Get the correct chain configuration
    const targetChain = supportedChains[resolvedChainId as keyof typeof supportedChains];
    if (!targetChain) {
      console.error(`❌ Chain ${resolvedChainId} not supported`);
      return NextResponse.json({ error: `Chain ${resolvedChainId} not supported` }, { status: 400 });
    }

    // Create a public client for the specific chain
    const publicClient = createPublicClient({
      chain: targetChain as any,
      transport: http(targetChain.rpcUrls.default.http[0]),
    });

    const contractAddress = contracts[contractName as keyof typeof contracts].address;
    const contractAbi = contracts[contractName as keyof typeof contracts].abi;

    console.log(`📋 Contract ${contractName} address (chain ${resolvedChainId}): ${contractAddress}`);
    console.log(`🔗 Using RPC endpoint: ${targetChain.rpcUrls.default.http[0]}`);

    // Call the tokenURI function on the smart contract
    const tokenURI = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    console.log(`✅ TokenURI for token ${tokenId}: ${tokenURI}`);

    return NextResponse.json({
      tokenId: parseInt(tokenId),
      tokenURI: tokenURI as string,
    });
  } catch (error: any) {
    console.error("❌ Error getting tokenURI:", error);

    // Handle specific contract errors
    if (error?.message?.includes("Token does not exist") || error?.shortMessage?.includes("0x7e273289")) {
      return NextResponse.json({ error: "Token does not exist" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to get tokenURI",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
