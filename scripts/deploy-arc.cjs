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

  const Vault = await ethers.getContractFactory("ArcUsdcVault", deployer);
  const deploymentTransaction = Vault.getDeployTransaction(ARC_USDC_ADDRESS);
  const estimatedGas = await deployer.estimateGas(deploymentTransaction);
  const gasLimit = estimatedGas.mul(120).add(99).div(100);
  const feeData = await deployer.provider.getFeeData();
  const feeOptions = feeData.maxFeePerGas
    ? {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.constants.Zero,
      }
    : feeData.gasPrice
      ? { gasPrice: feeData.gasPrice }
      : null;
  if (!feeOptions) {
    throw new Error("The Arc RPC did not provide a usable gas price.");
  }

  const feePerGas = feeOptions.maxFeePerGas || feeOptions.gasPrice;
  const maximumFee = gasLimit.mul(feePerGas);
  if (nativeUsdcBalance.lt(maximumFee)) {
    throw new Error(
      `Insufficient native USDC for the estimated deployment fee: ` +
      `${ethers.utils.formatUnits(nativeUsdcBalance, ARC_MAINNET.nativeCurrency.decimals)} available, ` +
      `${ethers.utils.formatUnits(maximumFee, ARC_MAINNET.nativeCurrency.decimals)} required at the buffered gas limit.`,
    );
  }

  console.log("Arc deployment preflight passed.");
  console.log(`Target: ArcUsdcVault on Arc Mainnet (chain ${chain.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`USDC constructor argument: ${ethers.utils.getAddress(ARC_USDC_ADDRESS)}`);
  console.log(`Estimated gas: ${estimatedGas.toString()} (transaction limit: ${gasLimit.toString()})`);
  console.log(`Gas price: ${ethers.utils.formatUnits(feePerGas, "gwei")} gwei`);
  console.log(`Maximum estimated fee: ${ethers.utils.formatUnits(maximumFee, ARC_MAINNET.nativeCurrency.decimals)} native USDC`);
  console.log(`Available native USDC: ${ethers.utils.formatUnits(nativeUsdcBalance, ARC_MAINNET.nativeCurrency.decimals)}`);
  console.log("Submitting the ArcUsdcVault deployment transaction.");

  const vault = await Vault.deploy(ARC_USDC_ADDRESS, { ...feeOptions, gasLimit });
  const receipt = await vault.deployTransaction.wait();
  if (receipt.status !== 1) {
    throw new Error(`Deployment transaction ${receipt.transactionHash} was mined but failed.`);
  }

  const deployedCode = await deployer.provider.getCode(vault.address);
  if (deployedCode === "0x") {
    throw new Error(`No contract code was found at the deployed vault address ${vault.address}.`);
  }
  const deployedToken = await vault.token();
  if (ethers.utils.getAddress(deployedToken) !== ethers.utils.getAddress(ARC_USDC_ADDRESS)) {
    throw new Error(`The deployed vault at ${vault.address} has an unexpected token address.`);
  }

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
