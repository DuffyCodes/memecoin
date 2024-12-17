const hre = require("hardhat");
require('dotenv').config();

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const LuigiCoin = await hre.ethers.getContractFactory("LuigiCoin");
    const luigiCoin = LuigiCoin.attach(contractAddress);

    // Example: Read the token name
    const name = await luigiCoin.name();
    console.log("Token name:", name);

    // Example: Transfer tokens
    const tx = await luigiCoin.transfer(process.env.TRANSFER_ADDRESS, ethers.utils.parseUnits("10", 18));
    console.log("Transaction hash:", tx.hash);

    await tx.wait();
    console.log("Transfer complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
