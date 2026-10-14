const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArcUsdcVault", function () {
  let token;
  let vault;
  let user;
  let other;

  beforeEach(async function () {
    [, user, other] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    token = await MockUSDT.deploy();
    const Vault = await ethers.getContractFactory("ArcUsdcVault");
    vault = await Vault.deploy(token.address);
    await token.mint(user.address, ethers.utils.parseUnits("100", 6));
    await token.connect(user).approve(vault.address, ethers.constants.MaxUint256);
  });

  it("accepts USDC and tracks the depositor's balance", async function () {
    const amount = ethers.utils.parseUnits("25", 6);
    await expect(vault.connect(user).deposit(amount))
      .to.emit(vault, "Deposited")
      .withArgs(user.address, amount);

    expect(await vault.balances(user.address)).to.equal(amount);
    expect(await vault.totalDeposited()).to.equal(amount);
    expect(await token.balanceOf(vault.address)).to.equal(amount);
  });

  it("allows only the depositor to withdraw their balance", async function () {
    const amount = ethers.utils.parseUnits("25", 6);
    await vault.connect(user).deposit(amount);

    await expect(vault.connect(other).withdraw(1)).to.be.revertedWith("Insufficient deposited balance");
    await expect(vault.connect(user).withdraw(amount))
      .to.emit(vault, "Withdrawn")
      .withArgs(user.address, amount);

    expect(await vault.balances(user.address)).to.equal(0);
    expect(await vault.totalDeposited()).to.equal(0);
    expect(await token.balanceOf(user.address)).to.equal(ethers.utils.parseUnits("100", 6));
  });

  it("rejects zero deposits and withdrawals", async function () {
    await expect(vault.connect(user).deposit(0)).to.be.revertedWith("Amount is zero");
    await expect(vault.connect(user).withdraw(0)).to.be.revertedWith("Amount is zero");
  });

  it("rejects deployment with an address that is not a 6-decimal token", async function () {
    const MockKAI = await ethers.getContractFactory("MockKAI");
    const tokenWith18Decimals = await MockKAI.deploy();
    const Vault = await ethers.getContractFactory("ArcUsdcVault");

    await expect(Vault.deploy(tokenWith18Decimals.address))
      .to.be.revertedWith("Token must use 6 decimals");
  });
});
