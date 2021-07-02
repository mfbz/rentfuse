import { WalletConnectContextProvider } from '@cityofzion/wallet-connect-sdk-react';
import React, { useMemo } from 'react';

export const WalletProvider = React.memo(function WalletProvider({ children }: { children: React.ReactNode }) {
	// Wallet connect options
	const wcOptions = useMemo(
		() => ({
			appMetadata: {
				name: 'RentFuse',
				description: 'Peer to peer renting of Neo N3 NFTs',
				url: 'https://rentfuse.vercel.app/',
				icons: [
					'https://raw.githubusercontent.com/mfbz/rentfuse/4a256a86a5498e7aed0f12cbd32f36eec60f4188/rentfuse_icon.svg',
				],
			},
			chainId: 'neo3:testnet',
			logger: 'debug',
			methods: ['invokefunction'],
			relayServer: 'wss://connect.coz.io:443',
		}),
		[],
	);

	return <WalletConnectContextProvider options={wcOptions}>{children}</WalletConnectContextProvider>;
});
