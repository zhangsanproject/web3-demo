import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();
  const [owner, addr1, addr2] = await viem.getWalletClients();

  // ====================== 请修改这里 ======================
  const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3" as `0x${string}`;
  // ======================================================

  const nft = await viem.getContractAt("MyNFTCollection", CONTRACT_ADDRESS);

  console.log("当前合约地址:", nft.address);
  console.log("Owner 地址:", owner.account.address);
  console.log("Addr1 地址:", addr1.account.address);

  // 1. 铸造 NFT 给 addr1
  console.log("\n正在铸造 NFT 给 addr1...");
  const mintTx = await nft.write.safeMint(
    [addr1.account.address, "ipfs://QmTestLocalMint"],
    { account: owner.account }
  );
  console.log("铸造成功，交易哈希:", mintTx);

  // 2. 查询余额和所有者
  const balance = await nft.read.balanceOf([addr1.account.address]);
  console.log("addr1 的 NFT 余额:", balance.toString());

  const tokenOwner = await nft.read.ownerOf([0n]);
  console.log("tokenId 0 的所有者:", tokenOwner);

  // 3. 转账：addr1 把 NFT 转给 addr2
  console.log("\n正在把 NFT 从 addr1 转给 addr2...");
  const transferTx = await nft.write.transferFrom(
    [addr1.account.address, addr2.account.address, 0n],
    { account: addr1.account }
  );
  console.log("转账成功，交易哈希:", transferTx);

  // 4. 再次查询所有者
  const newOwner = await nft.read.ownerOf([0n]);
  console.log("转账后 tokenId 0 的所有者:", newOwner);

  const total = await nft.read.totalSupply();
  console.log("当前总供应量:", total.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});