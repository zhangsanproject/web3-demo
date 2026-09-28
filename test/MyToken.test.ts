import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MyToken", async function () {
  const { viem } = await network.create();
  const [owner, addr1, addr2] = await viem.getWalletClients();

  async function deployToken() {
    const token = await viem.deployContract("MyToken", [
      owner.account.address,
    ]);
    return token;
  }

  it("应该正确部署并设置名称和符号", async function () {
    //部署合约
    const token = await deployToken();

    //获取合约名字
    const name = await token.read.name();
    //获取合约符合
    const symbol = await token.read.symbol();
    //判断合约名字是否正确
    assert.equal(name, "My Token");
    //判断合约符号是否正确
    assert.equal(symbol, "MTK");
  });

  it("所有者应该能够铸造代币", async function () {
    //部署合约
    const token = await deployToken();
    //铸造1000代币给addr1
    await token.write.mint([addr1.account.address, 1000n], {
      account: owner.account,
    });

    //查询addr1余额是不是1000，断言判断
    const balance = await token.read.balanceOf([addr1.account.address]);
    assert.equal(balance, 1000n);

      //查询链上代币总量是不是1000，断言判断
    const totalSupply = await token.read.totalSupply();
    assert.equal(totalSupply, 1000n);
  });

  it("非所有者不应该能够铸造代币", async function () {
    //部署合约
    const token = await deployToken();

    //非所有者铸造代币测试
    await assert.rejects(async () => {
      await token.write.mint([addr2.account.address, 1000n], {
        account: addr1.account,
      });
    });
  });

  it("应该能够转账代币", async function () {
    //部署合约
    const token = await deployToken();

    //给owner铸造1000代币
    await token.write.mint([owner.account.address, 1000n], {
      account: owner.account,
    });

    //给addr1转账400代币
    await token.write.transfer([addr1.account.address, 400n], {
      account: owner.account,
    });

    //获取两个账户余额
    const ownerBalance = await token.read.balanceOf([owner.account.address]);
    const addr1Balance = await token.read.balanceOf([addr1.account.address]);

    //判断账户余额是否争取
    assert.equal(ownerBalance, 600n);
    assert.equal(addr1Balance, 400n);
  });

  it("应该能够销毁代币", async function () {
    //部署合约
    const token = await deployToken();

    //铸币100个给owner
    await token.write.mint([owner.account.address, 1000n],{
      account: owner.account,
    })

    //owner 销毁300个
    await token.write.burn([300n],{
      account: owner.account,
    })

    //验证余额
    const balance = await token.read.balanceOf([owner.account.address]);
    assert.equal(balance, 700n);

    //验证总供应链量减少
    const totalSupply = await token.read.totalSupply();
    assert.equal(totalSupply, 700n);
  })
});
