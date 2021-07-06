import { rpc } from '@cityofzion/neon-js';
import { DEFAULT_NEO_RPC_ADDRESS } from '../constants/default';

export class NEOHelper {
	private static readonly READ_LOG_FREQUENCY = 1000; //ms

	static getNotificationsFromTxId = async (txId: string) => {
		// Get rpc client to do calls
		const rpcClient = NEOHelper.getRPCClient();

		// Cycle until i get app log to extract notifications from
		let appLog;
		do {
			try {
				appLog = await rpcClient.getApplicationLog(txId);
			} catch (e) {
				await NEOHelper.sleep(NEOHelper.READ_LOG_FREQUENCY);
			}
		} while (!appLog);

		// Get notifications from app log and return them
		const notifications = [] as any;
		appLog.executions.forEach((e) => {
			notifications.push(...e.notifications);
		});
		return notifications;
	};

	private static getRPCClient = () => {
		return new rpc.RPCClient(DEFAULT_NEO_RPC_ADDRESS);
	};

	private static sleep = (duration: number) => {
		return new Promise((resolve) => {
			setTimeout(resolve, duration);
		});
	};
}
