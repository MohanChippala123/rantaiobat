const hre = require("hardhat");

async function main() {
  if (!process.env.CONTRACT_ADDRESS) throw new Error("CONTRACT_ADDRESS is required");

  const [manufacturer] = await hre.ethers.getSigners();
  const distributor = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  const pharmacy = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  const contract = await hre.ethers.getContractAt("RantaiObat", process.env.CONTRACT_ADDRESS);

  for (const recipient of [distributor, pharmacy]) {
    await (await manufacturer.sendTransaction({ to: recipient.address, value: hre.ethers.parseEther("0.0002") })).wait();
  }

  const now = Math.floor(Date.now() / 1000);
  await (await contract.connect(manufacturer).registerBatch(
    "Amoxicillin 500mg",
    "AMX-260920-A",
    now - 7 * 24 * 60 * 60,
    now + 730 * 24 * 60 * 60,
  )).wait();
  await (await contract.connect(manufacturer).initiateTransfer(
    1,
    distributor.address,
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BPOM-MANIFEST-AMX-001")),
  )).wait();
  await (await contract.connect(distributor).acceptTransfer(1)).wait();
  await (await contract.connect(distributor).initiateTransfer(
    1,
    pharmacy.address,
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("DELIVERY-AMX-002")),
  )).wait();
  await (await contract.connect(pharmacy).acceptTransfer(2)).wait();

  console.log(JSON.stringify({
    batchId: "1",
    manufacturer: manufacturer.address,
    distributor: distributor.address,
    pharmacy: pharmacy.address,
    contractAddress: process.env.CONTRACT_ADDRESS,
  }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
