import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MyToken 授权机制", async function () {
  const { viem } = await network.create();
  const [owner, addr1, addr2] = await viem.getWalletClients();

  async function deployToken() {
    const token = await viem.deployContract("MyToken", [
      owner.account.address,
    ]);
    return token;
  }

  it("应该能够授权代币给第三方", async function () {
    const token = await deployToken();

    // owner 先铸造 1000 个代币
    await token.write.mint([owner.account.address, 1000n], {
      account: owner.account,
    });

    // owner 授权 addr1 可以花费 500 个代币
    await token.write.approve([addr1.account.address, 500n], {
      account: owner.account,
    });

    // 查询授权额度
    const allowance = await token.read.allowance([
      owner.account.address,
      addr1.account.address,
    ]);
    assert.equal(allowance, 500n);
  });

  it("第三方应该能够使用授权额度转账", async function () {
    const token = await deployToken();

    await token.write.mint([owner.account.address, 1000n], {
      account: owner.account,
    });

    // owner 授权 addr1 可以花费 500 个代币
    await token.write.approve([addr1.account.address, 500n], {
      account: owner.account,
    });

    // addr1 使用授权额度，把 owner 的代币转给 addr2
    await token.write.transferFrom(
      [owner.account.address, addr2.account.address, 300n],
      { account: addr1.account }
    );

    // 验证余额
    const ownerBalance = await token.read.balanceOf([owner.account.address]);
    const addr2Balance = await token.read.balanceOf([addr2.account.address]);

    assert.equal(ownerBalance, 700n);  // 1000 - 300
    assert.equal(addr2Balance, 300n);

    // 验证剩余额度
    const remainingAllowance = await token.read.allowance([
      owner.account.address,
      addr1.account.address,
    ]);
    assert.equal(remainingAllowance, 200n);  // 500 - 300
  });

  it("不应该能够超过授权额度转账", async function () {
    const token = await deployToken();

    await token.write.mint([owner.account.address, 1000n], {
      account: owner.account,
    });

    // owner 只授权 500 个
    await token.write.approve([addr1.account.address, 500n], {
      account: owner.account,
    });

    // addr1 尝试转 600 个（超过额度），应该失败
    await assert.rejects(async () => {
      await token.write.transferFrom(
        [owner.account.address, addr2.account.address, 600n],
        { account: addr1.account }
      );
    });
  });
});
