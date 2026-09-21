import { defineChain, parseAbi } from "viem";
export const baseSepolia = defineChain({ id: 84532, name: "Base Sepolia", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: ["https://sepolia.base.org"] } }, blockExplorers: { default: { name: "BaseScan", url: "https://sepolia.basescan.org" } }, testnet: true });
export const contractAbi = parseAbi([
  "function nextBatchId() view returns (uint256)",
  "function nextTransferId() view returns (uint256)",
  "function batches(uint256) view returns (uint256 id,string drugName,string batchCode,address manufacturer,uint64 productionDate,uint64 expiryDate,address currentHolder,uint8 status,bool dispensed,bool exists)",
  "function pendingTransfers(uint256) view returns (uint256 id,uint256 batchId,address fromAddress,address toAddress,uint64 timestamp,bytes32 evidenceHash,bool fromSigned,bool toSigned)",
  "function pendingTransferForBatch(uint256) view returns (uint256)",
  "function getTransferHistory(uint256) view returns ((uint256 id,uint256 batchId,address fromAddress,address toAddress,uint64 timestamp,bytes32 evidenceHash,bool fromSigned,bool toSigned)[])",
  "function getManufacturedBatches(address) view returns (uint256[])",
  "function registerBatch(string drugName,string batchCode,uint64 productionDate,uint64 expiryDate) returns (uint256)",
  "function initiateTransfer(uint256 batchId,address toAddress,bytes32 evidenceHash) returns (uint256)",
  "function acceptTransfer(uint256 transferId)", "function markDispensed(uint256 batchId)", "function recallBatch(uint256 batchId,string reason)",
  "event BatchRegistered(uint256 indexed batchId,string batchCode,address indexed manufacturer)",
  "event TransferInitiated(uint256 indexed transferId,uint256 indexed batchId,address indexed fromAddress,address toAddress,bytes32 evidenceHash)",
  "event TransferAccepted(uint256 indexed transferId,uint256 indexed batchId,address indexed fromAddress,address toAddress)",
  "event BatchFlagged(uint256 indexed batchId,address indexed actor,string reason)", "event BatchRecalled(uint256 indexed batchId,address indexed actor,string reason)", "event BatchDispensed(uint256 indexed batchId,address indexed pharmacy)"
]);
export const statusLabel = ["Active", "Flagged", "Recalled"] as const;
export type BatchView = { id:string; drugName:string; batchCode:string; manufacturer:string; productionDate:number; expiryDate:number; currentHolder:string; status:"Active"|"Flagged"|"Recalled"; dispensed:boolean };
