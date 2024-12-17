const { ethers, upgrades } = require("hardhat");

async function main() {
    const CoinV2 = await ethers.getContractFactory("CoinV2");
    console.log("Upgrading to CoinV2...");
    const proxy = await upgrades.upgradeProxy(PROXY_ADDRESS, CoinV2);
    console.log("LuigiCoin upgraded to V2 at:", proxy.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
