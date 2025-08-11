# Spark Wallet Interface

⚠️ IMPORTANT SECURITY DISCLAIMER ⚠️

This application was developed as a proof of concept for ease of use and is NOT PRODUCTION READY. Please be aware of the following:

- This is an experimental interface - use at your own risk
- ALWAYS backup and securely store your wallet's mnemonic phrase
- For best security, run this application on your local machine only
- Never share your mnemonic phrase or private keys with anyone
- Do not use this wallet for storing large amounts of funds

A modern, user-friendly web interface for interacting with the Spark protocol - a Bitcoin Layer 2 solution for instant, low-cost transactions. Built with Next.js, TypeScript, and the official Spark SDK.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![Spark SDK](https://img.shields.io/badge/Spark%20SDK-0.2.7-orange)

## 🚀 Features

### Wallet Management
- **Import Existing Wallet**: Load your wallet using a 12-word mnemonic phrase
- **Generate New Wallet**: Create a new wallet with a secure random mnemonic
- **Secure Input**: Password-style input field with show/hide toggle for mnemonic security
- **Real-time Balance**: View your current balance with manual refresh option

### Transactions
- **Send to Spark Address**: Send payments to any Spark address with:
  - Amount validation
  - Balance checking
  - Optional payment descriptions
  - Automatic balance updates
- **Static Deposit Addresses**: Generate reusable Bitcoin deposit addresses
- **Claim Deposits**: Claim Bitcoin deposits using transaction IDs

### User Experience
- 🎨 Modern dark theme with gradient backgrounds
- ⚡ Real-time loading states and error handling
- 📋 One-click copy for addresses
- 📱 Fully responsive design
- 🔒 Client-side key management

## 📸 Screenshots

<details>
<summary>View Interface Screenshots</summary>

### Wallet Setup
The wallet setup section allows you to generate a new mnemonic or import an existing one.

### Send Payments
Send payments to any Spark address with real-time balance validation.

### Deposit Management
Generate static deposit addresses and claim deposits from the Bitcoin network.

</details>

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [bun](https://bun.sh/)
- Git

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spark-wallet.git
   cd spark-wallet
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Quick Start

1. **Create a New Wallet**
   - Click "Generate New Mnemonic"
   - **Important**: Save the generated 12-word phrase securely
   - Click "Load Wallet" to initialize

2. **Import Existing Wallet**
   - Paste your 12-word mnemonic in the input field
   - Click "Load Wallet"

3. **Send Payments**
   - Enter the recipient's Spark address
   - Enter the amount in satoshis
   - (Optional) Add a payment description
   - Click "Send Payment"

4. **Receive Payments**
   - Click "Generate Static Deposit Address"
   - Share the generated Bitcoin address with the sender
   - After receiving Bitcoin (3+ confirmations), enter the transaction ID
   - Click "Claim Static Deposit"

### Network Configuration

The wallet is configured for **MAINNET** by default. To switch to REGTEST for testing:

Edit `/src/utils/sparkWallet.ts`:
```typescript
network: "REGTEST", // Change from MAINNET to REGTEST
```

## 🔧 Technical Stack

- **Frontend Framework**: [Next.js 14.2](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Spark Integration**: [@buildonspark/spark-sdk](https://www.npmjs.com/package/@buildonspark/spark-sdk)
- **Mnemonic Generation**: [bip39](https://github.com/bitcoinjs/bip39)
- **React**: 18+

## 📚 API Documentation

### Core Functions

#### Wallet Management
```typescript
// Generate a new random 12-word mnemonic
generateRandomMnemonic(): string

// Validate a mnemonic phrase
validateMnemonic(mnemonic: string): boolean

// Initialize wallet with optional mnemonic
initializeWallet(mnemonicOrSeed?: string): Promise<SparkWallet>

// Get current wallet information
getWalletInfo(): Promise<WalletInfo>

// Get wallet balance
getBalance(): Promise<number>
```

#### Transactions
```typescript
// Send to a Spark address
sendToSparkAddress(
  recipientAddress: string,
  amountSats: number,
  description?: string
): Promise<any>

// Generate a static deposit address
generateStaticDepositAddress(): Promise<string>

// Claim a static deposit
claimStaticDepositWithQuote(transactionId: string): Promise<any>
```

## 🔒 Security Considerations

> **⚠️ Important Security Notes:**

1. **Never share your mnemonic phrase** with anyone
2. **Mnemonics are stored in browser memory only** - they are never sent to any server
3. **Always verify the website URL** before entering sensitive information
4. **Consider using a hardware wallet** for large amounts
5. **This is a demo implementation** - additional security measures should be implemented for production use:
   - Encrypted storage
   - Multi-signature support
   - Hardware wallet integration
   - Session management
   - Rate limiting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Network configuration (optional)
NEXT_PUBLIC_NETWORK=MAINNET # or REGTEST for testing
```

## 🚧 Roadmap

- [ ] Add transaction history view
- [ ] Implement QR code generation for addresses
- [ ] Add support for Lightning Network payments
- [ ] Implement multi-language support
- [ ] Add dark/light theme toggle
- [ ] Hardware wallet integration
- [ ] Mobile app version
- [ ] Add unit and integration tests
- [ ] Implement withdrawal to Bitcoin functionality
- [ ] Add support for token transfers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spark Protocol](https://spark.money) for the Layer 2 solution
- [BuildOnSpark](https://github.com/buildonspark) for the SDK
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- The Bitcoin community for continuous innovation

## 📞 Support

- **Documentation**: [Spark Docs](https://docs.spark.money)
- **Issues**: [GitHub Issues](https://github.com/yourusername/spark-wallet/issues)
- **Discord**: [Join our Discord](https://discord.gg/spark)
- **Twitter**: [@sparkprotocol](https://twitter.com/sparkprotocol)

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always start with small amounts when testing new wallet software.

---

Built with ❤️ for the Bitcoin community