import yargs from 'yargs/yargs';
import path from 'path';
import fs from 'fs';
import { sc, wallet } from '@cityofzion/neon-js';
import { deployContract } from './neon-experimental';

// Folders access utils
const BASE_DIR = process.cwd();
const WALLETS_DIR = path.join(BASE_DIR, 'wallets');
const CONTRACTS_DIR = path.join(BASE_DIR, 'contracts');

// Variables to change for different deploy
const RPC_URL = 'https://testnet1.neo.coz.io:443';
const NETWORK_MAGIC = 844378958;
const CONTRACT_FILE_PATH = path.join(CONTRACTS_DIR, 'DummyNFT/bin/sc/DummyNFTContract.nef');
const WALLET_JSON = JSON.parse(fs.readFileSync(path.join(WALLETS_DIR, 'TestNet-MFBZ.neo-wallet.json'), 'utf8'));
const MANIFEST_JSON = JSON.parse(
	fs.readFileSync(path.join(CONTRACTS_DIR, 'DummyNFT/bin/sc/DummyNFTContract.manifest.json'), 'utf8'),
);

// To get command line arguments
// --password=
const argv = yargs(process.argv.slice(2)).argv as any;
console.log(argv.password);

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

	// Contract to deploy buffer
	let contractByteCode: Buffer;
	try {
		contractByteCode = await fs.promises.readFile(CONTRACT_FILE_PATH, null);
	} catch (e) {
		console.error(`Could not read contract: ${CONTRACT_FILE_PATH}`);
		return;
	}

	try {
		const manifestJson = MANIFEST_JSON;

		if (
			!manifestJson.abi ||
			!manifestJson.extra ||
			!manifestJson.groups ||
			!manifestJson.name ||
			!manifestJson.permissions ||
			!manifestJson.supportedstandards ||
			!manifestJson.trusts
		) {
			throw Error('Could not deploy the contract as manifest was incomplete');
		}
		const manifest = sc.ContractManifest.fromJson(manifestJson);
		const result = await deployContract(sc.NEF.fromBuffer(contractByteCode), manifest, {
			networkMagic: NETWORK_MAGIC,
			rpcAddress: RPC_URL,
			account,
		});

		console.log('Contract correctly deployed');
		console.log(result);
	} catch (e) {
		console.error(e.message || 'Could not deploy contract: Unknown error');
	}
})();
