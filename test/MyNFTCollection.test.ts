import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MyNFTCollection", async function () {
  // 创建本地模拟网络，并获取 viem 实例
  const { viem } = await network.create();
  
  // 获取测试账户：owner（管理员）、addr1、addr2（普通用户）
  const [owner, addr1, addr2] = await viem.getWalletClients();

  /**
   * 部署合约的辅助函数
   * 每次测试都重新部署，保证测试之间互不影响
   */
  async function deployNFT() {
    const nft = await viem.deployContract("MyNFTCollection", [
      owner.account.address, // 构造函数参数：initialOwner
    ]);
    return nft;
  }

  /**
   * 测试用例1：验证合约部署后，所有者是否正确设置
   */
  it("应该正确部署并设置正确的所有者", async function () {
    const nft = await deployNFT();

    // 查询合约当前的 owner
    const contractOwner = await nft.read.owner();

    // 断言：合约的 owner 应该等于我们传入的地址
    assert.equal(
      contractOwner.toLowerCase(),
      owner.account.address.toLowerCase()
    );
  });

  /**
   * 测试用例2：验证管理员可以成功铸造 NFT，并且状态正确更新
   */
  it("应该能够成功铸造 NFT", async function () {
    const nft = await deployNFT();
    const tokenURI = "ipfs://QmExampleTokenURI";

    // 使用 owner 身份调用 safeMint，把 NFT 铸造给 addr1
    await nft.write.safeMint([addr1.account.address, tokenURI], {
      account: owner.account,
    });

    // 检查 addr1 的 NFT 余额是否为 1
    const balance = await nft.read.balanceOf([addr1.account.address]);
    assert.equal(balance, 1n);

    // 检查 tokenId=0 的所有者是否是 addr1
    const tokenOwner = await nft.read.ownerOf([0n]);
    assert.equal(
      tokenOwner.toLowerCase(),
      addr1.account.address.toLowerCase()
    );

    // 检查 tokenURI 是否正确写入
    const uri = await nft.read.tokenURI([0n]);
    assert.equal(uri, tokenURI);

    // 检查总供应量是否变成 1
    const total = await nft.read.totalSupply();
    assert.equal(total, 1n);
  });

  /**
   * 测试用例3：验证非 owner 用户无法铸造 NFT（权限控制）
   */
  it("非所有者不应该能够铸造 NFT", async function () {
    const nft = await deployNFT();

    // 故意使用普通用户 addr1 去调用 safeMint，期望这次调用失败
    await assert.rejects(async () => {
      await nft.write.safeMint(
        [addr2.account.address, "ipfs://fake"],
        { account: addr1.account } // 非 owner 身份
      );
    });
  });

  /**
   * 测试用例4：验证 NFT 转账功能是否正常
   */
  it("应该能够正确转移 NFT", async function () {
    const nft = await deployNFT();

    // 先由 owner 铸造一个 NFT 给自己
    await nft.write.safeMint(
      [owner.account.address, "ipfs://QmTransferTest"],
      { account: owner.account }
    );

    // 把 tokenId=0 的 NFT 从 owner 转给 addr1
    await nft.write.transferFrom(
      [owner.account.address, addr1.account.address, 0n],
      { account: owner.account }
    );

    // 断言：转账后，新的所有者应该是 addr1
    const newOwner = await nft.read.ownerOf([0n]);
    assert.equal(
      newOwner.toLowerCase(),
      addr1.account.address.toLowerCase()
    );
  });
});