const {ethers, upgrades} = require("hardhat");
require('dotenv').config();

async function main() {
    const LuigiCoin = await ethers.getContractFactory("LuigiCoin");
    const proxy = await upgrades.deployProxy(LuigiCoin, [process.env.TRANSFER_ADDRESS], { initializer: "initialize" });
    await proxy.deployed();
    console.log("LuigiCoin deployed to:", proxy.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
