import { SparkWallet } from "@buildonspark/spark-sdk";
import * as bip39 from 'bip39';

// Default mnemonic for demo purposes
// IMPORTANT: In production, this should be securely managed, not hardcoded
const DEFAULT_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

let walletInstance: SparkWallet | null = null;
let currentMnemonic: string | null = null;

export interface DepositQuote {
  creditAmountSats: number;
  sspSignature: string;
}

export interface WalletInfo {
  sparkAddress: string;
  initialized: boolean;
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
 * Clear the current wallet instance
 */
export function clearWallet(): void {
  walletInstance = null;
  currentMnemonic = null;
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
  
  // Use provided mnemonic, current mnemonic, or default
  const seedToUse = mnemonicOrSeed || currentMnemonic || DEFAULT_MNEMONIC;

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
  return currentMnemonic || DEFAULT_MNEMONIC;
}

/**
 * Get the current wallet information
 */
export async function getWalletInfo(): Promise<WalletInfo> {
  try {
    const wallet = await initializeWallet();
    const sparkAddress = await wallet.getSparkAddress();
    
    return {
      sparkAddress,
      initialized: true,
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
export async function getBalance(): Promise<any> {
  try {
    const wallet = await initializeWallet();
    const balance = await wallet.getBalance();
    
    console.log("Current balance:", balance, "sats");
    return {
      balance: balance.balance.toString(),
      tokenBalances: balance.tokenBalances,
    };
  } catch (error) {
    console.error("Failed to get balance:", error);
    throw new Error("Failed to get wallet balance");
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
    if (balance < amountSats) {
      throw new Error(`Insufficient balance. Current balance: ${balance} sats, required: ${amountSats} sats`);
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
