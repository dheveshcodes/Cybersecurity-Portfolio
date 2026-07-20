// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Verifier (Groth16)
 * @notice PLACEHOLDER / AUTO-GENERATED CONTRACT.
 *
 * This file is a stand-in for the real verifier contract, which MUST be
 * generated from your compiled circuit's proving key. Do NOT deploy this
 * placeholder as-is — the elliptic curve points below are not tied to a
 * real trusted setup.
 *
 * To generate the real contract after building the circuit (see
 * zkp/scripts/compile.sh), run from the zkp/ directory:
 *
 *   snarkjs zkey export solidityverifier build/ownership_final.zkey \
 *       ../contracts/contracts/Verifier.sol
 *
 * This overwrites this file with a contract exposing:
 *
 *   function verifyProof(
 *       uint[2] calldata _pA,
 *       uint[2][2] calldata _pB,
 *       uint[2] calldata _pC,
 *       uint[<n>] calldata _pubSignals
 *   ) public view returns (bool)
 *
 * OwnershipVerifier below wraps that generated verifier with a friendlier
 * interface once it has been generated. Keep this comment block after
 * regeneration by re-adding the OwnershipVerifier contract manually, or
 * deploy OwnershipVerifier as a separate file that imports the generated one.
 */
contract Groth16Verifier {
    // Auto-generated verifying key constants and verifyProof() implementation
    // will be inserted here by `snarkjs zkey export solidityverifier`.

    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) public pure returns (bool) {
        // Placeholder implementation — replace by regenerating this file.
        _pA; _pB; _pC; _pubSignals;
        revert("Verifier: contract not yet generated from circuit zkey");
    }
}

/**
 * @title OwnershipVerifier
 * @notice Thin wrapper that ties Groth16Verifier proof checks to the
 *         FileRegistry ownership commitments, so contracts and off-chain
 *         clients can call a single, stable entry point.
 */
contract OwnershipVerifier {
    Groth16Verifier public immutable verifier;

    event ProofVerified(address indexed prover, bool result);

    constructor(address verifierAddress) {
        verifier = Groth16Verifier(verifierAddress);
    }

    /**
     * @notice Verifies a zk-SNARK ownership proof and emits the result.
     * @param a Groth16 proof component A
     * @param b Groth16 proof component B
     * @param c Groth16 proof component C
     * @param publicSignals Public inputs, e.g. [commitment]
     */
    function verifyOwnership(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata publicSignals
    ) external returns (bool) {
        bool result = verifier.verifyProof(a, b, c, publicSignals);
        emit ProofVerified(msg.sender, result);
        return result;
    }
}
