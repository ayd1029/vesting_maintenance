
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vesting } from "../target/types/vesting";
import {
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createMint,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("vesting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vesting as Program<Vesting>;

  let admin: Keypair;
  let beneficiary: Keypair;
  let mint: PublicKey;
  let adminTokenAccount: PublicKey;
  let beneficiaryTokenAccount: PublicKey;
  let vaultTokenAccount: PublicKey;
  let vaultAuthority: PublicKey;
  let vestingAccount: PublicKey;
  let planChunk: PublicKey;

  const vestingId = new anchor.BN(1);
  const totalAmount = new anchor.BN(1000);
  const releasedAmount = new anchor.BN(0);
  const startTime = new anchor.BN(Date.now() / 1000);
  const endTime = new anchor.BN(startTime.toNumber() + 3600); // 1 hour later
  const category = "team";

  before(async () => {
    admin = Keypair.generate();
    beneficiary = Keypair.generate();

    // Airdrop SOL to admin and beneficiary
    const adminAirdropTx = await provider.connection.requestAirdrop(
      admin.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(adminAirdropTx);

    const beneficiaryAirdropTx = await provider.connection.requestAirdrop(
      beneficiary.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(beneficiaryAirdropTx);

    // Create a new mint
    mint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );

    // Create token accounts
    adminTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin,
        mint,
        admin.publicKey
      )
    ).address;
    beneficiaryTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin,
        mint,
        beneficiary.publicKey
      )
    ).address;

    // Mint some tokens to the admin account
    await mintTo(
      provider.connection,
      admin,
      mint,
      adminTokenAccount,
      admin,
      1000000
    );

    // Find PDAs
    [vaultAuthority] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vault_auth"),
        admin.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );
    [vaultTokenAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vault"),
        admin.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );
    [vestingAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vesting"),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
        vestingId.toBuffer("le", 8),
      ],
      program.programId
    );
    [planChunk] = await PublicKey.findProgramAddress(
      [Buffer.from("plans"), vestingAccount.toBuffer()],
      program.programId
    );
  });

  it("Initializes the deployer", async () => {
    const [deployAdmin] = await PublicKey.findProgramAddress(
      [Buffer.from("deploy_admin")],
      program.programId
    );

    await program.methods
      .initializeDeployer()
      .accounts({
        deployer: admin.publicKey,
        deployAdmin,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
  });

  it("Initializes the admin", async () => {
    const [deployAdmin] = await PublicKey.findProgramAddress(
      [Buffer.from("deploy_admin")],
      program.programId
    );
    const [adminConfig] = await PublicKey.findProgramAddress(
      [Buffer.from("admin")],
      program.programId
    );

    await program.methods
      .initialize()
      .accounts({
        deployer: admin.publicKey,
        deployAdmin,
        admin: admin.publicKey,
        adminConfig,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
  });

  it("Creates a vesting schedule", async () => {
    const [adminConfig] = await PublicKey.findProgramAddress(
      [Buffer.from("admin")],
      program.programId
    );
    const [tokenInfo] = await PublicKey.findProgramAddress(
      [
        Buffer.from("token_info"),
        admin.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .initTokenInfo({
        tokenName: "Test Token",
        tokenSymbol: "TEST",
        totalSupply: new anchor.BN(1000000),
        tokenMint: mint,
        mintWalletAddress: admin.publicKey,
      })
      .accounts({
        schedulerAdmin: admin.publicKey,
        tokenInfo,
        adminConfig,
        tokenMint: mint,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const [beneficiaryVault] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vault"),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
        vestingId.toBuffer("le", 8),
      ],
      program.programId
    );

    await program.methods
      .createVesting({
        vestingId,
        totalAmount,
        releasedAmount,
        startTime,
        endTime,
        category,
      })
      .accounts({
        admin: admin.publicKey,
        adminConfig,
        tokenInfo,
        beneficiary: beneficiary.publicKey,
        vestingAccount,
        tokenMint: mint,
        tokenVault: vaultTokenAccount,
        parentVault: vaultTokenAccount,
        beneficiaryVault,
        vaultAuthority,
        beneficiaryTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([admin])
      .rpc();

    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccount
    );
    assert.equal(
      vestingAccountData.beneficiary.toBase58(),
      beneficiary.publicKey.toBase58()
    );
    assert.equal(vestingAccountData.totalAmount.toString(), totalAmount.toString());
  });

  it("Appends a yearly plan", async () => {
    const [adminConfig] = await PublicKey.findProgramAddress(
      [Buffer.from("admin")],
      program.programId
    );
    const plans = [
      {
        releaseTime: new anchor.BN(startTime.toNumber() + 1800), // 30 minutes later
        amount: new anchor.BN(500),
        released: false,
      },
    ];

    await program.methods
      .appendYearlyPlan(plans)
      .accounts({
        vestingAccount,
        planChunk,
        parentPlanChunk: null,
        admin: admin.publicKey,
        adminConfig,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const planChunkData = await program.account.vestingPlanChunk.fetch(
      planChunk
    );
    assert.equal(planChunkData.plans.length, 1);
    assert.equal(
      planChunkData.plans[0].amount.toString(),
      plans[0].amount.toString()
    );
  });

  it("Executes do_vesting", async () => {
    // Wait for the release time to pass
    await new Promise((resolve) =>
      setTimeout(resolve, (startTime.toNumber() + 1800 - Date.now() / 1000 + 5) * 1000)
    );

    const [adminConfig] = await PublicKey.findProgramAddress(
      [Buffer.from("admin")],
      program.programId
    );
    const [tokenInfo] = await PublicKey.findProgramAddress(
      [
        Buffer.from("token_info"),
        admin.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );
    const [originTokenAccount] = await PublicKey.findProgramAddress(
        [
            Buffer.from("vault"),
            beneficiary.publicKey.toBuffer(),
            mint.toBuffer(),
            vestingId.toBuffer("le", 8),
        ],
        program.programId
    );

    const amount = new anchor.BN(500);
    const vestingTime = new anchor.BN(startTime.toNumber() + 1800);

    await program.methods
      .doVesting(amount, vestingTime, { vestingId })
      .accounts({
        admin: admin.publicKey,
        tokenVault: vaultTokenAccount,
        vaultAuthority,
        originTokenAccount,
        destinationTokenAccount: beneficiaryTokenAccount,
        vestingAccount,
        adminConfig,
        planChunk,
        tokenInfo,
        beneficiary: beneficiary.publicKey,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const beneficiaryTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin,
      mint,
      beneficiary.publicKey
    );
    assert.equal(beneficiaryTokenAccountInfo.amount.toString(), amount.toString());

    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccount
    );
    assert.equal(
      vestingAccountData.releasedAmount.toString(),
      amount.toString()
    );
  });
});
