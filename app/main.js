import * as anchor from "@coral-xyz/anchor"
import * as web3 from "@solana/web3.js"
import * as fs from "fs"
import Fastify from "fastify"


// fastify logging
const fastify = Fastify({
  logger: true,
})

const keypairFile = "./wallet.json"
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairFile)))
const keypair = anchor.web3.Keypair.fromSecretKey(secretKey)
const wallet = new anchor.Wallet(keypair)

const local = "http://127.0.0.1:8899"
const devnet = "https://api.devnet.solana.com"

const connection = new web3.Connection(devnet)
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "processed"
})


//const IDL = JSON.parse(fs.readFileSync("../target/idl/solana_hello_api.json", "utf-8"))
const IDL = {
  "address": "9uVWMyg6PGuLwWUYtA3vY2ubt6JiY5gJRcbHhCW4cXVz",
  "metadata": {
    "name": "solana_hello_api",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "hello",
      "discriminator": [149, 118, 59, 220, 196, 127, 161, 179],
      "accounts": [],
      "args": []
    }
  ]
}
const programID = new anchor.web3.PublicKey("9uVWMyg6PGuLwWUYtA3vY2ubt6JiY5gJRcbHhCW4cXVz")
const program = new anchor.Program(IDL, programID, provider)

console.log(`wallet public key: ${wallet.publicKey.toString()}`);
console.log(`connection commitment: ${connection.commitment}`);
console.log(`program ID: ${programID.toString()}`);
console.log(`IDL: ${JSON.stringify(IDL)}`);
console.log(`Program: ${program}`);

// to invoke home function
fastify.post('/', async function handler(request, reply) {
  try {
    console.log("Attempting to call hello method...");

    // Make sure the program exists and is callable
    const programAccounts = await connection.getProgramAccounts(programID);
    console.log(`Found ${programAccounts.length} program accounts`);

    // Try calling the method
    const tx = await program.methods.hello().rpc();

    console.log("Transaction hash:", tx);
    reply.code(200).send({ transactionHash: tx });
  } catch (err) {
    // More detailed error logging
    console.error("Full error:", err);
    console.error("Error message:", err.message);

    reply.code(500).send({
      error: "Error calling contract",
      message: err.message
    });
  }
});

// to getTransaction details by solana RPC
fastify.post('/fetchTransaction', async (request, reply) => {
  try {
    const txHash = request.body.transactionHash;
    const response = await fetch(local, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [txHash, "json"]
      })
    });
    const rdata = await response.json();
    console.log(rdata);
    reply.code(201).send(rdata.result);
  } catch (error) {
    reply.code(500).send({ error: "Error fetching transaction", details: error.toString() });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
