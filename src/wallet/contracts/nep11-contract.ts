import Neon, { sc, u } from '@cityofzion/neon-js';
import { DEFAULT_NEO_NETWORK_MAGIC, DEFAULT_NEO_RPC_ADDRESS } from '../constants/default';
import { NFT } from '../interfaces/nft';

export class NEP11Contract {
	static getNFT = async ({ scriptHash, tokenId }: { scriptHash: string, tokenId: string }) => {
		// Get needed data calling the contract
		const symbol = await NEP11Contract.getSymbol({ scriptHash });
		const properties = await NEP11Contract.getProperties({ scriptHash, tokenId });

		return {
			symbol,
			scriptHash,
			tokenId,
			properties,
		} as NFT;
	};

	private static getSymbol = async ({ scriptHash }: { scriptHash: string }) => {
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

	private static getProperties = async ({ scriptHash, tokenId }: { scriptHash: string; tokenId: string }) => {
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
