import { keccak256 } from 'js-sha3';  // You might need to install this library

export class Utils {
  static get_swap_id(encoded_swap: Uint8Array, initiator: Uint8Array): Uint8Array {
    const buf = new Uint8Array(52);
    buf.set(encoded_swap, 0);
    buf.set(initiator, 32);
    return new Uint8Array(keccak256.arrayBuffer(buf));
  }
}
