import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function main() {
    const USDCContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIContractAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WOOcontractAddress = "0x4691937a7508860F876c9c0a2a617E7d9E945D4B";

    const UNISWAPRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d";

    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const amountADesired = ethers.parseUnits("2000", 6);
    const amountBDesired = ethers.parseUnits("2000", 18);
    const amountAMin = ethers.parseUnits("50", 6);
    const amountBMin = ethers.parseUnits("50", 18);

    const USDC = await ethers.getContractAt("IERC20", USDCContractAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIContractAddress);
    const WOO = await ethers.getContractAt("IERC20", WOOcontractAddress);

    const ROUTER = await ethers.getContractAt("IUniswap", UNISWAPRouter);

    const approveATx = await USDC.connect(impersonatedSigner).approve(UNISWAPRouter, amountADesired);
    await approveATx.wait();

    const approveBTx = await DAI.connect(impersonatedSigner).approve(UNISWAPRouter,amountBDesired);

    const USDCBal = await USDC.balanceOf(impersonatedSigner.address);
    const DAIBal = await DAI.balanceOf(impersonatedSigner.address);
    const WOOBal = await DAI.balanceOf(DAIContractAddress);


    console.log("USDC Balance:", ethers.formatUnits(USDCBal, 6))
    console.log("DAI Balance:", ethers.formatUnits(DAIBal, 18));
    console.log("WOO Balance:", ethers.formatUnits(WOOBal, 18));


    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    // const swapTx = await ROUTER.swapTokensForExactETH(
    //     amountOut,
    //     amountIn,
    //     [USDCAddress, wethAdress],
    //     impersonatedSigner.address,
    //     deadline
    // );

    const addLiquidity = await ROUTER.connect(impersonatedSigner).addLiquidity(USDCContractAddress, DAIContractAddress, amountADesired, amountBDesired, amountAMin, amountBMin, WOOcontractAddress, deadline
    );

    await addLiquidity.wait();


 
    const usdcBalAfterAddLiquidity = await USDC.balanceOf(impersonatedSigner.address);
    const daiBalAfterAddLiquidity = await DAI.balanceOf(impersonatedSigner.address);
    const wooBalAfterAddLiquidity = await DAI.balanceOf(WOOcontractAddress);

    console.log("-----------------------------------------------------------------")

    // Uncomment this if you are using the swap tokens for ETH
    // console.log("weth balance before swap", ethers.formatUnits(wethBalAfterSwap, 18));
    // console.log("eth balance after swap", ethers.formatUnits(ethBalAfterSwap, 18));
    
    console.log("usdc balance after AddLiquidity", ethers.formatUnits(usdcBalAfterAddLiquidity, 6) );
    console.log("dai balance after swap", ethers.formatUnits(daiBalAfterAddLiquidity, 18) );
    console.log("WOO Balance after Add Liquidity", ethers.formatUnits(wooBalAfterAddLiquidity));
    
    /*

    console.log("usdc balance before swap", Number(usdcBal._hex));
    // console.log("weth balance before swap", Number(wethBal._hex));
    console.log("eth balance before swap", Number(ethBal._hex));
    */
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});