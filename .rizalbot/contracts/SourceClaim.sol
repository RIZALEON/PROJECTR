// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SourceClaim — one living being owns their ghostchain
/// @notice Ghostchain is established from biostats. Raw biometrics NEVER on-chain — only proof hashes.
/// @dev Citation + monetization + value for every contribution accrue to bio. ЯKRYPTOCODE · NonNuclear.
contract SourceClaim {
    address public minter;

    /// kind: 0 claim, 1 cite, 2 ping, 3 pong, 4 transfer, 5 settle, 6 attest, 7 relink, 8 establish, 9 evolve
    event Claimed(
        bytes32 indexed traceId,
        address indexed bio,
        bytes32 device,
        bytes32 source,
        bytes32 origin,
        bytes32 biostatsRoot,
        string ref,
        uint8 kind
    );

    event Established(
        address indexed bio,
        bytes32 biostatsRoot,
        string ref
    );

    event Relinked(
        address indexed bio,
        bytes32 oldDevice,
        bytes32 newDevice,
        bytes32 biostatsProof,
        string ref
    );

    error NotMinter();

    constructor(address minter_) {
        require(minter_ != address(0), "minter");
        minter = minter_;
    }

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotMinter();
        _;
    }

    function setMinter(address next) external onlyMinter {
        minter = next;
    }

    function establish(address bio, bytes32 biostatsRoot, string calldata ref)
        external
        onlyMinter
    {
        require(bio != address(0), "bio");
        emit Established(bio, biostatsRoot, ref);
        emit Claimed(biostatsRoot, bio, bytes32(0), biostatsRoot, bytes32(0), biostatsRoot, ref, 8);
    }

    function emitEvent(
        bytes32 traceId,
        address bio,
        bytes32 device,
        bytes32 source,
        bytes32 origin,
        bytes32 biostatsRoot,
        string calldata ref,
        uint8 kind
    ) external onlyMinter {
        require(bio != address(0), "bio");
        emit Claimed(traceId, bio, device, source, origin, biostatsRoot, ref, kind);
    }

    /// @notice Function 0 — Decider-gated evolve/gain recorded on the ghost chain.
    function evolve(
        bytes32 traceId,
        address bio,
        bytes32 device,
        bytes32 source,
        bytes32 biostatsRoot,
        string calldata ref
    ) external onlyMinter {
        require(bio != address(0), "bio");
        emit Claimed(traceId, bio, device, source, bytes32(0), biostatsRoot, ref, 9);
    }

    function relink(
        address bio,
        bytes32 oldDevice,
        bytes32 newDevice,
        bytes32 biostatsProof,
        string calldata ref
    ) external onlyMinter {
        require(bio != address(0), "bio");
        emit Relinked(bio, oldDevice, newDevice, biostatsProof, ref);
        emit Claimed(biostatsProof, bio, newDevice, biostatsProof, bytes32(0), biostatsProof, ref, 7);
    }
}
