import { readBatch } from "../../../../lib/server-chain";
export async function GET(_r:Request,c:{params:Promise<{id:string}>}){try{const {id}=await c.params;const batch=await readBatch(BigInt(id));return batch?Response.json({batch}):Response.json({error:"Batch not found"},{status:404});}catch(e){return Response.json({error:e instanceof Error?e.message:"Unable to read batch"},{status:400});}}
