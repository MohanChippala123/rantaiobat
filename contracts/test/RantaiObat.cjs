const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RantaiObat", function () {
  async function deploy() {
    const [manufacturer, distributor, pharmacy, attacker, regulator] = await ethers.getSigners();
    const registry = await ethers.deployContract("RantaiObat", [regulator.address]);
    return { registry, manufacturer, distributor, pharmacy, attacker, regulator };
  }

  it("completes register -> initiate -> accept with two distinct signatures", async function () {
    const { registry, manufacturer, distributor } = await deploy();
    await registry.connect(manufacturer).registerBatch("Amoxicillin 500mg", "AMX-240901", 1725148800, 1819756800);
    const evidence = ethers.keccak256(ethers.toUtf8Bytes("manifest://AMX-240901-001"));
    await expect(registry.connect(manufacturer).initiateTransfer(1, distributor.address, evidence))
      .to.emit(registry, "TransferInitiated");
    expect((await registry.batches(1)).currentHolder).to.equal(manufacturer.address);
    await expect(registry.connect(distributor).acceptTransfer(1)).to.emit(registry, "TransferAccepted");
    expect((await registry.batches(1)).currentHolder).to.equal(distributor.address);
    expect((await registry.getTransferHistory(1)).length).to.equal(1);
  });

  it("rejects a fork attempt from any address that is not the current holder", async function () {
    const { registry, manufacturer, distributor, attacker } = await deploy();
    await registry.connect(manufacturer).registerBatch("Paracetamol 500mg", "PCM-240902", 1725235200, 1819843200);
    await registry.connect(manufacturer).initiateTransfer(1, distributor.address, ethers.ZeroHash);
    await registry.connect(distributor).acceptTransfer(1);
    await expect(registry.connect(attacker).initiateTransfer(1, manufacturer.address, ethers.ZeroHash))
      .to.be.revertedWithCustomError(registry, "NotCurrentHolder");
  });

  it("permits only the intended recipient to accept", async function () {
    const { registry, manufacturer, distributor, attacker } = await deploy();
    await registry.connect(manufacturer).registerBatch("Cetirizine 10mg", "CTZ-240903", 1725321600, 1819929600);
    await registry.connect(manufacturer).initiateTransfer(1, distributor.address, ethers.ZeroHash);
    await expect(registry.connect(attacker).acceptTransfer(1)).to.be.revertedWithCustomError(registry, "NotRecipient");
  });
});
