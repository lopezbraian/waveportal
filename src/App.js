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

  const contractAddress = "0x8D801C27eAA8fA6eac310892aa896F4e8068800D";
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

  const wave = async (e) => {
    e.preventDefault();
    if (text === "") {
      setError(" 🙊 add a message");
      return false;
    }
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
        const waveTxn = await wavePortalContract.wave(text);
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

  const getWave = async () => {
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

        let waves = await wavePortalContract.getAllWaves();
        setWaves(waves);
      }
    } catch (error) {
      console.log(error);
      console.log("Ethereum object doesn't exist!");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getWave();
  }, [completeTransaction]);

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [waves, setWaves] = useState([]);

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

        <form className="form" onSubmit={wave}>
          <textarea
            placeholder="Some message"
            onChange={(e) => {
              setText(e.target.value);
            }}
            value={text}
          />
          <button type="submit" className="waveButton">
            {loadingTransaction ? "Loading " : "Send wave at me"}
          </button>
          <p className="error">{error}</p>
        </form>
        <div>
          <h2>Last messages</h2>
          {waves.map((waves, key) => (
            <p key={key}>{waves["message"]}</p>
          ))}
        </div>
        <div className="wrapButtons">
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
