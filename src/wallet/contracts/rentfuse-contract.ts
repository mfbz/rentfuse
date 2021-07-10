import Neon, { sc, u, wallet } from '@cityofzion/neon-js';
import {
	DEFAULT_GAS_PRECISION,
	DEFAULT_NEO_NETWORK_MAGIC,
	DEFAULT_NEO_RPC_ADDRESS,
	DEFAULT_SC_SCRIPTHASH,
	DEFAULT_GAS_SCRIPTHASH,
} from '../constants/default';
import { NEOHelper } from '../helpers/neo-helper';
import { Rent } from '../interfaces/rent';
import * as buffer from 'buffer';

export class RentFuseContract {
	static getRent = async ({ tokenId }: { tokenId: string }) => {
		// The contract object i'll call by using this
		const contract = RentFuseContract.getContract();

		// Invoke the contract to perform a read
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
			sc.ContractParam.hash160(wallet.getScriptHashFromAddress(address)),
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
			sc.ContractParam.hash160(wallet.getScriptHashFromAddress(address)),
			sc.ContractParam.integer(fromIndex !== undefined ? fromIndex : 0),
		]);

		// Parse rent objects from returned stack
		return RentFuseContract.parseRentList(result.stack[0]);
	};

	// Price absolute, it's later added gas precision, duration in ms
	// nftTokenId type is inferred from string value passed, if string passed as string otherwise passed as number
	static createToken = async ({
		nftScriptHash,
		nftTokenId,
		price,
		duration,
		walletContext,
	}: {
		nftScriptHash: string;
		nftTokenId: string;
		price: number;
		duration: number;
		walletContext: any;
	}) => {
		// UInt160 NFTScriptHash, ByteString NFTTokenId, BigInteger price, ulong duration
		const response = await walletContext.invokeFunction(DEFAULT_SC_SCRIPTHASH, 'createToken', [
			sc.ContractParam.hash160(nftScriptHash),
			isNaN(+nftTokenId) ? sc.ContractParam.string(nftTokenId) : sc.ContractParam.integer(nftTokenId),
			sc.ContractParam.integer(Math.ceil(Number(price) * DEFAULT_GAS_PRECISION)),
			sc.ContractParam.integer(duration),
		]);

		// If error thrown an exception
		if (response.result.error && response.result.error.message) {
			throw new Error('An error occurred invoking contract function');
		}

		// Get transaction notification
		const notification = await NEOHelper.findNotificationFromTxId(
			response.result,
			DEFAULT_SC_SCRIPTHASH,
			'TokenCreated',
		);
		return notification !== undefined;
	};

	static withdrawToken = async ({ tokenId, walletContext }: { tokenId: string; walletContext: any }) => {
		// ByteString tokenId
		const response = await walletContext.invokeFunction(DEFAULT_SC_SCRIPTHASH, 'withdrawToken', [
			sc.ContractParam.integer(tokenId),
		]);

		// If error thrown an exception
		if (response.result.error && response.result.error.message) {
			throw new Error('An error occurred invoking contract function');
		}

		// Get transaction notification
		const notification = await NEOHelper.findNotificationFromTxId(
			response.result,
			DEFAULT_SC_SCRIPTHASH,
			'TokenWithdrawn',
		);
		return notification !== undefined;
	};

	static revokeToken = async ({ tokenId, walletContext }: { tokenId: string; walletContext: any }) => {
		// ByteString tokenId
		const response = await walletContext.invokeFunction(DEFAULT_SC_SCRIPTHASH, 'revokeToken', [
			sc.ContractParam.integer(tokenId),
		]);

		// If error thrown an exception
		if (response.result.error && response.result.error.message) {
			throw new Error('An error occurred invoking contract function');
		}

		// Get transaction notification
		const notification = await NEOHelper.findNotificationFromTxId(
			response.result,
			DEFAULT_SC_SCRIPTHASH,
			'TokenRevoked',
		);
		return notification !== undefined;
	};

	static closeToken = async ({ tokenId, walletContext }: { tokenId: string; walletContext: any }) => {
		// ByteString tokenId
		const response = await walletContext.invokeFunction(DEFAULT_SC_SCRIPTHASH, 'closeToken', [
			sc.ContractParam.integer(tokenId),
		]);

		// If error thrown an exception
		if (response.result.error && response.result.error.message) {
			throw new Error('An error occurred invoking contract function');
		}

		// Get transaction notification
		const notification = await NEOHelper.findNotificationFromTxId(
			response.result,
			DEFAULT_SC_SCRIPTHASH,
			'TokenClosed',
		);
		return notification !== undefined;
	};

	static rentToken = async ({
		tokenId,
		amount,
		walletContext,
	}: {
		tokenId: string;
		amount: number;
		walletContext: any;
	}) => {
		// Get address from walletcontext
		const fromAddress = walletContext.accounts[0].split('@')[0];

		// ByteString tokenId
		const response = await walletContext.invokeFunction(DEFAULT_GAS_SCRIPTHASH, 'transfer', [
			sc.ContractParam.hash160(wallet.getScriptHashFromAddress(fromAddress)),
			sc.ContractParam.hash160(DEFAULT_SC_SCRIPTHASH),
			sc.ContractParam.integer(Math.ceil(Number(amount) * DEFAULT_GAS_PRECISION)),
			sc.ContractParam.array(sc.ContractParam.integer(0), sc.ContractParam.integer(tokenId)),
		]);

		// If error thrown an exception
		if (response.result.error && response.result.error.message) {
			throw new Error('An error occurred invoking contract function');
		}

		// Get transaction notification
		const notification = await NEOHelper.findNotificationFromTxId(
			response.result,
			DEFAULT_SC_SCRIPTHASH,
			'TokenRented',
		);
		return notification !== undefined;
	};

	static payToken = async ({
		tokenId,
		amount,
		walletContext,
	}: {
		tokenId: string;
		amount: number;
		walletContext: any;
	}) => {
		// Get address from walletcontext
		const fromAddress = walletContext.accounts[0].split('@')[0];

		// ByteString tokenId
		const response = await walletContext.invokeFunction(DEFAULT_GAS_SCRIPTHASH, 'transfer', [
			sc.ContractParam.hash160(wallet.getScriptHashFromAddress(fromAddress)),
			sc.ContractParam.hash160(DEFAULT_SC_SCRIPTHASH),
			sc.ContractParam.integer(Math.ceil(Number(amount) * DEFAULT_GAS_PRECISION)),
			sc.ContractParam.array(sc.ContractParam.integer(1), sc.ContractParam.integer(tokenId)),
		]);

		// If error thrown an exception
		if (response.result.error && response.result.error.message) {
			throw new Error('An error occurred invoking contract function');
		}

		// Get transaction notification
		const notification = await NEOHelper.findNotificationFromTxId(response.result, DEFAULT_SC_SCRIPTHASH, 'TokenPaid');
		return notification !== undefined;
	};

	private static getContract = () => {
		return new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(DEFAULT_SC_SCRIPTHASH), {
			networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
			rpcAddress: DEFAULT_NEO_RPC_ADDRESS,
		});
	};

	// Accept a stack item to get a rent object from it
	private static parseRent = (item: { type: any; value?: any }) => {
		// buffer.Buffer.from(item.value[0].value, 'base64').toString('hex')
		//console.log(item.value);

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
				nftScriptHash: u.reverseHex(buffer.Buffer.from(item.value[3].value, 'base64').toString('hex')),
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
