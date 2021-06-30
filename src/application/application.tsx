import React from 'react';
import { ApplicationFooter } from './components/application-footer';
import { ApplicationHeader } from './components/application-header';
import { ApplicationLayout } from './components/application-layout';
import { WalletConnectContextProvider } from '@cityofzion/wallet-connect-sdk-react';
import { useMemo } from 'react';

export const Application = React.memo(function Application({ children }: { children: React.ReactNode }) {
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
			chainId: 'neo3:ihavenoidea',
			logger: 'debug',
			methods: ['invokefunction'],
			relayServer: 'wss://connect.coz.io:443',
		}),
		[],
	);

	return (
		<WalletConnectContextProvider options={wcOptions}>
			<ApplicationLayout>
				<ApplicationHeader />

				<div className={'a-application-wrapper'}>
					<div style={{ flex: 1 }}>{children}</div>

					<ApplicationFooter />
				</div>

				<style jsx>{`
					.a-application-wrapper {
						width: 100%;
						min-height: 100vh;
						display: flex;
						flex-direction: column;
					}
				`}</style>
			</ApplicationLayout>
		</WalletConnectContextProvider>
	);
});
