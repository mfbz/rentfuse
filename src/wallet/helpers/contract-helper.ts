import Neon, { sc } from '@cityofzion/neon-js';
import { DEFAULT_SC_SCRIPTHASH, DEFAULT_NEO_NETWORK_MAGIC, DEFAULT_NEO_RPC_ADDRESS } from '../constants/default';
import * as buffer from 'buffer';

export class ContractHelper {
	static getRent = async ({ tokenId }: { tokenId: string }) => {
		// The contract object i'll call by using this
		const contract = new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(DEFAULT_SC_SCRIPTHASH), {
			networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
			rpcAddress: DEFAULT_NEO_RPC_ADDRESS,
		});

		// Invoke the contract to perform a read (NB: Methods are always camel case and string are passed as integers! :O)
		const result = await contract.testInvoke('getRent', [sc.ContractParam.integer(tokenId)]);

		console.log(result);
		console.log(Neon.u.hexstring2str(buffer.Buffer.from('AQ==', 'base64').toString('hex')));
	};

	static getRentList = async ({ fromIndex }: { fromIndex?: number }) => {
		// The contract object i'll call by using this
		const contract = new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(DEFAULT_SC_SCRIPTHASH), {
			networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
			rpcAddress: DEFAULT_NEO_RPC_ADDRESS,
		});

		// Invoke the contract to perform a read
		const result = await contract.testInvoke('getRentList', [
			sc.ContractParam.integer(fromIndex !== undefined ? fromIndex : 0),
		]);

		console.log(result);
	};
}
