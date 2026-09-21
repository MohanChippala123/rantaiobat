const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const regulator = process.env.REGULATOR_ADDRESS || deployer.address;
  const contract = await hre.ethers.deployContract("RantaiObat", [regulator]);
  await contract.waitForDeployment();
  console.log(JSON.stringify({ contractAddress: await contract.getAddress(), regulator, network: hre.network.name }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
