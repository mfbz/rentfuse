import { Layout, Space, message } from 'antd';
import React, { useCallback } from 'react';
import { useWallet, RentFuseContract } from '../../../wallet';
import { ApplicationLogo } from '../application-logo';
import { ApplicationAccountButton } from './components/application-account-button';
import { ApplicationWalletButton } from './components/application-wallet-button';
import { ApplicationCreateTokenButton } from './components/application-create-token-button';
import { NEP11Contract } from '../../../wallet/contracts/nep11-contract';

export const HEADER_HEIGHT = 80;

export const ApplicationHeader = React.memo(function ApplicationHeader({}: {}) {
	const { walletContext, walletAccount, loadingSession, connectWallet, disconnectWallet } = useWallet();

	const onLoadNFT = useCallback(async (nftScriptHash: string, nftTokenId: string) => {
		try {
			// Get needed data calling the contract
			return await NEP11Contract.getNFT({ scriptHash: nftScriptHash, tokenId: nftTokenId });
		} catch (error) {
			message.error('An error occurred loading nft data.');
		}

		return null;
	}, []);
	const onCreateToken = useCallback(
		async (nftScriptHash: string, nftTokenId: string, price: number, duration: number) => {
			try {
				await RentFuseContract.createToken({ nftScriptHash, nftTokenId, price, duration, walletContext });
			} catch (error) {
				message.error('An error occurred creating the token.');
			}
		},
		[walletContext],
	);

	return (
		<div>
			<Layout.Header className={'a-header'}>
				<div className={'a-header-wrapper'}>
					<div className={'a-header-content'}>
						<ApplicationLogo />

						<Space size={24}>
							{walletAccount ? (
								<>
									<ApplicationCreateTokenButton onLoadNFT={onLoadNFT} onCreateToken={onCreateToken} />
									<ApplicationAccountButton account={walletAccount} onDisconnect={disconnectWallet} />
								</>
							) : (
								<>
									<ApplicationWalletButton loading={loadingSession} onConnect={connectWallet} />
								</>
							)}
						</Space>
					</div>
				</div>
			</Layout.Header>

			<style jsx>{`
				div :global(.a-header) {
					width: 100%;
					height: ${HEADER_HEIGHT}px;
					padding: 0px 48px 0px 48px;
					box-shadow: 0px 2px 8px #f0f1f2;
					display: flex;
					justify-content: center;
					align-items: center;
					position: fixed;
					z-index: 10;
					background: #ffffff;
				}

				.a-header-wrapper {
					width: 100%;
					max-width: 1024px;
				}

				.a-header-content {
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
			`}</style>
		</div>
	);
});
