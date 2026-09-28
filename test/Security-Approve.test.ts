import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("ERC-20 授权攻击演示", async function () {
  const { viem } = await network.create();
  const [owner, victim, attacker] = await viem.getWalletClients();

  it("应该演示授权攻击过程", async function () {
    // 1. 部署代币
    const token = await viem.deployContract("MyToken", [owner.account.address]);
    
    // 2. 部署恶意 DApp
    const maliciousDApp = await viem.deployContract("MaliciousDApp", []);

    // 3. 给 victim 发 1000 个代币
    await token.write.mint([victim.account.address, 1000n], {
      account: owner.account,
    });

    // 4. victim 被诱导授权了恶意 DApp
    await token.write.approve([maliciousDApp.address, 1000n], {
      account: victim.account,
    });

    // 5. attacker 调用 stealTokens 偷钱
    await maliciousDApp.write.stealTokens([token.address, victim.account.address], {
      account: attacker.account, 
    });

    // 6. 验证结果
    const victimBalance = await token.read.balanceOf([victim.account.address]);
    const attackerBalance = await token.read.balanceOf([maliciousDApp.address]);

    assert.equal(victimBalance, 0n);
    assert.equal(attackerBalance, 1000n);
  });
});
