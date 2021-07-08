import Neon, { sc, u } from '@cityofzion/neon-js';
import { DEFAULT_NEO_NETWORK_MAGIC, DEFAULT_NEO_RPC_ADDRESS } from '../constants/default';
import * as buffer from 'buffer';

export class NEP11Contract {
	static getSymbol = async ({ scriptHash }: { scriptHash: string }) => {
		// The contract object from scripthash
		const contract = new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(scriptHash), {
			networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
			rpcAddress: DEFAULT_NEO_RPC_ADDRESS,
		});

		// Invoke the contract to perform a read
		const result = await contract.testInvoke('symbol', []);
		// Parse rent into a rent object
		return u.HexString.fromBase64(result.stack[0].value as string).toAscii();
	};

	static getProperties = async ({ scriptHash, tokenId }: { scriptHash: string; tokenId: string }) => {
		// The contract object from scripthash
		const contract = new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(scriptHash), {
			networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
			rpcAddress: DEFAULT_NEO_RPC_ADDRESS,
		});

		// Invoke the contract to perform a read
		const result = await contract.testInvoke('properties', [
			isNaN(+tokenId) ? sc.ContractParam.string(tokenId) : sc.ContractParam.integer(tokenId),
		]);
		// Parse rent into a rent object
		return JSON.parse(u.HexString.fromBase64(result.stack[0].value as string).toAscii());
	};
}
