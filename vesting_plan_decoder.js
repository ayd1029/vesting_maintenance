const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const { Connection, PublicKey } = require('@solana/web3.js');

// 1. IDL 파일 로드
let idl;
try {
    idl = JSON.parse(fs.readFileSync('./target/idl/vesting.json', 'utf8'));
} catch (err) {
    // Fallback for original path
    try {
        idl = JSON.parse(fs.readFileSync('./vesting.json', 'utf8'));
    } catch (e) {
        console.error("Failed to load vesting.json from ./target/idl/vesting.json or ./vesting.json");
        process.exit(1);
    }
}


async function decodeVestingPlan(address) {
    try {
        // Solana connection
        const connection = new Connection("https://api.devnet.solana.com");
        const publicKey = new PublicKey(address);

        // Get account info
        const accountInfo = await connection.getAccountInfo(publicKey);
        if (!accountInfo) {
            throw new Error(`Account not found: ${address}`);
        }
        const dataBuffer = accountInfo.data;

        // Anchor Coder를 IDL을 이용해 생성합니다.
        const coder = new anchor.BorshAccountsCoder(idl);

        // Coder를 사용해 버퍼를 'VestingPlanChunk' 계정 형식으로 디코딩합니다.
        const decodedData = coder.decode('VestingPlanChunk', dataBuffer);

        return decodedData;

  } catch (e) {
    console.error("데이터 디코딩에 실패했습니다:", e);
    console.log("IDL 파일이 정확한지, 계정 이름('VestingPlanChunk')이 올바른지 확인해 보세요.");
    throw e;
  }
}

module.exports = { decodeVestingPlan };