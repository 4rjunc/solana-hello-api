// direct-web3.js
const { Connection, PublicKey, TransactionInstruction, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Wallet, web3 } = require('@coral-xyz/anchor');
const fs = require('fs');

async function testDirect() {
  try {
    console.log("Loading wallet...");
    const keypairFile = "./wallet.json";
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairFile)));
    const keypair = web3.Keypair.fromSecretKey(secretKey);

    console.log("Setting up connection...");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    console.log(`Wallet public key: ${keypair.publicKey.toString()}`);

    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`Wallet balance: ${balance / 1e9} SOL`);

    const programId = new PublicKey("9uVWMyg6PGuLwWUYtA3vY2ubt6JiY5gJRcbHhCW4cXVz");

    // Verify the program exists
    console.log("Verifying program exists...");
    const programInfo = await connection.getAccountInfo(programId);
    if (programInfo) {
      console.log("Program found on devnet!");
      console.log(`Program is executable: ${programInfo.executable}`);
    } else {
      console.log("Program NOT found on devnet!");
      return;
    }

    // Create instruction manually with the hello discriminator
    console.log("Creating instruction...");
    const instruction = new TransactionInstruction({
      keys: [],  // No accounts needed according to IDL
      programId: programId,
      data: Buffer.from([149, 118, 59, 220, 196, 127, 161, 179])  // hello discriminator from IDL
    });

    // Create and send transaction
    console.log("Sending transaction...");
    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair]
    );

    console.log("Transaction successful:", signature);
    console.log("Transaction URL:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  }
}

testDirect()
  .then(() => console.log("Test completed"))
  .catch(err => console.error("Test failed:", err.message));
