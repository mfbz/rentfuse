import { Account } from '@cityofzion/neon-core/lib/wallet';
import Neon, { wallet } from '@cityofzion/neon-js';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';

// Folders access utils
const BASE_DIR = process.cwd();
const WALLETS_DIR = path.join(BASE_DIR, 'wallets');

// Variables to change for different deploy
const RPC_URL = 'https://testnet1.neo.coz.io:443';
const NETWORK_MAGIC = 844378958;
const SC_SCRIPTHASH = '0xe91c69379c44bd6abe15c52b52549d6aaa0ea3d9';
const WALLET_JSON = JSON.parse(fs.readFileSync(path.join(WALLETS_DIR, 'TestNet-MFBZ.neo-wallet.json'), 'utf8'));

// To get command line arguments
// --password=
const argv = yargs(process.argv.slice(2)).argv as any;
console.log(argv.password);

// The function that publish an invoke method
const publishInvoke = async (
	rpcAddress: string,
	networkMagic: number,
	scriptHash: string,
	operation: string,
	args: any[],
	account: Account,
) => {
	const contract = new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(scriptHash), {
		networkMagic,
		rpcAddress,
		account,
	});

	let result;
	try {
		result = await contract.invoke(operation, args);
	} catch (e) {
		console.log(e);
	}

	return result;
};

// Execute the command asynchronously
(async () => {
	// Get wallet accounts from json
	const walletAccounts = WALLET_JSON.accounts;

	// Get the account from the wallets (Take first one as default)
	const account = new wallet.Account(walletAccounts[0].key);
	// Decrypt it with argument password
	try {
		await account.decrypt(argv.password || '');
	} catch (e) {
		console.error('Incorrect password');
		return;
	}

	try {
		// Invoke a signed transaction
		const result = await publishInvoke(
			RPC_URL,
			NETWORK_MAGIC,
			SC_SCRIPTHASH,
			'mint',
			[
				`{"name”:”Rolling”,”description”:”The concept of motion expressed by moving objects.”,”image":"https://media.giphy.com/media/l2RnD5T2Aq0HWRfhe/giphy.gif"}`,
			],
			account,
		);

		console.log('Contract correctly invoken with {{TXID}} (A reference transaction ID):');
		console.log(result);
	} catch (e) {
		console.error(e.message || 'An error occurred while invoking the contract');
	}
})();
