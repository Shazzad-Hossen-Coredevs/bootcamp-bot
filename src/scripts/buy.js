const { Contract, parseEther, formatEther, formatUnits } = require("ethers");
const { Wallet } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const { CONTRACTS, ABIS } = require("../utils/constants");


async function getBalances(signer){
    const wethContract = new Contract(CONTRACTS.WETH, ABIS.WETH, signer);
    const balance = await wethContract.balanceOf(signer.address);
    console.log(`WETH Balance: ${formatEther(balance.toString())} WETH`);
    const shibContract = new Contract("0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", ABIS.WETH, signer);
    const shibDecimals = await shibContract.decimals();
    const shibBalance = await shibContract.balanceOf(signer.address);
    console.log(`SHIB Balance: ${formatUnits(shibBalance.toString(),shibDecimals)} SHIB\n\n`);
}

async function buy() {
    const amount = "10"; // in WETH (not ETH)
    const SHIB_ADDRESS = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE";

    const provider = new JsonRpcProvider("http://localhost:8545");
    const signer = new Wallet(
        "0xc101c020e4d219646a14050a6b60a1e7f0fcf5b1c9b37bc028764166c90b4783",
        provider
    );

    await getBalances(signer);

    const router = new Contract(CONTRACTS.ROUTER, ABIS.ROUTER, signer);

    const amountIn = parseEther(amount); // e.g., 10 WETH

    // Get estimated output
    const [, amountOut] = await router.getAmountsOut(amountIn, [CONTRACTS.WETH, SHIB_ADDRESS]);
    const amountOutMin = amountOut * 50n / 100n; // 50% slippage tolerance

    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes

    // === STEP 1: Approve router to spend WETH if not already ===
    const weth = new Contract(CONTRACTS.WETH, ABIS.WETH, signer);
    const allowance = await weth.allowance(await signer.getAddress(), CONTRACTS.ROUTER);
     let nonce = await provider.getTransactionCount(signer.address, "latest");

    if (allowance < amountIn) {
        const approveTx = await weth.approve(CONTRACTS.ROUTER, amountIn,{ nonce});
        await approveTx.wait();
        console.log("WETH approved for Uniswap router.");
    }

    // === STEP 2: Swap WETH -> SHIB ===
    const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        [CONTRACTS.WETH, SHIB_ADDRESS],
        await signer.getAddress(),
        deadline,
        {
            gasLimit: 3000000,
        }
    );

    await tx.wait();
    await provider.getTransactionReceipt(tx.hash);
    console.log(`✅ Transaction successful with hash: ${tx.hash}`);


    await getBalances(signer);

}

buy().catch(console.error);
