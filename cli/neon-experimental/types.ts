import { u, wallet } from '@cityofzion/neon-core';

// NB: From <https://github.com/ngdenterprise/neo3-visual-tracker>

export interface CommonConfig {
	networkMagic: number;
	rpcAddress: string;
	prioritisationFee?: number;
	blocksTillExpiry?: number;
	account?: wallet.Account;

	networkFeeOverride?: u.BigInteger;
	systemFeeOverride?: u.BigInteger;
}
