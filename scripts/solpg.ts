/* 
  Due to some network issues with solana devnet rpc-node, we have to
  write sdk in the solana playground (https://beta.solpg.io/) firstly.
  So you should run these code in the solana playground.
*/
import Utils from "./utils";

console.log("My address:", pg.wallet.publicKey.toString());

const programId = new web3.PublicKey(
  "zSBkKqXqVf1GuQtjykMdjPGk4JTUG28zGdJtg3CHYT9"
);
const systemId = new web3.PublicKey("11111111111111111111111111111111");
const splTokenId = new web3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

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
        programId: this.program_id,
      })
    );
    return transaction;
  }

  addSupportToken(
    payer_pubkey: web3.PublicKey,
    auth_pda: web3.PublicKey,
    token_list_pda: web3.PublicKey,
    mint_pubkey: web3.PublicKey,
    token_id_expected: number
  ) {
    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: payer_pubkey, isSigner: false, isWritable: false },
          { pubkey: auth_pda, isSigner: false, isWritable: true },
          { pubkey: token_list_pda, isSigner: false, isWritable: true },
          { pubkey: mint_pubkey, isSigner: false, isWritable: true },
        ],
        data: Buffer.from([2, token_id_expected]),
        programId: this.program_id,
      })
    );
    return transaction;
  }

  registerNewPool(alice_pubkey: web3.PublicKey, alice_pool_index: number) {
    const [save_poaa_pubkey_alice, _b1] = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_POOL_OF_AUTHORIZED_ADDR_PHRASE"],
        alice_pubkey.toBuffer(),
      ],
      this.program_id
    );

    const [save_oop_pubkey_alice, _b2] = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_OWNER_OF_POOLS_PHRASE"],
        Buffer.from(alice_pool_index.toString(16).padStart(16, "0"), "hex"),
      ],
      this.program_id
    );

    const data_input_array = Buffer.from([
      3,
      ...Buffer.from(alice_pool_index.toString(16).padStart(16, "0"), "hex"),
    ]);

    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: alice_pubkey, isSigner: false, isWritable: false },
        { pubkey: systemId, isSigner: false, isWritable: false },
        { pubkey: alice_pubkey, isSigner: false, isWritable: false },
        { pubkey: save_poaa_pubkey_alice, isSigner: false, isWritable: true },
        { pubkey: save_oop_pubkey_alice, isSigner: false, isWritable: true },
      ],
      data: data_input_array,
      programId: this.program_id,
    });

    const transaction = new web3.Transaction().add(instruction);
    return transaction;
  }

  postSwap(
    encoded_swap: Buffer,
    signature_request: Buffer,
    initiator: Buffer,
    payer_pubkey: web3.PublicKey,
    bob_pubkey: web3.PublicKey,
    mint_pubkey: web3.PublicKey,
    ta_bob_pubkey: web3.PublicKey,
    ta_program_pubkey: web3.PublicKey,
    token_list_pda: web3.PublicKey
  ) {
    const now_timestamp = Math.floor(Date.now() / 1000);
    const expire_time_expect = Buffer.from(
      (now_timestamp + 3600).toString(16).padStart(16, "0"),
      "hex"
    );
    encoded_swap.set(expire_time_expect.slice(3, 8), 21);

    const [save_ps_pubkey, _] = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["SAVE_POSTED_SWAP_PHRASE"], encoded_swap],
      this.program_id
    );

    const data_input_array = Buffer.alloc(125, 4);
    data_input_array.set(encoded_swap, 1);
    data_input_array.set(signature_request, 33);
    data_input_array.set(initiator, 97);
    data_input_array.writeUIntBE(0, 117, 8);

    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: payer_pubkey, isSigner: true, isWritable: true },
        { pubkey: systemId, isSigner: false, isWritable: false },
        { pubkey: bob_pubkey, isSigner: true, isWritable: true },
        { pubkey: mint_pubkey, isSigner: false, isWritable: false },
        { pubkey: splTokenId, isSigner: false, isWritable: false },
        { pubkey: token_list_pda, isSigner: false, isWritable: true },
        { pubkey: save_ps_pubkey, isSigner: false, isWritable: true },
        { pubkey: ta_bob_pubkey, isSigner: false, isWritable: false },
        { pubkey: ta_program_pubkey, isSigner: false, isWritable: false },
      ],
      data: data_input_array,
      programId: this.program_id,
    });

    const transaction = new web3.Transaction().add(instruction);
    return transaction;
  }

  bondSwap(
    alice_pubkey: web3.PublicKey,
    encoded_swap: Buffer,
    alice_pool_index: number
  ): web3.Transaction {
    const data_input_array = Buffer.alloc(41);
    data_input_array[0] = 5;
    encoded_swap.copy(data_input_array, 1, 0, 32);
    data_input_array.writeUIntBE(alice_pool_index, 33, 8);

    const save_poaa_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_POOL_OF_AUTHORIZED_ADDR_PHRASE"],
        alice_pubkey.toBuffer(),
      ],
      this.program_id
    )[0];

    const save_ps_pubkey = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["SAVE_POSTED_SWAP_PHRASE"], encoded_swap],
      this.program_id
    )[0];

    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: alice_pubkey, isSigner: true, isWritable: false },
          {
            pubkey: save_poaa_pubkey_alice,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: save_ps_pubkey, isSigner: false, isWritable: false },
        ],
        data: data_input_array,
        programId: this.program_id,
      })
    );

    return transaction;
  }

  depositAssetsToPool(
    payer_pubkey: web3.PublicKey,
    mint_pubkey: web3.PublicKey,
    alice_pubkey: web3.PublicKey,
    alice_pool_index: number,
    coin_index: number,
    deposit_amount: number,
    token_list_pda: web3.PublicKey,
    ta_alice_pubkey: web3.PublicKey,
    ta_program_pubkey: web3.PublicKey
  ): web3.Transaction {
    const data_input_array = Buffer.alloc(18);
    data_input_array[0] = 8;
    data_input_array.writeUIntBE(alice_pool_index, 1, 8);
    data_input_array[9] = coin_index;
    data_input_array.writeUIntBE(deposit_amount, 10, 8);

    const save_poaa_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_POOL_OF_AUTHORIZED_ADDR_PHRASE"],
        alice_pubkey.toBuffer(),
      ],
      this.program_id
    )[0];

    const save_balance_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_BALANCE_PHRASE"],
        Buffer.from(Uint8Array.from([alice_pool_index])),
        Buffer.from(Uint8Array.from([coin_index])),
      ],
      this.program_id
    )[0];

    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: payer_pubkey, isSigner: true, isWritable: false },
          { pubkey: systemId, isSigner: false, isWritable: false },
          { pubkey: alice_pubkey, isSigner: true, isWritable: false },
          { pubkey: mint_pubkey, isSigner: false, isWritable: false },
          { pubkey: splTokenId, isSigner: false, isWritable: false },
          { pubkey: token_list_pda, isSigner: false, isWritable: false },
          {
            pubkey: save_poaa_pubkey_alice,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: save_balance_pubkey_alice,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: ta_alice_pubkey, isSigner: false, isWritable: false },
          { pubkey: ta_program_pubkey, isSigner: false, isWritable: false },
        ],
        data: data_input_array,
        programId: this.program_id,
      })
    );

    return transaction;
  }

  lock(
    payer_pubkey: web3.PublicKey,
    mint_pubkey: web3.PublicKey,
    initiator: Uint8Array,
    bob_pubkey: web3.PublicKey,
    alice_pool_index: number,
    coin_index: number,
    encoded_swap: Uint8Array,
    fake_signature_request: Uint8Array,
    alice_pubkey: web3.PublicKey,
    token_list_pda: web3.PublicKey
  ): web3.Transaction {
    const swap_id = Utils.get_swap_id(encoded_swap, initiator);

    const save_si_pubkey = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["SAVE_LOCKED_SWAP_PHRASE"], swap_id],
      this.program_id
    )[0];

    const save_poaa_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_POOL_OF_AUTHORIZED_ADDR_PHRASE"],
        alice_pubkey.toBuffer(),
      ],
      this.program_id
    )[0];

    const save_balance_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_BALANCE_PHRASE"],
        Buffer.from(Uint8Array.from([alice_pool_index])),
        Buffer.from(Uint8Array.from([coin_index])),
      ],
      this.program_id
    )[0];

    const data_input_array = Buffer.alloc(149);
    data_input_array[0] = 10;
    data_input_array.set(encoded_swap, 1);
    data_input_array.set(fake_signature_request, 33);
    data_input_array.set(initiator, 97);
    data_input_array.set(bob_pubkey.toBuffer(), 117);

    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: payer_pubkey, isSigner: true, isWritable: false },
          { pubkey: systemId, isSigner: false, isWritable: false },
          { pubkey: alice_pubkey, isSigner: true, isWritable: false },
          { pubkey: mint_pubkey, isSigner: false, isWritable: false },
          { pubkey: save_si_pubkey, isSigner: false, isWritable: false },
          { pubkey: token_list_pda, isSigner: false, isWritable: false },
          {
            pubkey: save_poaa_pubkey_alice,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: save_balance_pubkey_alice,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: data_input_array,
        programId: this.program_id,
      })
    );

    return transaction;
  }

  release(
    payer_pubkey: web3.PublicKey,
    mint_pubkey: web3.PublicKey,
    encoded_swap: Buffer,
    signature_release: Buffer,
    initiator: Buffer,
    coin_index: number,
    ta_bob_pubkey: web3.PublicKey,
    ta_program_pubkey: web3.PublicKey
  ): web3.Transaction {
    const save_balance_pubkey_manager = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_BALANCE_PHRASE"],
        Buffer.from(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0])),
        Buffer.from(Uint8Array.from([coin_index])),
      ],
      this.program_id
    )[0];

    const save_oop_pubkey_manager = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_OWNER_OF_POOLS_PHRASE"],
        Buffer.from(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0])),
      ],
      this.program_id
    )[0];

    const save_si_pubkey = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["SAVE_LOCKED_SWAP_PHRASE"]],
      this.program_id
    )[0];

    const contract_signer_pubkey = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["CONTRACT_SIGNER"]],
      this.program_id
    )[0];

    const data_input_array = Buffer.alloc(117);
    data_input_array[0] = 12;
    data_input_array.set(encoded_swap, 1);
    data_input_array.set(signature_release, 33);
    data_input_array.set(initiator, 97);

    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: payer_pubkey, isSigner: true, isWritable: false },
          { pubkey: systemId, isSigner: false, isWritable: false },
          { pubkey: mint_pubkey, isSigner: false, isWritable: false },
          { pubkey: splTokenId, isSigner: false, isWritable: false },
          { pubkey: save_si_pubkey, isSigner: false, isWritable: false },
          {
            pubkey: save_oop_pubkey_manager,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: save_balance_pubkey_manager,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: ta_bob_pubkey, isSigner: false, isWritable: false },
          { pubkey: ta_program_pubkey, isSigner: false, isWritable: false },
          {
            pubkey: contract_signer_pubkey,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: data_input_array,
        programId: this.program_id,
      })
    );

    return transaction;
  }

  executeSwap(
    mint_pubkey: web3.PublicKey,
    encoded_swap: Buffer,
    signature_release: Buffer,
    recipient: Buffer,
    alice_pool_index: number,
    coin_index: number,
    ta_alice_pubkey: web3.PublicKey,
    ta_program_pubkey: web3.PublicKey
  ): web3.Transaction {
    const data_input_array = Buffer.alloc(118);
    data_input_array[0] = 7;
    data_input_array.set(encoded_swap, 1);
    data_input_array.set(signature_release, 33);
    data_input_array.set(recipient, 97);
    data_input_array[117] = 1; // deposit to pool?

    const save_ps_pubkey = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["SAVE_POSTED_SWAP_PHRASE"], encoded_swap],
      this.program_id
    )[0];

    const contract_signer_pubkey = web3.PublicKey.findProgramAddressSync(
      [ConstantValue["CONTRACT_SIGNER"]],
      this.program_id
    )[0];

    const save_oop_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_OWNER_OF_POOLS_PHRASE"],
        Buffer.from(alice_pool_index.toString(16).padStart(16, "0"), "hex"),
      ],
      this.program_id
    )[0];

    const save_balance_pubkey_alice = web3.PublicKey.findProgramAddressSync(
      [
        ConstantValue["SAVE_BALANCE_PHRASE"],
        Buffer.from(Uint8Array.from([alice_pool_index])),
        Buffer.from(Uint8Array.from([coin_index])),
      ],
      this.program_id
    )[0];

    const transaction = new web3.Transaction().add(
      new web3.TransactionInstruction({
        keys: [
          { pubkey: mint_pubkey, isSigner: false, isWritable: false },
          { pubkey: splTokenId, isSigner: false, isWritable: false },
          { pubkey: save_ps_pubkey, isSigner: false, isWritable: false },
          { pubkey: save_oop_pubkey_alice, isSigner: false, isWritable: false },
          {
            pubkey: save_balance_pubkey_alice,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: ta_alice_pubkey, isSigner: false, isWritable: false },
          { pubkey: ta_program_pubkey, isSigner: false, isWritable: false },
          {
            pubkey: contract_signer_pubkey,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: data_input_array,
        programId: this.program_id,
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
