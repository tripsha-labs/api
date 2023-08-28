import fs from 'fs';
import path from 'path';
import ethWallet from 'ethereumjs-wallet';

// Generate a random wallet
const wallet = ethWallet.generate();

// Create the .wallets folder if it doesn't exist
const walletsFolderPath = path.join(__dirname, '..', '.wallets');
if (!fs.existsSync(walletsFolderPath)) {
  fs.mkdirSync(walletsFolderPath);
}

// Get the nickname from the command line arguments
const nickname = process.argv[2];

// Make sure a nickname was provided
if (!nickname) {
  console.error('Error: Please provide a nickname as a command line argument');
  process.exit(1);
}

// Write the public, private, and address to a file in the .wallets folder
const walletFilePath = path.join(
  walletsFolderPath,
  `${nickname}.json`
);

// Put the wallet data into a formatted JSON object
const walletData = JSON.stringify(
  {
    address: wallet.getAddressString(),
    publicKey: wallet.getPublicKeyString(),
    privateKey: wallet.getPrivateKeyString(),
  },
  null,
  2
);

// Write the file
fs.writeFileSync(walletFilePath, walletData);

// Log the file path
console.log(`New wallet created: ${walletFilePath}`);

