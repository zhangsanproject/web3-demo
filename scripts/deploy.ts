import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();
  const [deployer] = await viem.getWalletClients();

  console.log("正在使用账户部署:", deployer.account.address);

  // 部署合约，传入 deployer 作为 initialOwner
  const nft = await viem.deployContract("MyNFTCollection", [
    deployer.account.address,
  ]);

  console.log("✅ MyNFTCollection 部署成功！");
  console.log("合约地址:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});