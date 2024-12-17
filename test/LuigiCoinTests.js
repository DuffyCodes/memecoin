const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("LuigiCoin Contract", function () {
    let LuigiCoin, luigiCoin;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy the contract
        LuigiCoin = await ethers.getContractFactory("LuigiCoin");
        luigiCoin = await upgrades.deployProxy(LuigiCoin, [owner.address], {
            initializer: "initialize",
        });
        await luigiCoin.deployed();
    });

    // --- Initialization ---
    it("Should initialize with correct values", async function () {
        const initialSupply = ethers.utils.parseUnits("1000000", 18);
    
        expect(await luigiCoin.name()).to.equal("LuigiCoin");
        expect(await luigiCoin.symbol()).to.equal("UHC");
        expect(await luigiCoin.totalSupply()).to.equal(initialSupply);
        expect(await luigiCoin.balanceOf(owner.address)).to.equal(initialSupply);
    });

    // --- Minting Tokens ---
    it("Owner should mint tokens successfully", async function () {
        const amountToMint = ethers.utils.parseUnits("1000", 18);
        await luigiCoin.mint(addr1.address, amountToMint);
        expect(await luigiCoin.balanceOf(addr1.address)).to.equal(amountToMint);
    });

    it("Should fail to mint tokens exceeding MAX_SUPPLY", async function () {
        const maxSupply = ethers.utils.parseUnits("2000000", 18);
        await expect(luigiCoin.mint(addr1.address, maxSupply)).to.be.revertedWith(
            "Exceeds maximum supply"
        );
    });

    it("Should fail to mint to zero address", async function () {
        const amountToMint = ethers.utils.parseUnits("1000", 18);
        await expect(
            luigiCoin.mint(ethers.constants.AddressZero, amountToMint)
        ).to.be.revertedWith("Mint to zero address");
    });

    // --- Transfers ---
    it("Should transfer tokens successfully when not paused", async function () {
        const transferAmount = ethers.utils.parseUnits("100", 18);
        await luigiCoin.transfer(addr1.address, transferAmount);
        expect(await luigiCoin.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should fail transfer when paused", async function () {
        await luigiCoin.pause();
        const transferAmount = ethers.utils.parseUnits("100", 18);
        await expect(luigiCoin.transfer(addr1.address, transferAmount)).to.be.reverted;
    });

    // --- Pause and Unpause ---
    it("Owner should be able to pause and unpause the contract", async function () {
        await luigiCoin.pause();
        expect(await luigiCoin.paused()).to.equal(true);

        await luigiCoin.unpause();
        expect(await luigiCoin.paused()).to.equal(false);
    });

    it("Non-owner should not be able to pause or unpause", async function () {
        await expect(luigiCoin.connect(addr1).pause()).to.be.reverted;
        await expect(luigiCoin.connect(addr1).unpause()).to.be.reverted;
    });

    // --- Ether Deposits ---
    it("Should allow users to deposit Ether", async function () {
        const depositAmount = ethers.utils.parseEther("1.0");

        await luigiCoin.connect(addr1).depositEther({ value: depositAmount });
        expect(await luigiCoin.etherDeposits(addr1.address)).to.equal(depositAmount);
    });

    it("Should reject zero Ether deposits", async function () {
        await expect(
            luigiCoin.connect(addr1).depositEther({ value: 0 })
        ).to.be.revertedWith("No Ether sent");
    });

    // --- Ether Withdrawals ---
    it("Should allow users to withdraw Ether", async function () {
        const depositAmount = ethers.utils.parseEther("1.0");
        const withdrawAmount = ethers.utils.parseEther("0.5");

        await luigiCoin.connect(addr1).depositEther({ value: depositAmount });

        const initialBalance = await ethers.provider.getBalance(addr1.address);
        const tx = await luigiCoin.connect(addr1).withdrawEther(withdrawAmount);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.mul(tx.gasPrice);

        const finalBalance = await ethers.provider.getBalance(addr1.address);

        expect(finalBalance.add(gasUsed)).to.be.closeTo(
            initialBalance.add(withdrawAmount),
            ethers.utils.parseEther("0.01") // Allow minor variations
        );
    });

    it("Should fail withdrawal if amount exceeds balance", async function () {
        const depositAmount = ethers.utils.parseEther("1.0");
        const excessAmount = ethers.utils.parseEther("2.0");

        await luigiCoin.connect(addr1).depositEther({ value: depositAmount });

        await expect(
            luigiCoin.connect(addr1).withdrawEther(excessAmount)
        ).to.be.revertedWith("Insufficient contract balance");
    });

    it("Should reject zero withdrawals", async function () {
        await expect(
            luigiCoin.connect(addr1).withdrawEther(0)
        ).to.be.revertedWith("Withdraw amount must be greater than zero");
    });

    // --- Ownership ---
    it("Should allow the owner to renounce ownership", async function () {
        await luigiCoin.renounceOwnership();
        expect(await luigiCoin.owner()).to.equal(ethers.constants.AddressZero);
    });

    it("Should fail to renounce ownership for non-owner", async function () {
        await expect(luigiCoin.connect(addr1).renounceOwnership()).to.be.reverted;
    });
});
