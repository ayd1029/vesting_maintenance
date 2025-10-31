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
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import * as fs from "fs";
const { decodeVestingPlan } = require("./vesting_plan_decoder");

async function main() {
  // --- Todo-mainnet: Setup Provider ---
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // 지갑 로드
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
  }

  const wallet = new Wallet(signerKeypair);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );
  
  anchor.setProvider(provider);

  // Program 로드
  let program: Program<Vesting>;
  let programId: PublicKey;
  
  try {
    program = anchor.workspace.Vesting as Program<Vesting>;
    programId = program.programId;
  } catch (err) {
    console.error("❌ Failed to load program from workspace");
  }

  const schedulerAdminPubkey = signerKeypair.publicKey;

  console.log("\n=== Environment Check ===");
  console.log("✓ RPC Endpoint:", connection.rpcEndpoint);
  console.log("✓ Scheduler Admin:", schedulerAdminPubkey.toBase58());
  console.log("✓ Program ID:", programId.toBase58());

  // 지갑 잔액 확인
  const balance = await connection.getBalance(schedulerAdminPubkey);
  console.log("✓ Wallet Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  
  if (balance === 0) {
    console.warn("\n⚠️  Warning: Wallet has 0 SOL balance!");
    console.log(`  solana airdrop 2 ${schedulerAdminPubkey.toBase58()} --url devnet`);
  }

  // 프로그램 존재 확인
  console.log("\n=== Program Verification ===");
  const programInfo = await connection.getAccountInfo(programId);
  if (!programInfo) {
    console.error("❌ Program does not exist on devnet!");
    console.error("Deploy with: anchor deploy --provider.cluster devnet");
  }
  console.log("✓ Program exists on chain");

  try {
    // --- Todo: 변경 후 주소 ---
    const beneficiaryPubkey = new PublicKey("AJN2MDYqkSLJ5a355w2HFqMgHgqMVKEjfUvv6uKAddGQ");
    
    // --- Todo-mainnet: Configuration  ---
    const tokenMintPubkey = new PublicKey("5TkwMCZF5o35c41LPmQMbfSdm3LUpBJ5UBokmPvXvkUC");
    const tokenVaultPubkey = new PublicKey("7ockDYD8ERbK23LBWVWjgduRibJuwnkJ2Kqs2e4xteTB");
        
    // --- Todo: Configuration ---
    const parentVaultPubkey = new PublicKey("A1o6S2DW5CUE5hg91bauqEb1gWG2vnHiEVT7QUGtCXTA");
    const parentVestingAccountPubkey = new PublicKey("DqbiNzBoXft4VKzoxvc7fgs8tChbLzd6q6DmASeeHuVu");
    const oldUserPlan = new PublicKey("B2LHQoJS7RbeqG1nfNL7HTYS3XoFYSwX77q9J1oE5wsr");
    
    const tokenDecimal = 9;
    const decimal = new BN(10).pow(new BN(tokenDecimal));

    // --- Todo: vesting id ---
    const vestingId = 17676;
    const category = "P/S";

    console.log("\n=== Vesting Configuration ===");
    console.log("- Vesting ID:", vestingId);
    console.log("- Beneficiary:", beneficiaryPubkey.toBase58());
    console.log("- Token Mint:", tokenMintPubkey.toBase58());
    console.log("- Category:", category);

    // Token mint 확인
    console.log("\n=== Token Verification ===");
    const mintInfo = await connection.getAccountInfo(tokenMintPubkey);
    if (!mintInfo) {
      console.error("❌ Token mint does not exist!");
    }
    console.log("✓ Token mint exists");

    // Beneficiary Token Account 생성 (존재하지 않으면)
    console.log("\n=== Token Account Setup ===");
    const beneficiaryTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      beneficiaryPubkey
    );
    
    const beneficiaryTokenAccountInfo = await connection.getAccountInfo(beneficiaryTokenAccount);
    if (!beneficiaryTokenAccountInfo) {
      console.log("Creating beneficiary token account...");
      const createAtaIx = createAssociatedTokenAccountInstruction(
        signerKeypair.publicKey,
        beneficiaryTokenAccount,
        beneficiaryPubkey,
        tokenMintPubkey
      );
      
      const createAtaTx = new Transaction().add(createAtaIx);
      createAtaTx.feePayer = signerKeypair.publicKey;
      createAtaTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      createAtaTx.sign(signerKeypair);
      
      const createAtaTxId = await connection.sendRawTransaction(createAtaTx.serialize());
      await connection.confirmTransaction(createAtaTxId, "finalized");
      console.log("✓ Beneficiary token account created:", createAtaTxId);
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 300));
    } else {
      console.log("✓ Beneficiary token account already exists");
    }

    // --- PDA 계산 ---
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

    const [parentPlanChunk] = PublicKey.findProgramAddressSync(
      [Buffer.from("plans"), parentVestingAccountPubkey.toBuffer()],
      programId
    );
        
    const [planChunk] = PublicKey.findProgramAddressSync(
      [Buffer.from("plans"), vestingAccount.toBuffer()],
      programId
    );

    console.log("✓ All PDAs calculated");
    console.log("- Admin Config:", adminConfig.toBase58());
    console.log("- Beneficiary Vesting Account:", vestingAccount.toBase58());
    console.log("- Beneficiary Vault:", beneficiaryVault.toBase58());
    console.log("- Beneficiary Token Account:", beneficiaryTokenAccount.toBase58());
    console.log("- Parent Plan Chunk:", parentPlanChunk.toBase58());
    console.log("- Plan Chunk:", planChunk.toBase58());

    // Admin Config 초기화 확인
    console.log("\n=== Admin Config Check ===");
    const adminConfigInfo = await connection.getAccountInfo(adminConfig);
    if (!adminConfigInfo) {
      console.warn("⚠️  Admin config does not exist");
      console.warn("You need to call initializeAdmin first!");
    }
    console.log("✓ Admin config exists");

    // --- Vesting Parameters 계산 ---
    console.log("\n=== Preparing Vesting Parameters ===");
    
    // 날짜 설정 (예시: 2024년 시작, 4년 베스팅)
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2027-12-31T23:59:59Z");
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const totalAmount = new BN(0).mul(decimal);
    const releasedAmount = new BN(0).mul(decimal);
        
    const vestingParams = {
      vestingId: new BN(vestingId),
      totalAmount,
      releasedAmount,
      startTime: new BN(startTimestamp),
      endTime: new BN(endTimestamp),
      category,
    };

    console.log("- Total Amount:", totalAmount.toString());
    console.log("- Released Amount:", releasedAmount.toString());
    console.log("- Start Time:", startDate.toISOString());
    console.log("- End Time:", endDate.toISOString());

    // --- 1. Create Vesting Account ---
    console.log("\n=== Step 1: Creating Vesting Account ===");
    
    const isValidVestingAccountInfo = await connection.getAccountInfo(vestingAccount);
    
    if (!isValidVestingAccountInfo) {
      console.log("Creating vesting account...");
      
      const createVestingIx = await program.methods
        .userCreateVesting(vestingParams)
        .accountsPartial({
          admin: schedulerAdminPubkey,
          adminConfig: adminConfig,
          tokenInfo: tokenInfo,
          beneficiary: beneficiaryPubkey,
          vestingAccount: vestingAccount,
          tokenMint: tokenMintPubkey,
          tokenVault: tokenVaultPubkey,
          parentVault: parentVaultPubkey,
          beneficiaryVault: beneficiaryVault,
          vaultAuthority: vaultAuthority,
          beneficiaryTokenAccount: beneficiaryTokenAccount,
          parentVestingAccount: parentVestingAccountPubkey,
          parentPlanChunk: parentPlanChunk,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .instruction();

      const createTx = new Transaction().add(createVestingIx);
      createTx.feePayer = signerKeypair.publicKey;
      createTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      createTx.sign(signerKeypair);

      const createTxId = await connection.sendRawTransaction(createTx.serialize());
      await connection.confirmTransaction(createTxId, "finalized");
      
      console.log("✅ Vesting account created!");
      console.log("Transaction:", createTxId);
      console.log(`https://explorer.solana.com/tx/${createTxId}?cluster=devnet`);
      process.exit(0);  // Exit first execution
    } else {
      console.log("✓ Vesting account already exists");
    }

    // --- 2. Append Yearly Plans ---
    console.log("\n=== Step 2: Appending Yearly Plans ===");
    
    const chunkSize = 80;
    let isValidPlanChunkInfo = await connection.getAccountInfo(planChunk);
    
    if (!isValidPlanChunkInfo) {
      console.log("Fetching and decoding parent plan chunk data using decodeVestingPlan...");
      const decodedParentPlan = await decodeVestingPlan(oldUserPlan);
      const monthlyAmounts = decodedParentPlan.plans;

      console.log("Parent plan's 'released' status:", monthlyAmounts.map(p => p.released));

      // Prepare plans for the new vesting account.
      const plansForTx = monthlyAmounts.map(p => ({
        releaseTime: p.releaseTime,
        amount: p.amount,
        released: p.released,
      }));

      console.log(`Appending ${plansForTx.length} plans in chunks of ${chunkSize}...`);
      
      for (let i = 0; i < plansForTx.length; i += chunkSize) {
        const chunk = plansForTx.slice(i, i + chunkSize);
        console.log(`- Adding chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} plans`);

        const ix = await program.methods
          .appendYearlyPlan(chunk)
          .accountsPartial({
            vestingAccount: vestingAccount,
            planChunk: planChunk,
            parentPlanChunk: parentPlanChunk,
            admin: schedulerAdminPubkey,
            adminConfig: adminConfig,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const tx = new Transaction().add(ix);
        tx.feePayer = signerKeypair.publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.sign(signerKeypair);

        const txId = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(txId, "finalized");

        console.log(`✅ Chunk ${Math.floor(i / chunkSize) + 1} saved!`);
        console.log("Transaction:", txId);
        console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
      }
      console.log("✅ All vesting plans saved!");
    } else {
      console.log("✓ Vesting plans already exist");
    }


    // --- Final Verification ---
    console.log("\n=== Final Verification ===");
    const finalVestingInfo = await connection.getAccountInfo(vestingAccount);
    const finalPlanInfo = await connection.getAccountInfo(planChunk);

    if (finalVestingInfo && finalPlanInfo) {
      console.log("✅ All vesting setup completed successfully!");
      console.log("━".repeat(60));
      console.log("SUMMARY");
      console.log("━".repeat(60));
      console.log("Vesting ID:", vestingId);
      console.log("Beneficiary:", beneficiaryPubkey.toBase58());
      console.log("Vesting Account:", vestingAccount.toBase58());
      console.log("━".repeat(60));
    } else {
      console.error("❌ Setup incomplete");
    }
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
  }
}


main().catch((err) => {
  console.error("Unhandled error:", err);
});