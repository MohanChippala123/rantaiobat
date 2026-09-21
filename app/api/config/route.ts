import { env } from "cloudflare:workers";
export async function GET(){return Response.json({contractAddress:env.CONTRACT_ADDRESS||null,chainId:84532,chainName:"Base Sepolia",explorer:"https://sepolia.basescan.org"});}
