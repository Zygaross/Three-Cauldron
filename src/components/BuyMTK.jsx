"use client";
import React, { useState } from "react";
import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import {
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";

const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";
const CONTRACT_ID = "CDGHL3D7A3LIZRPMWNCQGLID2IDADH74FDKPTHBOS4TI22XLN5VZTZEA";

export default function BuyMTK() {
  const [address, setAddress] = useState("");
  const [xlmAmount, setXlmAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1000000");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const accessObj = await requestAccess();
      if (accessObj.error) {
        setStatus("Error: " + accessObj.error);
        return;
      }
      setAddress(accessObj.address);
      setStatus("Connected!");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  const buyMTK = async () => {
    if (!address || !xlmAmount) {
      setStatus("Please connect wallet and enter amount");
      return;
    }

    try {
      setLoading(true);
      setStatus("Preparing transaction...");

      const server = new rpc.Server(RPC_URL, { allowHttp: true });
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const stroopsNum = Math.floor(parseFloat(xlmAmount) * 10000000);
      const rateNum = parseInt(exchangeRate);

      console.log("Stroops:", stroopsNum);
      console.log("Rate:", rateNum);
      console.log("Address:", address);

      // Use contract.call with string values for i128
      const buyerAddress = new Address(address);

      let builtTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(
        contract.call(
          "buy_mtk_with_xlm",
          ...[
            buyerAddress.toScVal(),
            nativeToScVal(stroopsNum.toString(), { type: "i128" }),
            nativeToScVal(rateNum.toString(), { type: "i128" })
          ]
        )
      )
      .setTimeout(30)
      .build();

      console.log("Transaction built, preparing...");
      setStatus("Please sign in Freighter...");
      
      let tx = await server.prepareTransaction(builtTx);

      const signedXdr = await signTransaction(tx.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      const signedTx = TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr,
        NETWORK_PASSPHRASE
      );

      setStatus("Submitting...");
      const sendResp = await server.sendTransaction(signedTx);

      setStatus("Waiting for confirmation...");
      let txResponse = await server.getTransaction(sendResp.hash);
      while (txResponse.status === "NOT_FOUND") {
        await new Promise((r) => setTimeout(r, 2000));
        txResponse = await server.getTransaction(sendResp.hash);
      }

      if (txResponse.status === "SUCCESS") {
        const mtkReceived = stroopsNum / rateNum;
        setStatus("Success! Bought " + mtkReceived + " MTK with " + xlmAmount + " XLM");
        setXlmAmount("");
      } else {
        setStatus("Failed: " + txResponse.status);
      }

      setLoading(false);
    } catch (err) {
      console.error("Full error:", err);
      setLoading(false);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Buy MTK Tokens</h1>

      {status && <div className="mb-4 p-2 bg-gray-100 rounded">{status}</div>}

      {!address ? (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded"
        >
          Connect Freighter
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Connected: {address.slice(0, 8)}...
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">
              XLM Amount
            </label>
            <input
              type="number"
              value={xlmAmount}
              onChange={(e) => setXlmAmount(e.target.value)}
              placeholder="10"
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Rate: {(parseInt(exchangeRate) / 10000000).toFixed(2)} XLM per MTK
            </label>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Exchange rate in stroops</p>
          </div>

          {xlmAmount && (
            <p className="text-sm text-gray-600">
              You will receive: ~{(parseFloat(xlmAmount) * 10000000 / parseInt(exchangeRate)).toFixed(2)} MTK
            </p>
          )}

          <button
            onClick={buyMTK}
            disabled={loading || !xlmAmount}
            className="w-full bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Buy MTK"}
          </button>
        </div>
      )}
    </div>
  );
}