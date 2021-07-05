import Neon, { sc, wallet, u } from '@cityofzion/neon-js';
import { DEFAULT_SC_SCRIPTHASH, DEFAULT_NEO_NETWORK_MAGIC, DEFAULT_NEO_RPC_ADDRESS } from '../constants/default';
import * as buffer from 'buffer';
import { Rent } from '../interfaces/rent';

export class RentFuseContract {
	static getContract = () => {
		return new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(DEFAULT_SC_SCRIPTHASH), {
			networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
			rpcAddress: DEFAULT_NEO_RPC_ADDRESS,
		});
	};

	static getRent = async ({ tokenId }: { tokenId: string }) => {
		// The contract object i'll call by using this
		const contract = RentFuseContract.getContract();

		// Invoke the contract to perform a read (NB: Methods are always camel case and string are passed as integers! :O)
		const result = await contract.testInvoke('getRent', [sc.ContractParam.integer(tokenId)]);
		// Parse rent into a rent object
		return RentFuseContract.parseRent(result.stack[0]);
	};

	static getRentList = async ({ fromIndex }: { fromIndex?: number }) => {
		// The contract object i'll call by using this
		const contract = RentFuseContract.getContract();

		// Invoke the contract to perform a read
		const result = await contract.testInvoke('getRentList', [
			sc.ContractParam.integer(fromIndex !== undefined ? fromIndex : 0),
		]);

		// Parse rent objects from returned stack
		return RentFuseContract.parseRentList(result.stack[0]);
	};

	static getRentListAsOwner = async ({ address, fromIndex }: { address: string; fromIndex?: number }) => {
		// The contract object i'll call by using this
		const contract = RentFuseContract.getContract();

		// Invoke the contract to perform a read
		const result = await contract.testInvoke('getRentListAsOwner', [
			sc.ContractParam.hash160(address),
			sc.ContractParam.integer(fromIndex !== undefined ? fromIndex : 0),
		]);

		// Parse rent objects from returned stack
		return RentFuseContract.parseRentList(result.stack[0]);
	};

	static getRentListAsTenant = async ({ address, fromIndex }: { address: string; fromIndex?: number }) => {
		// The contract object i'll call by using this
		const contract = RentFuseContract.getContract();

		// Invoke the contract to perform a read
		const result = await contract.testInvoke('getRentListAsTenant', [
			sc.ContractParam.hash160(address),
			sc.ContractParam.integer(fromIndex !== undefined ? fromIndex : 0),
		]);

		// Parse rent objects from returned stack
		return RentFuseContract.parseRentList(result.stack[0]);
	};

	// Accept a stack item to get a rent object from it
	// TODO SAVEEEEEEEE AND APPLY THE CHANGES TO RENTFUSE PARSE
	private static parseRent = (item: { type: any; value?: any }) => {
		if (Array.isArray(item.value) && item.value.length == 13) {
			return {
				tokenId: buffer.Buffer.from(item.value[0].value, 'base64').toString('hex'),
				owner: wallet.getAddressFromScriptHash(
					u.reverseHex(buffer.Buffer.from(item.value[1].value, 'base64').toString('hex')),
				),
				tenant: item.value[2].value
					? wallet.getAddressFromScriptHash(
							u.reverseHex(buffer.Buffer.from(item.value[2].value, 'base64').toString('hex')),
					  )
					: null,
				nftScriptHash: wallet.getAddressFromScriptHash(
					u.reverseHex(buffer.Buffer.from(item.value[3].value, 'base64').toString('hex')),
				),
				nftTokenId:
					item.value[4].type === 'ByteString'
						? buffer.Buffer.from(item.value[4].value, 'base64').toString('hex')
						: item.value[4].value,
				price: +item.value[5].value,
				balance: +item.value[6].value,
				amount: +item.value[7].value,
				state: +item.value[8].value,
				duration: +item.value[9].value,
				createdOn: +item.value[10].value,
				rentedOn: +item.value[11].value,
				closedOn: +item.value[12].value,
			} as Rent;
		}
		return null;
	};

	private static parseRentList = (item: { type: any; value?: any }) => {
		const rentList = [];

		if (Array.isArray(item.value)) {
			for (const element of item.value) {
				const rent = RentFuseContract.parseRent(element);
				if (rent !== null) {
					rentList.push(rent);
				}
			}
		}

		return rentList;
	};
}
