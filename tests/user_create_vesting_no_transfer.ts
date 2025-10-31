
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
  let parentVestingAccount: PublicKey;
  let parentPlanChunk: PublicKey;
  let userVestingAccount: PublicKey;
  let userPlanChunk: PublicKey;

  const parentVestingId = new anchor.BN(1);
  const userVestingId = new anchor.BN(2);
  const totalAmount = new anchor.BN(1000);
  const category = "team";

  before(async () => {
    admin = Keypair.generate();
    beneficiary = Keypair.generate();

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

    mint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );

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

    await mintTo(
      provider.connection,
      admin,
      mint,
      adminTokenAccount,
      admin,
      1000000
    );

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
    [parentVestingAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vesting"),
        admin.publicKey.toBuffer(),
        mint.toBuffer(),
        parentVestingId.toBuffer("le", 8),
      ],
      program.programId
    );
    [parentPlanChunk] = await PublicKey.findProgramAddress(
      [Buffer.from("plans"), parentVestingAccount.toBuffer()],
      program.programId
    );
    [userVestingAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vesting"),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
        userVestingId.toBuffer("le", 8),
      ],
      program.programId
    );
    [userPlanChunk] = await PublicKey.findProgramAddress(
      [Buffer.from("plans"), userVestingAccount.toBuffer()],
      program.programId
    );
  });

  it("Initializes and creates a parent vesting schedule", async () => {
    const [deployAdmin] = await PublicKey.findProgramAddress(
      [Buffer.from("deploy_admin")],
      program.programId
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

    await program.methods
      .initializeDeployer()
      .accounts({ deployer: admin.publicKey, deployAdmin, systemProgram: SystemProgram.programId })
      .signers([admin])
      .rpc();

    await program.methods
      .initialize()
      .accounts({ deployer: admin.publicKey, deployAdmin, admin: admin.publicKey, adminConfig, systemProgram: SystemProgram.programId })
      .signers([admin])
      .rpc();

    await program.methods
      .initTokenInfo({
        tokenName: "Test Token",
        tokenSymbol: "TEST",
        totalSupply: new anchor.BN(1000000),
        tokenMint: mint,
        mintWalletAddress: admin.publicKey,
      })
      .accounts({ schedulerAdmin: admin.publicKey, tokenInfo, adminConfig, tokenMint: mint, systemProgram: SystemProgram.programId })
      .signers([admin])
      .rpc();

    const [parentBeneficiaryVault] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vault"),
        admin.publicKey.toBuffer(),
        mint.toBuffer(),
        parentVestingId.toBuffer("le", 8),
      ],
      program.programId
    );

    await program.methods
      .createVesting({
        vestingId: parentVestingId,
        totalAmount,
        releasedAmount: new anchor.BN(0),
        startTime: new anchor.BN(Date.now() / 1000),
        endTime: new anchor.BN(Date.now() / 1000 + 3600),
        category,
      })
      .accounts({
        admin: admin.publicKey,
        adminConfig,
        tokenInfo,
        beneficiary: admin.publicKey,
        vestingAccount: parentVestingAccount,
        tokenMint: mint,
        tokenVault: vaultTokenAccount,
        parentVault: vaultTokenAccount,
        beneficiaryVault: parentBeneficiaryVault,
        vaultAuthority,
        beneficiaryTokenAccount: adminTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([admin])
      .rpc();

      const plans = [
        {
          releaseTime: new anchor.BN(Date.now() / 1000 + 1800),
          amount: new anchor.BN(500),
          released: false,
        },
        {
            releaseTime: new anchor.BN(Date.now() / 1000 + 3600),
            amount: new anchor.BN(500),
            released: false,
        },
      ];
  
      await program.methods
        .appendYearlyPlan(plans)
        .accounts({
          vestingAccount: parentVestingAccount,
          planChunk: parentPlanChunk,
          parentPlanChunk: null,
          admin: admin.publicKey,
          adminConfig,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
  });

  it("Creates a user vesting schedule without transferring tokens", async () => {
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
    const [beneficiaryVault] = await PublicKey.findProgramAddress(
      [
        Buffer.from("vault"),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
        userVestingId.toBuffer("le", 8),
      ],
      program.programId
    );

    const sameAmount = new anchor.BN(500);

    await program.methods
      .userCreateVesting({
        vestingId: userVestingId,
        totalAmount: sameAmount,
        releasedAmount: sameAmount, // Set totalAmount and releasedAmount to the same value
        startTime: new anchor.BN(Date.now() / 1000),
        endTime: new anchor.BN(Date.now() / 1000 + 3600),
        category,
      })
      .accounts({
        admin: admin.publicKey,
        adminConfig,
        tokenInfo,
        beneficiary: beneficiary.publicKey,
        vestingAccount: userVestingAccount,
        tokenMint: mint,
        tokenVault: vaultTokenAccount,
        parentVault: vaultTokenAccount,
        beneficiaryVault,
        vaultAuthority,
        beneficiaryTokenAccount,
        parentVestingAccount,
        parentPlanChunk,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([admin])
      .rpc();

    const userVestingAccountData = await program.account.vestingAccount.fetch(
      userVestingAccount
    );
    assert.equal(
      userVestingAccountData.beneficiary.toBase58(),
      beneficiary.publicKey.toBase58()
    );
    assert.equal(userVestingAccountData.totalAmount.toString(), sameAmount.toString());
    assert.equal(userVestingAccountData.releasedAmount.toString(), sameAmount.toString());

    const beneficiaryVaultInfo = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        admin,
        mint,
        beneficiary.publicKey
      );
    assert.equal(beneficiaryVaultInfo.amount.toString(), "0"); // No tokens should be transferred
  });

  it("Appends a yearly plan to the user vesting account", async () => {
    const [adminConfig] = await PublicKey.findProgramAddress(
        [Buffer.from("admin")],
        program.programId
      );
      const plans = [
        {
          releaseTime: new anchor.BN(Date.now() / 1000 + 1800), 
          amount: new anchor.BN(500),
          released: false,
        },
      ];
  
      await program.methods
        .appendYearlyPlan(plans)
        .accounts({
          vestingAccount: userVestingAccount,
          planChunk: userPlanChunk,
          parentPlanChunk: parentPlanChunk,
          admin: admin.publicKey,
          adminConfig,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
  
      const planChunkData = await program.account.vestingPlanChunk.fetch(
        userPlanChunk
      );
      assert.equal(planChunkData.plans.length, 1);
      assert.equal(
        planChunkData.plans[0].amount.toString(),
        plans[0].amount.toString()
      );
  });
});
