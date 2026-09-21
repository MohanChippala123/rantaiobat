import { isAddress } from "viem";
import { contractAbi } from "../../../../lib/contract";
import { chainClient, chainConfig } from "../../../../lib/server-chain";

export async function GET(request: Request) {
  try {
    const recipient = new URL(request.url).searchParams.get("recipient");
    if (!recipient || !isAddress(recipient)) {
      return Response.json({ error: "A valid recipient wallet is required" }, { status: 400 });
    }

    const client = chainClient();
    const { address } = chainConfig();
    const nextId = await client.readContract({ address, abi: contractAbi, functionName: "nextTransferId" });
    const ids = Array.from({ length: Number(nextId - 1n) }, (_, index) => BigInt(index + 1));
    const transfers = await Promise.all(ids.map(async (id) => {
      const value = await client.readContract({ address, abi: contractAbi, functionName: "pendingTransfers", args: [id] });
      if (value[0] === 0n || value[3].toLowerCase() !== recipient.toLowerCase()) return null;
      return {
        id: value[0].toString(),
        batchId: value[1].toString(),
        fromAddress: value[2],
        toAddress: value[3],
        timestamp: Number(value[4]),
        evidenceHash: value[5],
      };
    }));
    return Response.json({ transfers: transfers.filter(Boolean) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to read incoming transfers" }, { status: 503 });
  }
}
