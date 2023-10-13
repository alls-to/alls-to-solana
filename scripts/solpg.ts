/* 
  Due to some network issues with solana devnet rpc-node, we have to
  write sdk in the solana playground (https://beta.solpg.io/) firstly.
  So you should run these code in the solana playground.
*/

console.log("My address:", pg.wallet.publicKey.toString());

const programId = new web3.PublicKey(
  "zSBkKqXqVf1GuQtjykMdjPGk4JTUG28zGdJtg3CHYT9"
);
const systemId = new web3.PublicKey("11111111111111111111111111111111");

const ConstantValue = {
  CONTRACT_SIGNER: Buffer.from("contract_signer"),
  AUTHORITY_PHRASE: Buffer.from("authority"),
  SUPPORT_COINS_PHRASE: Buffer.from("supported_coins"),
  SAVE_POSTED_SWAP_PHRASE: Buffer.from("posted_swaps"),
  SAVE_LOCKED_SWAP_PHRASE: Buffer.from("locked_swaps"),
  SAVE_OWNER_OF_POOLS_PHRASE: Buffer.from("pool_owners"),
  SAVE_POOL_OF_AUTHORIZED_ADDR_PHRASE: Buffer.from("pool_of_authorized_addr"),
  SAVE_BALANCE_PHRASE: Buffer.from("balance_for_pool_and_token"),
  ZERO_POSTED_SWAP: Buffer.alloc(60, 0),
  ZERO_LOCKED_SWAP: Buffer.alloc(48, 0),
};

class AllstoTransactions {
  program_id: web3.PublicKey;

  constructor(program_id: web3.PublicKey) {
    this.program_id = program_id;
  }

  initContract(payer_pubkey: web3.PublicKey) {
    const [auth_pda, _b1] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("authority")],
      this.program_id
    );
    const [token_list_pda, _b2] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("supported_coins")],
      this.program_id
    );
    const [save_poaa_pubkey_admin, _b3] = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_POOL_OF_AUTHORIZED_ADDR_PHRASE"],
        payer_pubkey.toBuffer(),
      ],
      this.program_id
    );
    const [save_oop_pubkey_admin, _b4] = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_OWNER_OF_POOLS_PHRASE"],
        Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
      ],
      this.program_id
    );

    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: payer_pubkey, isSigner: false, isWritable: false },
          { pubkey: systemId, isSigner: false, isWritable: false },
          { pubkey: auth_pda, isSigner: false, isWritable: true },
          { pubkey: token_list_pda, isSigner: false, isWritable: true },
          { pubkey: save_poaa_pubkey_admin, isSigner: false, isWritable: true },
          { pubkey: save_oop_pubkey_admin, isSigner: false, isWritable: true },
        ],
        data: Buffer.from([0]),
        programId: programId,
      })
    );
    return transaction;
  }
}

const allsto = new AllstoTransactions(programId);
const tx = allsto.initContract(pg.wallet.publicKey);
console.log(tx.instructions);

// const txHash = await web3.sendAndConfirmTransaction(
//   pg.connection,
//   transaction,
//   [pg.wallet.keypair]
// );
// console.log("Transaction sent with hash:", txHash);
