const fs = require("node:fs");
const path = require("node:path");
const { Wallet } = require("ethers");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  throw new Error("contracts/.env already exists; refusing to replace the deployer key");
}

const wallet = Wallet.createRandom();
const contents = [
  "BASE_SEPOLIA_RPC_URL=https://sepolia.base.org",
  `DEPLOYER_PRIVATE_KEY=${wallet.privateKey}`,
  `REGULATOR_ADDRESS=${wallet.address}`,
  "",
].join("\n");

fs.writeFileSync(envPath, contents, { encoding: "utf8", mode: 0o600, flag: "wx" });
console.log(JSON.stringify({ address: wallet.address, network: "Base Sepolia", envFile: "contracts/.env" }));
