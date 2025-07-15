const { Contract, parseEther, formatEther } = require("ethers");
const { Wallet } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const { CONTRACTS, ABIS } = require("../utils/constants");

async function convert(){

    const provider = new JsonRpcProvider('http://localhost:8545');
    const signer = new Wallet('0xc101c020e4d219646a14050a6b60a1e7f0fcf5b1c9b37bc028764166c90b4783', provider);
    const wethContract = new Contract(CONTRACTS.WETH, ABIS.WETH, signer);
     const balance_before = await wethContract.balanceOf(signer.address);
    console.log(`WETH Balance before conversion: ${formatEther(balance_before)} WETH`);

    const tx = await wethContract.deposit({
        value: parseEther("100.0")   
    });
    await tx.wait();
    await provider.getTransactionReceipt(tx.hash);
    console.log(`Transaction successful with hash: ${tx.hash}`);
    const balance_after = await wethContract.balanceOf(signer.address);
    console.log(`WETH Balance after conversion: ${formatEther(balance_after)} WETH`);

};
convert();