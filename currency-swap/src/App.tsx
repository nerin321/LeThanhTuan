// Import necessary libraries
import React, { useState, useEffect } from "react";

interface Token {
  currency: string;
  date: string; // ISO 8601 date string
  price: number;
}

const TOKEN_PRICE_URL = "https://interview.switcheo.com/prices.json";

const CurrencySwapForm: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  // Fetch token prices on component mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(TOKEN_PRICE_URL);
        const data: Record<
          string,
          { currency: string; date: string; price: number } | null
        > = await response.json();
        const validTokens = Object.entries(data)
          .filter(([, value]) => value !== null)
          .map(([id, value]) => ({
            id,
            currency: value!.currency,
            date: value!.date,
            price: value!.price,
          }));
        console.log(validTokens);
        setTokens(validTokens);
      } catch (err) {
        setError(`Failed to fetch token prices: ${err}`);
      }
    };

    fetchPrices();
  }, []);

  // Calculate exchange rate when fromToken, toToken, or amount changes
  useEffect(() => {
    if (fromToken && toToken) {
      const fromPrice = tokens.find((t) => t.currency === fromToken)?.price;
      const toPrice = tokens.find((t) => t.currency === toToken)?.price;
      if (fromPrice && toPrice) {
        setExchangeRate(Number((fromPrice / toPrice).toFixed(6)));
      } else {
        setExchangeRate(null);
      }
    }
  }, [fromToken, toToken, tokens]);

  const handleSwap = () => {
    if (
      !fromToken ||
      !toToken ||
      !amount ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      setError("Please provide valid inputs.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const k = Number(amount) * (exchangeRate || 0);
      setResult(k);
      setAmount("");
    }, 1500);
  };

  return (
    <div className="h-screen py-10 bg-[#D9EAFD]">
      <div className="bg-gray-50 max-w-md p-6 mx-auto font-sans border rounded-lg">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">
          Currency Swap
        </h1>

        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            From:
          </label>
          <select
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
          >
            <option value="">Select Token</option>
            {tokens.map(({ currency }) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            To:
          </label>
          <select
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
          >
            <option value="">Select Token</option>
            {tokens.map(({ currency }) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Amount:
          </label>
          <input
            type="number"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div>
          <p className="block mb-2 text-sm font-medium text-gray-700">
            Amount Convert:
          </p>
          <div className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-10 px-3 py-2 mb-2 border border-gray-300 rounded-lg">
            {result}
          </div>
        </div>

        {exchangeRate !== null && (
          <div className="mb-4 text-sm text-gray-600">
            Exchange Rate: 1 {fromToken} = {exchangeRate} {toToken}
          </div>
        )}

        <button
          className={`w-full py-2 px-4 text-white rounded-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleSwap}
          disabled={loading}
        >
          {loading ? "Processing..." : "Swap"}
        </button>
      </div>
    </div>
  );
};

export default CurrencySwapForm;
