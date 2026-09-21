// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RantaiObat {
    enum Status { Active, Flagged, Recalled }

    struct Batch {
        uint256 id;
        string drugName;
        string batchCode;
        address manufacturer;
        uint64 productionDate;
        uint64 expiryDate;
        address currentHolder;
        Status status;
        bool dispensed;
        bool exists;
    }

    struct Transfer {
        uint256 id;
        uint256 batchId;
        address fromAddress;
        address toAddress;
        uint64 timestamp;
        bytes32 evidenceHash;
        bool fromSigned;
        bool toSigned;
    }

    address public immutable regulator;
    uint256 public nextBatchId = 1;
    uint256 public nextTransferId = 1;

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Transfer) public pendingTransfers;
    mapping(uint256 => uint256) public pendingTransferForBatch;
    mapping(uint256 => Transfer[]) private transferHistory;
    mapping(address => uint256[]) private manufacturedBatchIds;

    event BatchRegistered(uint256 indexed batchId, string batchCode, address indexed manufacturer);
    event TransferInitiated(uint256 indexed transferId, uint256 indexed batchId, address indexed fromAddress, address toAddress, bytes32 evidenceHash);
    event TransferAccepted(uint256 indexed transferId, uint256 indexed batchId, address indexed fromAddress, address toAddress);
    event BatchFlagged(uint256 indexed batchId, address indexed actor, string reason);
    event BatchRecalled(uint256 indexed batchId, address indexed actor, string reason);
    event BatchDispensed(uint256 indexed batchId, address indexed pharmacy);

    error NotRegulator();
    error BatchNotFound();
    error NotCurrentHolder();
    error NotRecipient();
    error TransferNotFound();
    error TransferAlreadyPending();
    error BatchNotTransferable();
    error InvalidDates();
    error InvalidRecipient();
    error UnauthorizedRecall();

    constructor(address regulator_) {
        if (regulator_ == address(0)) revert InvalidRecipient();
        regulator = regulator_;
    }

    function registerBatch(
        string calldata drugName,
        string calldata batchCode,
        uint64 productionDate,
        uint64 expiryDate
    ) external returns (uint256 batchId) {
        if (productionDate >= expiryDate) revert InvalidDates();
        batchId = nextBatchId++;
        batches[batchId] = Batch({
            id: batchId,
            drugName: drugName,
            batchCode: batchCode,
            manufacturer: msg.sender,
            productionDate: productionDate,
            expiryDate: expiryDate,
            currentHolder: msg.sender,
            status: Status.Active,
            dispensed: false,
            exists: true
        });
        manufacturedBatchIds[msg.sender].push(batchId);
        emit BatchRegistered(batchId, batchCode, msg.sender);
    }

    function initiateTransfer(uint256 batchId, address toAddress, bytes32 evidenceHash) external returns (uint256 transferId) {
        Batch storage batch = batches[batchId];
        if (!batch.exists) revert BatchNotFound();
        if (msg.sender != batch.currentHolder) revert NotCurrentHolder();
        if (toAddress == address(0) || toAddress == msg.sender) revert InvalidRecipient();
        if (batch.status != Status.Active || batch.dispensed) revert BatchNotTransferable();
        if (pendingTransferForBatch[batchId] != 0) revert TransferAlreadyPending();

        transferId = nextTransferId++;
        pendingTransfers[transferId] = Transfer({
            id: transferId,
            batchId: batchId,
            fromAddress: msg.sender,
            toAddress: toAddress,
            timestamp: uint64(block.timestamp),
            evidenceHash: evidenceHash,
            fromSigned: true,
            toSigned: false
        });
        pendingTransferForBatch[batchId] = transferId;
        emit TransferInitiated(transferId, batchId, msg.sender, toAddress, evidenceHash);
    }

    function acceptTransfer(uint256 transferId) external {
        Transfer storage pending = pendingTransfers[transferId];
        if (pending.id == 0) revert TransferNotFound();
        if (msg.sender != pending.toAddress) revert NotRecipient();

        Batch storage batch = batches[pending.batchId];
        if (batch.currentHolder != pending.fromAddress) revert NotCurrentHolder();
        pending.toSigned = true;
        batch.currentHolder = pending.toAddress;
        transferHistory[pending.batchId].push(pending);
        pendingTransferForBatch[pending.batchId] = 0;

        emit TransferAccepted(transferId, pending.batchId, pending.fromAddress, pending.toAddress);
        delete pendingTransfers[transferId];
    }

    function flagBatch(uint256 batchId, string calldata reason) external {
        if (msg.sender != regulator) revert NotRegulator();
        Batch storage batch = batches[batchId];
        if (!batch.exists) revert BatchNotFound();
        batch.status = Status.Flagged;
        emit BatchFlagged(batchId, msg.sender, reason);
    }

    function recallBatch(uint256 batchId, string calldata reason) external {
        Batch storage batch = batches[batchId];
        if (!batch.exists) revert BatchNotFound();
        if (msg.sender != regulator && msg.sender != batch.manufacturer) revert UnauthorizedRecall();
        batch.status = Status.Recalled;
        emit BatchRecalled(batchId, msg.sender, reason);
    }

    function markDispensed(uint256 batchId) external {
        Batch storage batch = batches[batchId];
        if (!batch.exists) revert BatchNotFound();
        if (msg.sender != batch.currentHolder) revert NotCurrentHolder();
        if (batch.status != Status.Active || batch.dispensed) revert BatchNotTransferable();
        batch.dispensed = true;
        emit BatchDispensed(batchId, msg.sender);
    }

    function getTransferHistory(uint256 batchId) external view returns (Transfer[] memory) {
        if (!batches[batchId].exists) revert BatchNotFound();
        return transferHistory[batchId];
    }

    function getManufacturedBatches(address manufacturer) external view returns (uint256[] memory) {
        return manufacturedBatchIds[manufacturer];
    }
}
