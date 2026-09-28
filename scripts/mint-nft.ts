import { network } from 'hardhat';

// 确保这里是你刚才部署得到的最新合约地址
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3' as `0x${string}`;

async function main() {
  const { viem } = await network.create();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const nft = await viem.getContractAt('MyNFTCollection', CONTRACT_ADDRESS);

  console.log('正在铸造 NFT...');

  // 使用一个肯定能显示图片的测试链接
  const tokenURI = 'https://tst.rdtxgj.com/metadata.json';

  const hash = await nft.write.safeMint( 
    ["0x70997970c51812dc3a010c7d01b50e0d17dc79c8" as `0x${string}`, tokenURI],
    { account: deployer.account }
  );

  console.log('交易已发送，等待确认... Hash:', hash);
  await publicClient.waitForTransactionReceipt({ hash });

  console.log('铸造成功！');
  console.log('Token URI:', tokenURI);

  const totalSupply = await nft.read.totalSupply();
  const latestTokenId = totalSupply - 1n;
  console.log('Token ID:', latestTokenId.toString());

  const owner = await nft.read.ownerOf([latestTokenId]);
  console.log('所有者:', owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
