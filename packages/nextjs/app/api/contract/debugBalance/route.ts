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

// POST /api/contract/debugBalance - Debug endpoint to return resolved chain, contract, and balanceOf for an owner
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { owner, contractName = "MatchNFT", chainId } = body;

    if (!owner) {
      return NextResponse.json({ error: "owner is required" }, { status: 400 });
    }

    const resolvedChainId: number = Number(chainId ?? process.env.NEXT_PUBLIC_CHAIN_ID ?? localhost.id);
    console.log(`🔎 debugBalance resolved chainId: ${resolvedChainId} (requested=${chainId})`);

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

    const balance = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "balanceOf",
      args: [owner as `0x${string}`],
    });

    console.log(`✅ balanceOf(${owner}) = ${balance}`);

    return NextResponse.json({ owner, contractName, resolvedChainId, contractAddress, balance: Number(balance) });
  } catch (error: any) {
    console.error("❌ debugBalance error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
