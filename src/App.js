import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import run from "./assets/run.gif";
import Confetis from "./components/Confetis";
export default function App() {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [completeTransaction, setCompleteTransaction] = useState(false);

  const contractAddress = "0x4e2EB773284B1C3EB3E6804646e5ECfC25EE9084";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave();
        setLoadingTransaction(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        setLoadingTransaction(false);
        setCompleteTransaction(true);
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      }
    } catch (error) {
      console.log(error);
      console.log("Ethereum object doesn't exist!");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      {completeTransaction && <Confetis />}
      <div className="dataContainer">
        <div className="header">
          <span role={"img"} aria-label="greeting">
            👋
          </span>
          Hey there!
        </div>

        <div className="bio">
          <p>I am Braian and I'm studing Solidty</p>
          <p>Connect your Ethereum wallet and wave at me!</p>
        </div>

        <div className="wrapButtons">
          <button className="waveButton" onClick={wave}>
            {loadingTransaction ? "Loading " : "Send wave at me"}
          </button>

          {/*
           * If there is no currentAccount render this button
           */}
          {!currentAccount && (
            <button
              className="waveButton waveButton--login"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
        <div className="wrapStatus">
          {loadingTransaction ? (
            <img src={run} alt="loading" />
          ) : (
            completeTransaction && <p>Thanks, I've received your gift 😉</p>
          )}
        </div>
      </div>
    </div>
  );
}
