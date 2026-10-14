// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ArcUsdcVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint8 public constant TOKEN_DECIMALS = 6;
    IERC20Metadata public immutable token;
    mapping(address => uint256) public balances;
    uint256 public totalDeposited;

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token");
        require(tokenAddress.code.length > 0, "Token has no code");

        IERC20Metadata tokenContract = IERC20Metadata(tokenAddress);
        require(tokenContract.decimals() == TOKEN_DECIMALS, "Token must use 6 decimals");
        token = tokenContract;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount is zero");

        uint256 balanceBefore = token.balanceOf(address(this));
        IERC20(address(token)).safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = token.balanceOf(address(this)) - balanceBefore;
        require(received == amount, "Unexpected token amount");

        balances[msg.sender] += amount;
        totalDeposited += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount is zero");

        uint256 userBalance = balances[msg.sender];
        require(amount <= userBalance, "Insufficient deposited balance");

        balances[msg.sender] = userBalance - amount;
        totalDeposited -= amount;
        IERC20(address(token)).safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}
