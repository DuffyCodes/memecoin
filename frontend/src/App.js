import React, { useState } from "react";
import { ethers, parseUnits } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./ContractABI";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [contract, setContract] = useState(null);

  // Connect Wallet
  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = signer.address || (await signer.getAddress());
      setAccount(address);

      // Initialize Contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      // Fetch Balance
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } else {
      alert("MetaMask not found. Please install it.");
    }
  }

  // Mint Tokens Example
  async function mintTokens() {
    if (contract) {
      try {
        const tx = await contract.mint(account, parseUnits("100", 18)); // Updated syntax
        await tx.wait();
        alert("Minted 100 tokens successfully!");
      } catch (error) {
        console.error("Minting failed:", error);
      }
    }
  }

  return (
    <div>
      <h1>LuigiCoin dApp</h1>
      <button onClick={connectWallet}>
        {account ? "Wallet Connected" : "Connect Wallet"}
      </button>
      {account && (
        <div>
          <p>Connected Account: {account}</p>
          <p>Balance: {balance} Tokens</p>
          <button onClick={mintTokens}>Mint 100 Tokens</button>
        </div>
      )}
    </div>
  );
}

export default App;
