import Neon, { sc } from '@cityofzion/neon-js';
import * as buffer from 'buffer';
import yargs from 'yargs/yargs';

// Folders access utils
const BASE_DIR = process.cwd();

// Variables to change for different deploy
const RPC_URL = 'https://testnet1.neo.coz.io:443';
const NETWORK_MAGIC = 844378958;
const SC_SCRIPTHASH = '0xe91c69379c44bd6abe15c52b52549d6aaa0ea3d9';

// To get command line arguments
// --password=
const argv = yargs(process.argv.slice(2)).argv as any;
console.log(argv.password);

// The function that test an invoke method
const testInvoke = async (
	rpcAddress: string,
	networkMagic: number,
	scriptHash: string,
	operation: string,
	args: any[],
) => {
	const contract = new Neon.experimental.SmartContract(Neon.u.HexString.fromHex(scriptHash), {
		networkMagic,
		rpcAddress,
	});
	let res = await contract.testInvoke(operation, args);

	return res;
};

// Execute the command asynchronously
(async () => {
	try {
		// Invoke a signed transaction
		const result = await testInvoke(RPC_URL, NETWORK_MAGIC, SC_SCRIPTHASH, 'properties', [
			sc.ContractParam.integer('4'),
		]);

		console.log('Contract correctly test invoked');
		console.log(result);

		console.log('Parsed result:');
		// NB: Parse the result as string
		console.log(Neon.u.HexString.fromBase64(result.stack[0].value as string).toAscii());
	} catch (e) {
		console.error(e.message || 'An error occurred while invoking the contract');
	}
})();
