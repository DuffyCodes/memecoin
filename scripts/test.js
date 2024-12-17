const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
    const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, provider);

    const abi = [
        "function mint(address to, uint256 amount) external",
        "function transfer(address recipient, uint256 amount) public returns (bool)",
        "function pause() external",
        "function unpause() external",
        "function withdrawEther(uint256 amount) external",
        "function depositEther() external payable",
        "function balanceOf(address account) external view returns (uint256)",
        "function totalSupply() external view returns (uint256)",
        "function paused() public view returns (bool)"
    ];

    const coinContract = new ethers.Contract(contractAddress, abi, wallet);
    const recipient = process.env.TRANSFER_ADDRESS;

    console.log("Minting 1000 tokens...");
    const mintTx = await coinContract.mint(recipient, ethers.utils.parseUnits("1000", 18));
    await mintTx.wait();
    console.log("Minting successful.");

    console.log("Transferring 100 tokens...");
    const transferTx = await coinContract.transfer(recipient, ethers.utils.parseUnits("100", 18));
    await transferTx.wait();
    console.log("Transfer successful.");

    console.log("Pausing the contract...");
    const pauseTx = await coinContract.pause();
    await pauseTx.wait();
    console.log("Contract paused.");

    console.log("Unpausing the contract...");
    const unpauseTx = await coinContract.unpause();
    await unpauseTx.wait();
    console.log("Contract unpaused.");

    console.log("Depositing 1 Ether...");
    const depositTx = await coinContract.depositEther({ value: ethers.utils.parseEther("1") });
    await depositTx.wait();
    console.log("Ether deposited.");

    console.log("Withdrawing 0.5 Ether...");
    const withdrawTx = await coinContract.withdrawEther(ethers.utils.parseEther("0.5"));
    await withdrawTx.wait();
    console.log("Ether withdrawn.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
