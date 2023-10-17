# Solana Connector for AllsTo

## What is Solana Connector for AllsTo

This is the repo for AllsTo connector to Solana blockchain. AllsTo provides a unified yet flexible payment interface for web3 application with broad coverage on fiat and crypto payment methods. AllsTo support 30+ major EVM, non-EVM compatible blockchains including Solana, with minutes-fast, low-cost point-to-point cross-chain payment solution from any supported blockchains to Solana in both directions. Please refer to [AllsTo Docs](https://docs.alls.to) for more information regarding AllsTo.

The AllsTo connector to Solana is the SDK connector to the Solana smart contract which processes all inbound and outbound on-chain transactions of AllsTo payment on Solana blockchains. It wrapped with Solana SDK and is the main AllsTo interface to the Solana blockchains.

## How to use

### Understanding `solpg.ts`

The `solpg.ts` script provides the main functionalities for the AllsTo connector. Before diving into the operations, it's crucial to note that due to network issues with the Solana devnet rpc-node, it is recommended to first run this script within the Solana playground at https://beta.solpg.io/.

Here are the main functionalities provided in the `solpg.ts`:

1. **Constant Declarations**: 
    - This script starts by defining several constants related to the Solana ecosystem such as the public keys for various system components.
    - `ConstantValue` defines buffers for various key operations within the smart contract.

2. **AllstoTransactions Class**:
    - This class contains several methods that represent different transactions and operations that can be conducted with the AllsTo connector on Solana.

    - `initContract`: This method initializes the smart contract with necessary public key addresses, such as authorities and supported coins. It prepares a transaction to be sent on-chain.

    - `addSupportToken`: Enables the addition of a new supported token to the smart contract. This function prepares a transaction to add the provided token's public key to the list of supported tokens.

    - `registerNewPool`: Registers a new pool for a given user. The user (Alice in the script) can register a pool with a specified index.

    - `postSwap`: Used to post a new swap on the Solana blockchain. This function prepares a transaction to initiate a swap between two users.

    - `bondSwap`: Allows a user (Alice in the example) to bond or link an already posted swap with a specific pool.
  
    - `depositAssetsToPool`: Enables a user (payer) to deposit assets into a specified pool. The assets are represented by a mint, and the amount to be deposited is defined. This function prepares the necessary transaction to execute the deposit.
  
    - `lock`: Used to lock assets in preparation for a swap between users. An initiator can lock assets in anticipation of a swap with another user, and the swap details, including the swap id, are encoded within the transaction.
    
    - `release`: Allows for the release of locked assets based on provided signatures. The assets can be released to a specified user once the conditions of the swap are met and verified with the provided signature.
  
    - `executeSwap`: Executes a previously posted swap between two users. The swap details are verified, and the assets are exchanged based on the terms of the swap. The function checks if the assets should be deposited into a pool or directly to a recipient.

3. **Utility Transactions**: 
    - The script ends by creating an instance of the `AllstoTransactions` class and making a call to `initContract`. This showcases how the class can be instantiated and a transaction can be prepared.

### Using `utils.ts`

This script provides utility functions that are essential for operations in `solpg.ts`. Specifically, it contains the `Utils` class that offers a method called `get_swap_id`. This method calculates a unique ID for a swap operation by using the `keccak256` hashing function. This ID ensures that each swap operation is distinct and can be traced efficiently.

### How to Execute
To utilize the functionalities within these scripts:
1. Navigate to the Solana playground: https://beta.solpg.io/.
2. Copy and paste the code from `solpg.ts` into the playground.
3. Ensure that the utility functions from `utils.ts` are available or integrated within the same environment.
4. Execute the script by invoking the required functions or methods.

## Conclusion

The AllsTo connector for Solana is a robust interface for facilitating and managing transactions on the Solana blockchain. By understanding the core functionalities provided in the `solpg.ts` and its supporting utility functions in `utils.ts`, developers can seamlessly integrate AllsTo payments on the Solana blockchain for their applications. Always refer to the official [AllsTo Docs](https://docs.alls.to) for more detailed and updated information.