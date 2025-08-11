import { Bech32mTokenIdentifier, SparkWallet } from "@buildonspark/spark-sdk";
import * as bip39 from 'bip39';

// Local storage key for mnemonic
const MNEMONIC_STORAGE_KEY = 'spark_wallet_mnemonic';

// Default mnemonic for demo purposes
// IMPORTANT: In production, this should be securely managed, not hardcoded
const DEFAULT_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

let walletInstance: SparkWallet | null = null;
let currentMnemonic: string | null = null;

/**
 * Store mnemonic in local storage
 */
function storeMnemonic(mnemonic: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MNEMONIC_STORAGE_KEY, mnemonic);
    } catch (error) {
      console.warn('Failed to store mnemonic in local storage:', error);
    }
  }
}

/**
 * Get stored mnemonic from local storage
 */
function getStoredMnemonic(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem(MNEMONIC_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to get mnemonic from local storage:', error);
    }
  }
  return null;
}

/**
 * Remove stored mnemonic from local storage
 */
function removeStoredMnemonic(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(MNEMONIC_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove mnemonic from local storage:', error);
    }
  }
}

export interface TokenBalance {
  amount: string;
  metadata?: {
    name?: string;
    symbol?: string;
    decimals?: number;
    [key: string]: any;
  };
}

export interface TokenTransferParams {
  tokenIdentifier: Bech32mTokenIdentifier;
  tokenAmount: bigint;
  receiverSparkAddress: string;
}

export interface DepositQuote {
  creditAmountSats: number;
  sspSignature: string;
}

export interface WalletInfo {
  sparkAddress: string;
  initialized: boolean;
  balance: string;
  tokenBalances: { [tokenId: string]: TokenBalance };
}

/**
 * Generate a new random 12-word mnemonic
 */
export function generateRandomMnemonic(): string {
  const mnemonic = bip39.generateMnemonic(128); // 128 bits = 12 words
  console.log("Generated new mnemonic");
  return mnemonic;
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Clear the current wallet instance and stored data
 */
export function clearWallet(): void {
  walletInstance = null;
  currentMnemonic = null;
  removeStoredMnemonic();
  console.log("Wallet cleared");
}

/**
 * Initialize or retrieve the Spark wallet with optional mnemonic
 */
export async function initializeWallet(mnemonicOrSeed?: string): Promise<SparkWallet> {
  // If a new mnemonic is provided and it's different from the current one, clear the wallet
  if (mnemonicOrSeed && mnemonicOrSeed !== currentMnemonic) {
    clearWallet();
  }
  
  // If wallet already exists and no new mnemonic provided, return existing instance
  if (walletInstance && !mnemonicOrSeed) {
    return walletInstance;
  }
  
  // Use provided mnemonic, stored mnemonic, current mnemonic, or default
  const storedMnemonic = getStoredMnemonic();
  const seedToUse = mnemonicOrSeed || storedMnemonic || currentMnemonic || DEFAULT_MNEMONIC;
  
  // Store the mnemonic if it's new and valid
  if (mnemonicOrSeed && validateMnemonic(mnemonicOrSeed)) {
    storeMnemonic(mnemonicOrSeed);
  }

  try {
    const { wallet, mnemonic } = await SparkWallet.initialize({
      mnemonicOrSeed: seedToUse,
      options: {
        network: "MAINNET", // Using MAINNET for production
      },
    });
    
    walletInstance = wallet; // Store the wallet instance
    currentMnemonic = seedToUse; // Store the current mnemonic
    console.log("Wallet initialized successfully");
    return wallet;
  } catch (error) {
    console.error("Failed to initialize wallet:", error);
    throw new Error("Failed to initialize Spark wallet");
  }
}

/**
 * Get the current mnemonic being used
 */
export function getCurrentMnemonic(): string | null {
  return currentMnemonic || getStoredMnemonic() || DEFAULT_MNEMONIC;
}

/**
 * Get the current wallet information
 */
export async function getWalletInfo(): Promise<WalletInfo> {
  try {
    const wallet = await initializeWallet();
    const sparkAddress = await wallet.getSparkAddress();
    const balanceInfo = await wallet.getBalance();
    
    // Convert token balances from Map to object
    const tokenBalances: { [tokenId: string]: TokenBalance } = {};
    balanceInfo.tokenBalances.forEach((value, key) => {
      tokenBalances[key] = {
        amount: value.balance.toString(),
        metadata: value.tokenMetadata
      };
    });
    
    return {
      sparkAddress,
      initialized: true,
      balance: balanceInfo.balance.toString(),
      tokenBalances,
    };
  } catch (error) {
    console.error("Failed to get wallet info:", error);
    throw new Error("Failed to get wallet information");
  }
}

/**
 * Generate a static deposit address
 */
export async function generateStaticDepositAddress(): Promise<string> {
  try {
    const wallet = await initializeWallet();
    const staticDepositAddress = await wallet.getStaticDepositAddress();
    
    console.log("Generated static deposit address:", staticDepositAddress);
    return staticDepositAddress;
  } catch (error) {
    console.error("Failed to generate static deposit address:", error);
    throw new Error("Failed to generate static deposit address");
  }
}

/**
 * Get a quote for claiming a static deposit
 */
export async function getClaimQuote(transactionId: string): Promise<DepositQuote> {
  try {
    const wallet = await initializeWallet();
    const quote = await wallet.getClaimStaticDepositQuote(transactionId);
    
    console.log("Received quote:", quote);
    return {
      creditAmountSats: quote.creditAmountSats,
      sspSignature: quote.signature,
    };
  } catch (error) {
    console.error("Failed to get claim quote:", error);
    throw new Error("Failed to get claim quote");
  }
}

/**
 * Claim a static deposit
 */
export async function claimStaticDeposit(
  transactionId: string,
  creditAmountSats: number,
  sspSignature: string
): Promise<any> {
  try {
    const wallet = await initializeWallet();
    
    const claimResult = await wallet.claimStaticDeposit({
      transactionId,
      creditAmountSats,
      sspSignature,
    });
    
    console.log("Claim successful:", claimResult);
    return claimResult;
  } catch (error) {
    console.error("Failed to claim deposit:", error);
    throw new Error("Failed to claim deposit");
  }
}

/**
 * Claim a static deposit with automatic quote fetching
 */
export async function claimStaticDepositWithQuote(transactionId: string): Promise<any> {
  try {
    // Step 1: Get a quote for the deposit
    const quote = await getClaimQuote(transactionId);
    
    // Step 2: Claim the deposit using the quote details
    const claimResult = await claimStaticDeposit(
      transactionId,
      quote.creditAmountSats,
      quote.sspSignature
    );
    
    return claimResult;
  } catch (error) {
    console.error("Failed to claim deposit with quote:", error);
    throw new Error("Failed to claim deposit");
  }
}

/**
 * Get the wallet balance
 */
export async function getBalance(): Promise<WalletInfo> {
  try {
    return await getWalletInfo();
  } catch (error) {
    console.error("Failed to get balance:", error);
    throw new Error("Failed to get wallet balance");
  }
}

/**
 * Send tokens to a Spark address
 */
export async function sendTokens(params: TokenTransferParams): Promise<any> {
  try {
    const wallet = await initializeWallet();
    
    // Validate the amount
    if (!params.tokenAmount || params.tokenAmount <= 0) {
      throw new Error("Token amount must be greater than 0");
    }
    
    // Get current token balance
    const walletInfo = await getWalletInfo();
    const tokenBalance = walletInfo.tokenBalances[params.tokenIdentifier];
    
    if (!tokenBalance) {
      throw new Error(`No balance found for token ${params.tokenIdentifier}`);
    }
    
    if (BigInt(tokenBalance.amount) < params.tokenAmount) {
      throw new Error(`Insufficient token balance. Current balance: ${tokenBalance.amount}, required: ${params.tokenAmount}`);
    }
    
    // Send the tokens
    const result = await wallet.transferTokens({
      tokenIdentifier: params.tokenIdentifier,
      tokenAmount: params.tokenAmount,
      receiverSparkAddress: params.receiverSparkAddress,
    });
    
    console.log("Token transfer successful:", result);
    return result;
  } catch (error) {
    console.error("Failed to send tokens:", error);
    throw error;
  }
}

/**
 * Send to a Spark address
 */
export async function sendToSparkAddress(
  recipientAddress: string,
  amountSats: number,
  description?: string
): Promise<any> {
  try {
    const wallet = await initializeWallet();
    
    // Validate the amount
    if (amountSats <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    
    // Check balance first
    const balance = await getBalance();
    if (BigInt(balance.balance) < BigInt(amountSats)) {
      throw new Error(`Insufficient balance. Current balance: ${balance.balance} sats, required: ${amountSats} sats`);
    }
    
    // Send the payment
    const result = await wallet.transfer({
      receiverSparkAddress: recipientAddress,
      amountSats,
    });
    
    console.log("Send successful:", result);
    return result;
  } catch (error) {
    console.error("Failed to send to Spark address:", error);
    throw error;
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(): Promise<any[]> {
  try {
    const wallet = await initializeWallet();
    const transfers = await wallet.getTransfers();
    
    console.log("Transaction history:", transfers);
    return transfers.transfers;
  } catch (error) {
    console.error("Failed to get transaction history:", error);
    throw new Error("Failed to get transaction history");
  }
}
