// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EssenceTrace — earliest-style mint/transfer/settle with E2E logs
/// @notice Indexed events rebuild full provenance by traceId (ERC-20 Transfer ancestor).
/// @dev Optional on-chain twin of offline Я/gut/essence/ledger.jsonl. NonNuclear.
contract EssenceTrace {
    string public constant NAME = "Essence";
    string public constant SYMBOL = "ESS";
    uint8 public constant DECIMALS = 18;

    address public minter;
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 indexed traceId,
        string ref,
        uint8 kind // 0 mint, 1 transfer, 2 settle, 3 burn
    );

    event MinterUpdated(address indexed previous, address indexed next);

    error NotMinter();
    error BadAmount();
    error BadTo();
    error Insufficient();

    constructor(address minter_) {
        require(minter_ != address(0), "minter");
        minter = minter_;
    }

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotMinter();
        _;
    }

    function setMinter(address next) external onlyMinter {
        emit MinterUpdated(minter, next);
        minter = next;
    }

    /// @notice Create essence. from = address(0). kind = 0.
    function mint(address to, uint256 amount, bytes32 traceId, string calldata ref)
        external
        onlyMinter
    {
        if (to == address(0)) revert BadTo();
        if (amount == 0) revert BadAmount();
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount, traceId, ref, 0);
    }

    /// @notice Move custody. kind = 1. Anyone with balance (or minter on behalf via offline mirror).
    function transfer(address to, uint256 amount, bytes32 traceId, string calldata ref)
        external
    {
        if (to == address(0)) revert BadTo();
        if (amount == 0) revert BadAmount();
        uint256 bal = balanceOf[msg.sender];
        if (bal < amount) revert Insufficient();
        unchecked {
            balanceOf[msg.sender] = bal - amount;
            balanceOf[to] += amount;
        }
        emit Transfer(msg.sender, to, amount, traceId, ref, 1);
    }

    /// @notice Close a lineage (paid / redeemed / consumed). No balance change. kind = 2.
    function settle(bytes32 traceId, string calldata ref) external {
        emit Transfer(msg.sender, msg.sender, 0, traceId, ref, 2);
    }

    /// @notice Destroy units. kind = 3.
    function burn(uint256 amount, bytes32 traceId, string calldata ref) external {
        if (amount == 0) revert BadAmount();
        uint256 bal = balanceOf[msg.sender];
        if (bal < amount) revert Insufficient();
        unchecked {
            balanceOf[msg.sender] = bal - amount;
            totalSupply -= amount;
        }
        emit Transfer(msg.sender, address(0), amount, traceId, ref, 3);
    }
}
