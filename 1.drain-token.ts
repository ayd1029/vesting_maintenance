import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet, BN } from "@coral-xyz/anchor";
import { Vesting } from "./target/types/vesting";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as fs from "fs";

async function main() {
  // --- Todo-mainnet: Setup Provider ---
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // --- Todo-mainnet: Load wallet ---
  const walletPath = process.env.ANCHOR_WALLET || 
                     `${process.env.HOME}/.config/solana/scheduler.json`;
  
  let signerKeypair: Keypair;
  try {
    const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
    signerKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    console.log("✓ Wallet loaded:", signerKeypair.publicKey.toBase58());
  } catch (err) {
    console.error("❌ Failed to load wallet from:", walletPath);
    console.error("Generate one with: solana-keygen new");
    process.exit(1);
  }

  const wallet = new Wallet(signerKeypair);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );
  
  anchor.setProvider(provider);

  // Load program
  let program: Program<Vesting>;
  let programId: PublicKey;
  
  try {
    program = anchor.workspace.Vesting as Program<Vesting>;
    programId = program.programId;
  } catch (err) {
    console.error("❌ Failed to load program from workspace");
    process.exit(1);
  }

  const schedulerAdminPubkey = signerKeypair.publicKey;

  console.log("\n=== Environment Check ===");
  console.log("✓ RPC Endpoint:", connection.rpcEndpoint);
  console.log("✓ Scheduler Admin:", schedulerAdminPubkey.toBase58());
  console.log("✓ Program ID:", programId.toBase58());

  // Check wallet balance
  const balance = await connection.getBalance(schedulerAdminPubkey);
  console.log("✓ Wallet Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  
  if (balance === 0) {
    console.warn("\n⚠️  Warning: Wallet has 0 SOL balance!");
    console.log(`  solana airdrop 2 ${schedulerAdminPubkey.toBase58()} --url devnet`);
    process.exit(1);
  }

  try {
    // --- Todo: old beneficiary ---
    const beneficiaryPubkey = new PublicKey("14XMtcbFMiCa7YMUhC6Wq9QuBAhjDBtSKqTLzgko72Dh");
    // --- Todo-mainnet: Hardcoded Configuration ---
    const tokenMintPubkey = new PublicKey("5TkwMCZF5o35c41LPmQMbfSdm3LUpBJ5UBokmPvXvkUC");
    const tokenVaultPubkey = new PublicKey("7ockDYD8ERbK23LBWVWjgduRibJuwnkJ2Kqs2e4xteTB");
    
    // --- Todo: vesting id ---
    const vestingId = 17676;
    const tokenDecimal = 9;
    const decimal = new BN(10).pow(new BN(tokenDecimal));
    
    // Doesnt matter (example: 100 tokens)
    const amountInTokens = 100;
    const amount = new BN(Math.round(amountInTokens * (10 ** tokenDecimal)).toString());
    
    // Vesting time (Unix timestamp - example: current time)
    const vestingTime = new BN(Date.now());
    const endTime = vestingTime.add(new BN(31536000)); // 1 year from vestingTime
    const category = "P/S";
        
    // Destination Token Account 생성 (존재하지 않으면)
    console.log("\n=== Token Account Setup ===");
        
    // --- Todo: new destination ---
    const destinationPubkey = new PublicKey("Dn1TKQyMSvUeJPingt7tnCfMKvwQRUariUNcmHU7M8HP");
    const destinationTokenAccountPubkey = await getAssociatedTokenAddress(
      tokenMintPubkey,
      destinationPubkey
    );
    
    const destinationTokenAccountInfo = await connection.getAccountInfo(destinationTokenAccountPubkey);
    if (!destinationTokenAccountInfo) {
      console.log("Creating destination token account...");
      const createAtaIx = createAssociatedTokenAccountInstruction(
        signerKeypair.publicKey,
        destinationTokenAccountPubkey,
        destinationPubkey,
        tokenMintPubkey
      );
      
      const createAtaTx = new Transaction().add(createAtaIx);
      createAtaTx.feePayer = signerKeypair.publicKey;
      createAtaTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      createAtaTx.sign(signerKeypair);
      
      const createAtaTxId = await connection.sendRawTransaction(createAtaTx.serialize());
      await connection.confirmTransaction(createAtaTxId, "finalized");
      console.log("✓ Destination token account created:", createAtaTxId);
      process.exit(0);  // Exit first execution
    } else {
      console.log("✓ Destination token account already exists");
    }

    console.log("\n=== Do Vesting Configuration ===");
    console.log("- Vesting ID:", vestingId);
    console.log("- Beneficiary:", beneficiaryPubkey.toBase58());
    console.log("- Token Mint:", tokenMintPubkey.toBase58());
    console.log("- Token Vault:", tokenVaultPubkey.toBase58());
    console.log("- Destination Token Account:", destinationTokenAccountPubkey.toBase58());
    console.log("- Amount:", amount.toString(), `(${amount.div(decimal).toString()} tokens)`);
    console.log("- Vesting Time:", vestingTime.toString(), `(${new Date(vestingTime.toNumber() * 1000).toISOString()})`);

    // --- Calculate PDAs ---
    console.log("\n=== Calculating PDAs ===");
    
    const [adminConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin")],
      programId
    );

    const [tokenInfo] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_info"),
        schedulerAdminPubkey.toBuffer(),
        tokenMintPubkey.toBuffer()
      ],
      programId
    );

    const [vestingAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        beneficiaryPubkey.toBuffer(),
        tokenMintPubkey.toBuffer(),
        new BN(vestingId).toArrayLike(Buffer, "le", 8)
      ],
      programId
    );

    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_auth"),
        schedulerAdminPubkey.toBuffer(),
        tokenVaultPubkey.toBuffer()
      ],
      programId
    );

    const [beneficiaryVault] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        beneficiaryPubkey.toBuffer(),
        tokenMintPubkey.toBuffer(),
        new BN(vestingId).toArrayLike(Buffer, "le", 8)
      ],
      programId
    );

    const [planChunk] = PublicKey.findProgramAddressSync(
      [Buffer.from("plans"), vestingAccount.toBuffer()],
      programId
    );

    console.log("✓ All PDAs calculated");
    console.log("- Admin Config:", adminConfig.toBase58());
    console.log("- Token Info:", tokenInfo.toBase58());
    console.log("- Vesting Account:", vestingAccount.toBase58());
    console.log("- Vault Authority:", vaultAuthority.toBase58());
    console.log("- Beneficiary Vault:", beneficiaryVault.toBase58());
    console.log("- Plan Chunk:", planChunk.toBase58());

    // --- Verify accounts exist ---
    console.log("\n=== Verifying Accounts ===");
    
    const adminConfigInfo = await connection.getAccountInfo(adminConfig);
    if (!adminConfigInfo) {
      console.error("❌ Admin config does not exist");
      process.exit(1);
    }
    console.log("✓ Admin config exists");

    const vestingAccountInfo = await connection.getAccountInfo(vestingAccount);
    if (!vestingAccountInfo) {
      console.error("❌ Vesting account does not exist");
      process.exit(1);
    }
    console.log("✓ Vesting account exists");

    const planChunkInfo = await connection.getAccountInfo(planChunk);
    if (!planChunkInfo) {
      console.error("❌ Plan chunk does not exist");
      process.exit(1);
    }
    console.log("✓ Plan chunk exists");

    // --- Execute do_vesting ---
    console.log("\n=== Executing do_vesting ===");
    
    const tx = await program.methods
      .doVesting(amount, vestingTime, {
        vestingId: new BN(vestingId),
        totalAmount: amount,
        releasedAmount: new BN(0),
        startTime: vestingTime,
        endTime: endTime,
        category: category,
      })
      .accountsPartial({
        admin: schedulerAdminPubkey,
        tokenVault: tokenVaultPubkey,
        vaultAuthority: vaultAuthority,
        originTokenAccount: beneficiaryVault,
        destinationTokenAccount: destinationTokenAccountPubkey,
        vestingAccount: vestingAccount,
        adminConfig: adminConfig,
        planChunk: planChunk,
        tokenInfo: tokenInfo,
        beneficiary: beneficiaryPubkey,
        tokenMint: tokenMintPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ do_vesting executed successfully!");
    console.log("Transaction:", tx);
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // --- Final Verification ---
    console.log("\n=== Final Verification ===");
    const updatedVestingAccount = await program.account.vestingAccount.fetch(vestingAccount);
    console.log("✓ Vesting Account Released Amount:", updatedVestingAccount.releasedAmount.toString());
    console.log("━".repeat(60));
    console.log("SUMMARY");
    console.log("━".repeat(60));
    console.log("Vesting ID:", vestingId);
    console.log("Amount Vested:", amount.toString(), `(${amount.div(decimal).toString()} tokens)`);
    console.log("Transaction:", tx);
    console.log("━".repeat(60));
  } catch (err: any) {
    console.error("\n❌ Transaction failed!");
    console.error("━".repeat(60));
    
    if (err.logs) {
      console.error("\n🪵 Simulation logs:");
      err.logs.forEach((log: string) => console.error(log));
    }
    
    if (err.message) {
      console.error("\nError Message:", err.message);
    }
    
    console.error("\nFull Error:", err);
    console.error("━".repeat(60));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
