import { WalletConnectContextProvider } from '@cityofzion/wallet-connect-sdk-react';
import React, { useMemo } from 'react';
import {
	DEFAULT_APP_METADATA,
	DEFAULT_CHAIN_ID,
	DEFAULT_LOGGER,
	DEFAULT_METHODS,
	DEFAULT_RELAY_PROVIDER,
} from './constants/default';

export const WalletProvider = React.memo(function WalletProvider({ children }: { children: React.ReactNode }) {
	// Wallet connect options
	const wcOptions = useMemo(
		() => ({
			appMetadata: DEFAULT_APP_METADATA,
			chainId: DEFAULT_CHAIN_ID,
			logger: DEFAULT_LOGGER,
			methods: DEFAULT_METHODS,
			relayServer: DEFAULT_RELAY_PROVIDER,
		}),
		[],
	);

	return <WalletConnectContextProvider options={wcOptions}>{children}</WalletConnectContextProvider>;
});
