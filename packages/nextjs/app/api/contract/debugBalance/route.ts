import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

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

    const contractAddress = contracts[contractName as keyof typeof contracts].address;
    const contractAbi = contracts[contractName as keyof typeof contracts].abi;
    console.log(`📋 Contract ${contractName} address (chain ${resolvedChainId}): ${contractAddress}`);

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
