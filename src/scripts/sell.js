const { Contract, parseUnits, formatEther, formatUnits } = require("ethers");
const { Wallet } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const { CONTRACTS, ABIS } = require("../utils/constants");

async function getBalances(signer) {
    const wethContract = new Contract(CONTRACTS.WETH, ABIS.WETH, signer);
    const wethBalance = await wethContract.balanceOf(signer.address);
    console.log(`WETH Balance: ${formatEther(wethBalance.toString())} WETH`);

    const shibContract = new Contract("0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", ABIS.WETH, signer);
    const shibDecimals = await shibContract.decimals();
    const shibBalance = await shibContract.balanceOf(signer.address);
    console.log(`SHIB Balance: ${formatUnits(shibBalance.toString(), shibDecimals)} SHIB\n\n`);
}

async function sell() {
    const SHIB_ADDRESS = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE";
    const provider = new JsonRpcProvider("http://localhost:8545");
    const signer = new Wallet(
        "0xc101c020e4d219646a14050a6b60a1e7f0fcf5b1c9b37bc028764166c90b4783",
        provider
    );

    await getBalances(signer);

    const router = new Contract(CONTRACTS.ROUTER, ABIS.ROUTER, signer);

    const shibAmount = "15251117061.457427596045898235"; // amount of SHIB to sell (in SHIB units, not decimals)
    const shibContract = new Contract(SHIB_ADDRESS, ABIS.WETH, signer);
    const shibDecimals = await shibContract.decimals();
    const amountIn = parseUnits(shibAmount, shibDecimals);

    // Get estimated WETH output
    const [, amountOut] = await router.getAmountsOut(amountIn, [SHIB_ADDRESS, CONTRACTS.WETH]);
    const amountOutMin = amountOut * 90n / 100n; // 10% slippage tolerance

    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes
    let nonce = await provider.getTransactionCount(signer.address, "latest");

    // === STEP 1: Approve SHIB to router ===
    const allowance = await shibContract.allowance(signer.address, CONTRACTS.ROUTER);
    if (allowance < amountIn) {
        const approveTx = await shibContract.approve(CONTRACTS.ROUTER, amountIn, { nonce });
        await approveTx.wait();
        console.log("SHIB approved for Uniswap router.");
        nonce++; // manually increment nonce
    }

    // === STEP 2: Swap SHIB → WETH ===
    const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        [SHIB_ADDRESS, CONTRACTS.WETH],
        signer.address,
        deadline,
        {
            gasLimit: 3000000,
            nonce
        }
    );

    await tx.wait();
    console.log(`✅ Sell transaction successful with hash: ${tx.hash}`);

    await getBalances(signer);
}

sell().catch(console.error);
