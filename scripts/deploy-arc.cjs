const fs = require("fs");
const { ethers, network } = require("hardhat");
const ARC_MAINNET = require("../config/arc-mainnet.json");

async function main() {
  const { ARC_RPC_URL, PRIVATE_KEY, ARC_USDC_ADDRESS } = process.env;
  if (!ARC_RPC_URL) throw new Error("ARC_RPC_URL is required.");
  if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
    throw new Error("PRIVATE_KEY must be a 32-byte 0x-prefixed private key.");
  }
  if (!ARC_USDC_ADDRESS || !ethers.utils.isAddress(ARC_USDC_ADDRESS)) {
    throw new Error("ARC_USDC_ADDRESS must be a valid Arc USDC address.");
  }
  if (ethers.utils.getAddress(ARC_USDC_ADDRESS) !== ethers.utils.getAddress(ARC_MAINNET.usdc.address)) {
    throw new Error(`ARC_USDC_ADDRESS must match the official Arc USDC interface ${ARC_MAINNET.usdc.address}.`);
  }
  if (network.name !== "arcMainnet") {
    throw new Error(`Refusing deployment on ${network.name}; use --network arcMainnet.`);
  }

  const [deployer] = await ethers.getSigners();
  const chain = await deployer.provider.getNetwork();
  if (chain.chainId !== ARC_MAINNET.chainId) {
    throw new Error(`Refusing deployment: expected Arc chain ${ARC_MAINNET.chainId}, got ${chain.chainId}.`);
  }

  const tokenCode = await deployer.provider.getCode(ARC_USDC_ADDRESS);
  if (tokenCode === "0x") {
    throw new Error("The configured USDC address has no contract code on the selected network.");
  }
  const token = new ethers.Contract(
    ARC_USDC_ADDRESS,
    ["function decimals() view returns (uint8)"],
    deployer,
  );
  const decimals = await token.decimals();
  if (decimals !== ARC_MAINNET.usdc.decimals) {
    throw new Error(`Expected Arc USDC ERC-20 interface to use ${ARC_MAINNET.usdc.decimals} decimals; got ${decimals}.`);
  }
  const nativeUsdcBalance = await deployer.getBalance();
  if (nativeUsdcBalance.isZero()) {
    throw new Error("The deployer has no native USDC for Arc gas fees.");
  }

  console.log(`Deploying the non-lending USDC custody vault on Arc (chain ${chain.chainId}).`);
  const Vault = await ethers.getContractFactory("ArcUsdcVault", deployer);
  const vault = await Vault.deploy(ARC_USDC_ADDRESS);
  const receipt = await vault.deployTransaction.wait();

  const deployment = {
    network: "Arc Mainnet",
    chainId: chain.chainId,
    deployer: deployer.address,
    usdc: ethers.utils.getAddress(ARC_USDC_ADDRESS),
    usdcDecimals: decimals,
    vault: vault.address,
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    explorerUrl: `${ARC_MAINNET.explorerUrl}/address/${vault.address}`,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync("deployment.json", `${JSON.stringify(deployment, null, 2)}\n`, { flag: "w" });
  console.log(`Vault deployed: ${deployment.explorerUrl}`);
  console.log(`Deployment transaction: ${ARC_MAINNET.explorerUrl}/tx/${receipt.transactionHash}`);
  console.log("Deployment metadata written to deployment.json.");
}

main().catch((error) => {
  console.error("Arc deployment failed:", error.message);
  process.exitCode = 1;
});
