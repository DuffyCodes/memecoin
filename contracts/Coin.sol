// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract Coin is
    ERC20Upgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    uint256 public constant INITIAL_SUPPLY = 1000 * 10 ** 18;
    mapping(address => uint256) public etherDeposits;
    uint256 public constant MAX_SUPPLY = 2000000 * 10 ** 18; // Maximum supply limit
    event TokensMinted(address indexed to, uint256 amount);
    event EtherWithdrawn(address indexed by, uint256 amount);

    function initialize(address ownerAddress) public initializer {
        __ERC20_init({COIN_NAME}, {COIN_CODE});
        __Ownable_init(ownerAddress);
        __ReentrancyGuard_init();
        __Pausable_init();

        _transferOwnership(ownerAddress);
        _mint(ownerAddress, INITIAL_SUPPLY);
    }

    /**
     * @dev Allows the owner to mint new tokens.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        require(to != address(0), "Mint to zero address");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Allows users to withdraw Ether sent to the contract. Optimized with batch storage reads and `nonReentrant`.
     * @param amount The amount of Ether to withdraw.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdraw amount must be greater than zero");
        uint256 contractBalance = address(this).balance;
        require(contractBalance >= amount, "Insufficient contract balance");

        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev Overrides the `renounceOwnership` function from Ownable to ensure security.
     */
    function renounceOwnership() public override onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Overrides the transfer function to include a pause mechanism. Optimized for minimal storage reads.
     * @param recipient The recipient of the tokens.
     * @param amount The amount of tokens to transfer.
     */
    function transfer(
        address recipient,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        require(recipient != address(0), "Transfer to zero address");
        return super.transfer(recipient, amount);
    }

    /**
     * @dev Pause the contract. Only callable by the owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract. Only callable by the owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    function depositEther() external payable {
        require(msg.value > 0, "No Ether sent");
        etherDeposits[msg.sender] += msg.value;
    }

    function withdrawEther(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Withdraw amount must be greater than zero");
        uint256 contractBalance = address(this).balance;
        require(contractBalance >= amount, "Insufficient contract balance");
        payable(msg.sender).transfer(amount);
        emit EtherWithdrawn(msg.sender, amount);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
