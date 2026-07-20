// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FileRegistry
 * @notice Registers IPFS content identifiers (CIDs) on-chain along with a
 *         content hash, establishing a tamper-evident, verifiable record of
 *         file ownership and upload time.
 */
contract FileRegistry {
    struct FileRecord {
        address owner;
        bytes32 contentHash;
        uint256 timestamp;
        bool exists;
    }

    /// @dev cid (as string) => file record
    mapping(string => FileRecord) private files;

    event FileRegistered(string indexed cid, address indexed owner, bytes32 contentHash, uint256 timestamp);
    event OwnershipTransferred(string indexed cid, address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner(string calldata cid) {
        require(files[cid].exists, "FileRegistry: file not registered");
        require(files[cid].owner == msg.sender, "FileRegistry: caller is not the owner");
        _;
    }

    /**
     * @notice Registers a new file. Reverts if the CID is already registered.
     * @param cid IPFS content identifier
     * @param contentHash keccak256 hash of the raw file bytes, used for integrity checks
     */
    function registerFile(string calldata cid, bytes32 contentHash) external {
        require(!files[cid].exists, "FileRegistry: file already registered");

        files[cid] = FileRecord({
            owner: msg.sender,
            contentHash: contentHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit FileRegistered(cid, msg.sender, contentHash, block.timestamp);
    }

    /**
     * @notice Returns the stored record for a given CID.
     */
    function getFile(string calldata cid) external view returns (address owner, bytes32 contentHash, uint256 timestamp) {
        require(files[cid].exists, "FileRegistry: file not registered");
        FileRecord storage record = files[cid];
        return (record.owner, record.contentHash, record.timestamp);
    }

    /**
     * @notice Transfers ownership of a registered file to a new address.
     */
    function transferOwnership(string calldata cid, address newOwner) external onlyOwner(cid) {
        require(newOwner != address(0), "FileRegistry: invalid new owner");
        address previousOwner = files[cid].owner;
        files[cid].owner = newOwner;
        emit OwnershipTransferred(cid, previousOwner, newOwner);
    }

    /**
     * @notice Verifies that a given content hash matches the on-chain record,
     *         confirming file integrity without re-uploading the file.
     */
    function verifyIntegrity(string calldata cid, bytes32 contentHash) external view returns (bool) {
        require(files[cid].exists, "FileRegistry: file not registered");
        return files[cid].contentHash == contentHash;
    }
}
