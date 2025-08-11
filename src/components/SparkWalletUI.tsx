'use client';

import React, { useState, useEffect } from 'react';
import {
  initializeWallet,
  getWalletInfo,
  generateStaticDepositAddress,
  claimStaticDepositWithQuote,
  sendToSparkAddress,
  sendTokens,
  getBalance,
  generateRandomMnemonic,
  validateMnemonic,
  clearWallet,
  getCurrentMnemonic,
  WalletInfo,
  TokenBalance,
  TokenTransferParams
} from '../utils/sparkWallet';
import { Bech32mTokenIdentifier } from '@buildonspark/spark-sdk';

interface DepositClaimState {
  transactionId: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

interface SendState {
  recipientAddress: string;
  amountSats: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

interface TokenSendState {
  tokenId: string;
  recipientAddress: string;
  amount: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function SparkWalletUI() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [staticDepositAddress, setStaticDepositAddress] = useState<string>('');
  const [mnemonicInput, setMnemonicInput] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    wallet: false,
    deposit: false,
    claim: false,
    send: false,
    balance: false,
    token: false,
  });
  const [error, setError] = useState<string>('');
  const [claimState, setClaimState] = useState<DepositClaimState>({
    transactionId: '',
    status: 'idle',
  });
  const [sendState, setSendState] = useState<SendState>({
    recipientAddress: '',
    amountSats: '',
    description: '',
    status: 'idle',
  });
  const [tokenSendState, setTokenSendState] = useState<TokenSendState>({
    tokenId: '',
    recipientAddress: '',
    amount: '',
    status: 'idle',
  });

  // Initialize wallet on component mount with default mnemonic
  useEffect(() => {
    const currentMnemonic = getCurrentMnemonic();
    if (currentMnemonic) {
      setMnemonicInput(currentMnemonic);
    }
    handleInitializeWallet();
  }, []);

  const handleInitializeWallet = async (mnemonic?: string) => {
    setLoading(prev => ({ ...prev, wallet: true }));
    setError('');
    setStaticDepositAddress(''); // Clear previous deposit address
    
    try {
      await initializeWallet(mnemonic);
      const info = await getWalletInfo();
      setWalletInfo(info);
      // Also fetch initial balance
      await handleGetBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize wallet');
      console.error('Wallet initialization error:', err);
    } finally {
      setLoading(prev => ({ ...prev, wallet: false }));
    }
  };

  const handleLoadWallet = async () => {
    const trimmedMnemonic = mnemonicInput.trim();
    
    if (!trimmedMnemonic) {
      setError('Please enter a mnemonic phrase or private key');
      return;
    }
    
    if (!validateMnemonic(trimmedMnemonic)) {
      setError('Invalid mnemonic phrase. Please check and try again.');
      return;
    }
    
    await handleInitializeWallet(trimmedMnemonic);
  };

  const handleGenerateMnemonic = () => {
    const newMnemonic = generateRandomMnemonic();
    setMnemonicInput(newMnemonic);
    setShowMnemonic(true);
    setError('');
    // Don't auto-load, let user click Load Wallet
  };

  const handleGetBalance = async () => {
    setLoading(prev => ({ ...prev, balance: true }));
    
    try {
      const info = await getBalance();
      setBalance(parseInt(info.balance));
      setWalletInfo(info); // Update wallet info to get latest token balances
    } catch (err: any) {
      console.error('Failed to get balance:', err);
    } finally {
      setLoading(prev => ({ ...prev, balance: false }));
    }
  };

  const handleSendToken = async () => {
    if (!tokenSendState.recipientAddress.trim()) {
      setError('Please enter a recipient address');
      return;
    }
    if (!tokenSendState.amount || parseFloat(tokenSendState.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!tokenSendState.tokenId) {
      setError('Please select a token');
      return;
    }

    setLoading(prev => ({ ...prev, token: true }));
    setError('');
    setTokenSendState(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const result = await sendTokens({
        tokenIdentifier: tokenSendState.tokenId as Bech32mTokenIdentifier,
        tokenAmount: BigInt(tokenSendState.amount),
        receiverSparkAddress: tokenSendState.recipientAddress,
      });

      setTokenSendState(prev => ({
        ...prev,
        status: 'success',
        message: 'Token transfer successful!',
        amount: '',
        recipientAddress: '',
      }));

      // Refresh balances after sending
      await handleGetBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to send tokens');
      setTokenSendState(prev => ({
        ...prev,
        status: 'error',
        message: err.message,
      }));
      console.error('Token transfer error:', err);
    } finally {
      setLoading(prev => ({ ...prev, token: false }));
    }
  };

  const handleGenerateStaticDepositAddress = async () => {
    setLoading(prev => ({ ...prev, deposit: true }));
    setError('');
    
    try {
      const address = await generateStaticDepositAddress();
      setStaticDepositAddress(address);
    } catch (err: any) {
      setError(err.message || 'Failed to generate deposit address');
      console.error('Generate deposit address error:', err);
    } finally {
      setLoading(prev => ({ ...prev, deposit: false }));
    }
  };

  const handleClaimStaticDeposit = async () => {
    if (!claimState.transactionId.trim()) {
      setError('Please enter a transaction ID');
      return;
    }

    setLoading(prev => ({ ...prev, claim: true }));
    setError('');
    setClaimState(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const result = await claimStaticDepositWithQuote(claimState.transactionId);
      setClaimState(prev => ({
        ...prev,
        status: 'success',
        message: `Deposit claimed successfully! Result: ${JSON.stringify(result)}`,
      }));
      // Refresh balance after claiming
      await handleGetBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to claim deposit');
      setClaimState(prev => ({
        ...prev,
        status: 'error',
        message: err.message,
      }));
      console.error('Claim deposit error:', err);
    } finally {
      setLoading(prev => ({ ...prev, claim: false }));
    }
  };

  const handleSendToSparkAddress = async () => {
    if (!sendState.recipientAddress.trim()) {
      setError('Please enter a recipient address');
      return;
    }
    if (!sendState.amountSats || parseFloat(sendState.amountSats) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(prev => ({ ...prev, send: true }));
    setError('');
    setSendState(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const result = await sendToSparkAddress(
        sendState.recipientAddress,
        Number(sendState.amountSats),
        sendState.description || undefined
      );
      setSendState(prev => ({
        ...prev,
        status: 'success',
        message: `Payment sent successfully!`,
        recipientAddress: '',
        amountSats: '',
        description: '',
      }));
      // Refresh balance after sending
      await handleGetBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to send payment');
      setSendState(prev => ({
        ...prev,
        status: 'error',
        message: err.message,
      }));
      console.error('Send payment error:', err);
    } finally {
      setLoading(prev => ({ ...prev, send: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Spark Wallet Interface
        </h1>

        {/* Mnemonic/Private Key Input Card */}
        <div className="mb-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Wallet Setup</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Mnemonic Phrase / Private Key:</label>
              <div className="relative">
                <textarea
                  value={mnemonicInput}
                  onChange={(e) => setMnemonicInput(e.target.value)}
                  placeholder="Enter your 12-word mnemonic phrase or private key..."
                  className={`w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm resize-none ${!showMnemonic ? 'text-security-disc' : ''}`}
                  rows={3}
                  style={!showMnemonic ? { WebkitTextSecurity: 'disc' } as any : {}}
                />
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="absolute right-3 top-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                >
                  {showMnemonic ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is stored locally and never sent to any server. For demo, a default mnemonic is loaded.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateMnemonic}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors shadow-lg"
              >
                Generate New Mnemonic
              </button>
              
              <button
                onClick={handleLoadWallet}
                disabled={loading.wallet || !mnemonicInput.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg ${
                  loading.wallet || !mnemonicInput.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading.wallet ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  'Load Wallet'
                )}
              </button>
            </div>

            {mnemonicInput && showMnemonic && validateMnemonic(mnemonicInput.trim()) && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm font-semibold mb-1">⚠️ Important: Save your mnemonic!</p>
                <p className="text-yellow-200 text-xs">
                  Store this phrase safely. It's the only way to recover your wallet. Never share it with anyone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Wallet Info Card */}
        <div className="mb-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">Wallet Information</h2>
          
          {loading.wallet ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : walletInfo ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-semibold">
                  {walletInfo.initialized ? '✓ Initialized' : 'Not Initialized'}
                </span>
              </div>
              <div className="space-y-3">
                {/* Bitcoin Balance */}
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Bitcoin Balance:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-semibold">
                      {loading.balance ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        balance !== null ? `${balance.toLocaleString()} sats` : '0 sats'
                      )}
                    </span>
                    <button
                      onClick={handleGetBalance}
                      disabled={loading.balance}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Token Balances */}
                {walletInfo && Object.entries(walletInfo.tokenBalances).length > 0 && (
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <h3 className="text-gray-400 mb-3">Token Balances:</h3>
                    <div className="space-y-2">
                      {Object.entries(walletInfo.tokenBalances).map(([tokenId, token]) => (
                        <div key={tokenId} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                          <div className="flex-1">
                            <p className="text-sm text-blue-300">
                              {token.metadata?.name || 'Unknown Token'}
                              {token.metadata?.symbol && ` (${token.metadata.symbol})`}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={tokenId}>
                              ID: {tokenId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-300 font-mono">
                              {parseFloat(token.amount).toLocaleString()} {token.metadata?.symbol || 'units'}
                            </p>
                            <button
                              onClick={() => {
                                setSelectedToken(tokenId);
                                setTokenSendState(prev => ({ ...prev, tokenId }));
                              }}
                              className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 mb-2">Spark Address:</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-blue-300 break-all flex-1">
                    {walletInfo.sparkAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(walletInfo.sparkAddress)}
                    className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Wallet not initialized</p>
          )}

          {!walletInfo && !loading.wallet && (
            <button
              onClick={() => handleInitializeWallet()}
              className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Initialize Wallet
            </button>
          )}
        </div>

        {/* Static Deposit Address Card */}
        <div className="mb-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-green-300">Static Deposit Address</h2>
          
          {staticDepositAddress ? (
            <div className="p-3 bg-gray-900/50 rounded-lg mb-4">
              <p className="text-gray-400 mb-2">Bitcoin Deposit Address:</p>
              <div className="flex items-center justify-between">
                <code className="text-sm text-green-300 break-all flex-1">
                  {staticDepositAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(staticDepositAddress)}
                  className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 mb-4">No deposit address generated yet</p>
          )}

          <button
            onClick={handleGenerateStaticDepositAddress}
            disabled={!walletInfo || loading.deposit}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
              !walletInfo || loading.deposit
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-green-600 hover:bg-green-700 hover:shadow-xl'
            }`}
          >
            {loading.deposit ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </span>
            ) : (
              'Generate Static Deposit Address'
            )}
          </button>
        </div>

        {/* Token Send Card */}
        {selectedToken && (
          <div className="mb-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-purple-300">Send Token</h2>
              <button
                onClick={() => {
                  setSelectedToken('');
                  setTokenSendState({
                    tokenId: '',
                    recipientAddress: '',
                    amount: '',
                    status: 'idle',
                  });
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              {walletInfo?.tokenBalances[selectedToken] && (
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400">Selected Token:</p>
                  <p className="text-lg font-semibold text-blue-300">
                    {walletInfo.tokenBalances[selectedToken].metadata?.name || 'Unknown Token'}
                    {walletInfo.tokenBalances[selectedToken].metadata?.symbol && 
                      ` (${walletInfo.tokenBalances[selectedToken].metadata?.symbol})`}
                  </p>
                  <p className="text-sm text-gray-500 break-all mt-1">
                    ID: {selectedToken}
                  </p>
                  <p className="text-sm text-green-300 mt-2">
                    Available Balance: {parseFloat(walletInfo.tokenBalances[selectedToken].amount).toLocaleString()} 
                    {walletInfo.tokenBalances[selectedToken].metadata?.symbol ? 
                      ` ${walletInfo.tokenBalances[selectedToken].metadata.symbol}` : ' units'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-2">Recipient Spark Address:</label>
                <input
                  type="text"
                  value={tokenSendState.recipientAddress}
                  onChange={(e) => setTokenSendState(prev => ({ ...prev, recipientAddress: e.target.value }))}
                  placeholder="Enter recipient's Spark address"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Amount:</label>
                <input
                  type="number"
                  value={tokenSendState.amount}
                  onChange={(e) => setTokenSendState(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount to send"
                  min="0"
                  step="any"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {tokenSendState.status === 'success' && (
                <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
                  <p className="font-semibold">Success!</p>
                  <p className="text-sm mt-1">{tokenSendState.message}</p>
                </div>
              )}

              {tokenSendState.status === 'error' && (
                <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                  <p className="font-semibold">Failed to Send</p>
                  <p className="text-sm mt-1">{tokenSendState.message}</p>
                </div>
              )}

              <button
                onClick={handleSendToken}
                disabled={loading.token || !tokenSendState.recipientAddress.trim() || !tokenSendState.amount || parseFloat(tokenSendState.amount) <= 0}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                  loading.token || !tokenSendState.recipientAddress.trim() || !tokenSendState.amount || parseFloat(tokenSendState.amount) <= 0
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'
                }`}
              >
                {loading.token ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Tokens...
                  </span>
                ) : (
                  'Send Tokens'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Send to Spark Address Card */}
        <div className="mb-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-orange-300">Send to Spark Address</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Recipient Spark Address:</label>
              <input
                type="text"
                value={sendState.recipientAddress}
                onChange={(e) => setSendState(prev => ({ ...prev, recipientAddress: e.target.value }))}
                placeholder="Enter recipient's Spark address"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Amount (sats):</label>
              <input
                type="number"
                value={sendState.amountSats}
                onChange={(e) => setSendState(prev => ({ ...prev, amountSats: e.target.value }))}
                placeholder="Enter amount in satoshis"
                min="1"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {balance !== null && sendState.amountSats && (
                <p className="text-sm text-gray-400 mt-1">
                  {parseInt(sendState.amountSats) > balance ? (
                    <span className="text-red-400">Insufficient balance</span>
                  ) : (
                    `Available: ${balance.toLocaleString()} sats`
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Description (optional):</label>
              <input
                type="text"
                value={sendState.description}
                onChange={(e) => setSendState(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a note for this payment"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {sendState.status === 'success' && (
              <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
                <p className="font-semibold">Payment Sent!</p>
                <p className="text-sm mt-1">{sendState.message}</p>
              </div>
            )}

            {sendState.status === 'error' && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                <p className="font-semibold">Send Failed</p>
                <p className="text-sm mt-1">{sendState.message}</p>
              </div>
            )}

            <button
              onClick={handleSendToSparkAddress}
              disabled={!walletInfo || loading.send || !sendState.recipientAddress.trim() || !sendState.amountSats || parseFloat(sendState.amountSats) <= 0 || (balance !== null && parseInt(sendState.amountSats) > balance)}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                !walletInfo || loading.send || !sendState.recipientAddress.trim() || !sendState.amountSats || parseFloat(sendState.amountSats) <= 0 || (balance !== null && parseInt(sendState.amountSats) > balance)
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-orange-600 hover:bg-orange-700 hover:shadow-xl'
              }`}
            >
              {loading.send ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Payment...
                </span>
              ) : (
                'Send Payment'
              )}
            </button>
          </div>
        </div>

        {/* Claim Deposit Card */}
        <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Claim Static Deposit</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Transaction ID:</label>
              <input
                type="text"
                value={claimState.transactionId}
                onChange={(e) => setClaimState(prev => ({ ...prev, transactionId: e.target.value }))}
                placeholder="Enter Bitcoin transaction ID"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {claimState.status === 'success' && (
              <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
                <p className="font-semibold">Success!</p>
                <p className="text-sm mt-1">{claimState.message}</p>
              </div>
            )}

            {claimState.status === 'error' && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                <p className="font-semibold">Claim Failed</p>
                <p className="text-sm mt-1">{claimState.message}</p>
              </div>
            )}

            <button
              onClick={handleClaimStaticDeposit}
              disabled={!walletInfo || loading.claim || !claimState.transactionId.trim()}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                !walletInfo || loading.claim || !claimState.transactionId.trim()
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'
              }`}
            >
              {loading.claim ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Claiming Deposit...
                </span>
              ) : (
                'Claim Static Deposit'
              )}
            </button>

            <p className="text-sm text-gray-400 mt-2">
              Note: Deposits require 3 confirmations on the Bitcoin network before they can be claimed.
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-yellow-300">ℹ️ Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• This wallet uses a hardcoded mnemonic for demo purposes only</li>
            <li>• Network is set to REGTEST for testing (change to MAINNET for production)</li>
            <li>• Static deposit addresses are reusable and can receive multiple deposits</li>
            <li>• Always wait for 3 confirmations before attempting to claim deposits</li>
            <li>• Keep your transaction IDs safe for claiming deposits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
