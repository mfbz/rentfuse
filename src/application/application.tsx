import React from 'react';
import { WalletProvider } from '../wallet';
import { ApplicationFooter } from './components/application-footer';
import { ApplicationHeader } from './components/application-header';
import { ApplicationLayout } from './components/application-layout';

export const Application = React.memo(function Application({ children }: { children: React.ReactNode }) {
	return (
		<WalletProvider>
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
		</WalletProvider>
	);
});
