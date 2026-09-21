# RantaiObat — 10-minute pitch and live demo

## 0:00–1:15 — Open with the buyer's moment

"A medicine box can look legitimate while its custody story is impossible to prove. In 2025, BPOM tested 58,798 drug and food samples and found 19.2% did not meet requirements. It revoked 1,183 permits and recommended takedown of 197,725 illegal or non-compliant sales links. This is not a packaging problem alone. It is a trust problem between organizations."

Show the public verifier. "RantaiObat gives every batch one public, tamper-evident custody chain. A buyer, pharmacist, or regulator can scan first and trust second."

## 1:15–2:30 — Explain the trust mechanism

Show the architecture diagram. "The blockchain is the source of truth. Our database is only an anomaly cache. A holder cannot invent a completed delivery. The sender signs `initiateTransfer`; custody stays unchanged. Only the intended recipient can sign `acceptTransfer`, and only then does the contract update the holder and append immutable history."

## 2:30–4:00 — Register a real batch

1. Open **Custody portal** with the manufacturer wallet.
2. Register `Amoxicillin 500mg`, code `AMX-260920-A`, with valid dates.
3. Approve the Base Sepolia transaction.
4. Open BaseScan and show `BatchRegistered`.

"This batch exists because this wallet submitted a real transaction—not because we loaded a fixture."

## 4:00–5:45 — Prove the two signatures

1. Manufacturer initiates a distributor handoff with a manifest reference.
2. Show that `currentHolder` remains the manufacturer.
3. Switch to the distributor wallet and co-sign acceptance.
4. Show that `currentHolder` is now the distributor.

"The first signature proposes custody. The second completes it. Neither organization can fabricate the other party's participation."

## 5:45–7:15 — Public verification

Return to **Verify medicine**, scan the QR or enter the ID, and show metadata, expiry, state, ordered timeline, and the contract link.

"No account is needed. Every timeline entry is reconstructed from contract state."

## 7:15–8:45 — Proof moment: reject a fork

1. Use a third wallet that is not the current holder.
2. Attempt `initiateTransfer` for the same batch and approve it.
3. Show the failed BaseScan receipt.
4. Refresh the verifier.

"The contract rejects this because the sender is not `currentHolder`. Our backend verifies the mined revert, exact contract, decoded function and batch, plus the holder in the previous block. Only then does it display ‘Counterfeiting attempt detected.’"

## 8:45–9:30 — Why this is credible

"We deliberately built a smaller real system. Contract tests prove the happy path, wrong-recipient rejection, and fork rejection. If the chain or cache is unavailable, the app says so. If no public address is configured, it says deployment is pending."

Note that BPOM's Codrela/Trivam brand notice was published in June 2026; do not describe it as a 2025 announcement.

## 9:30–10:00 — Close

"RantaiObat turns a supply-chain claim into mutual signatures. Manufacturers cannot invent receipt, distributors cannot rewrite origin, and the public does not have to trust our database. Scan the box, inspect the chain, and decide with evidence."

## Demo checklist

- Fund demo wallets with Base Sepolia ETH.
- Set the contract address and deployment block in the hosted environment.
- Create the batch through the live contract, not a database fixture.
- Keep BaseScan tabs open for registration, acceptance, and the failed fork.
- Prepare a QR containing `{\"batchId\":\"<id>\"}`.
- Record a backup only after the same live flow succeeds.
- Never expose the deployer private key.
