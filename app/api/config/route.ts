export async function GET(){return Response.json({contractAddress:process.env.CONTRACT_ADDRESS||null,chainId:84532,chainName:"Base Sepolia",explorer:"https://sepolia.basescan.org"});}
