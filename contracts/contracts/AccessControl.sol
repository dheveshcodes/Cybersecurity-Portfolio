// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FileRegistry.sol";

/**
 * @title AccessControl
 * @notice Manages fine-grained, per-file permission grants on top of
 *         FileRegistry ownership records. Only a file's registered owner
 *         may grant or revoke access to other addresses.
 */
contract AccessControl {
    FileRegistry public immutable fileRegistry;

    /// @dev cid => grantee address => allowed
    mapping(string => mapping(address => bool)) private permissions;

    event AccessGranted(string indexed cid, address indexed owner, address indexed grantee);
    event AccessRevoked(string indexed cid, address indexed owner, address indexed grantee);

    constructor(address fileRegistryAddress) {
        fileRegistry = FileRegistry(fileRegistryAddress);
    }

    modifier onlyFileOwner(string calldata cid) {
        (address owner, , ) = fileRegistry.getFile(cid);
        require(owner == msg.sender, "AccessControl: caller is not the file owner");
        _;
    }

    /**
     * @notice Grants a wallet address permission to access a file.
     */
    function grantAccess(string calldata cid, address grantee) external onlyFileOwner(cid) {
        require(grantee != address(0), "AccessControl: invalid grantee");
        permissions[cid][grantee] = true;
        emit AccessGranted(cid, msg.sender, grantee);
    }

    /**
     * @notice Revokes a previously granted permission.
     */
    function revokeAccess(string calldata cid, address grantee) external onlyFileOwner(cid) {
        permissions[cid][grantee] = false;
        emit AccessRevoked(cid, msg.sender, grantee);
    }

    /**
     * @notice Checks whether an address currently holds access to a file
     *         (owners are implicitly considered to have access).
     */
    function checkAccess(string calldata cid, address account) external view returns (bool) {
        (address owner, , ) = fileRegistry.getFile(cid);
        if (owner == account) return true;
        return permissions[cid][account];
    }
}
