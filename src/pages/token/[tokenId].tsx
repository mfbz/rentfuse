import { message, Row, Col, Image, Card, Typography, Modal } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ApplicationPage } from '../../application';
import { Rent, RentFuseContract, useWallet, DEFAULT_GAS_PRECISION } from '../../wallet';
import { NEP11Contract } from '../../wallet/contracts/nep11-contract';
import { NFT } from '../../wallet/interfaces/nft';
import Link from 'next/link';
import Icon from '@ant-design/icons';
import { GasIcon } from '../../common/icons/gas-icon';
import { TokenActionBar } from '../../modules/token';

export default function TokenIdPage({}: {}) {
	const router = useRouter();
	// Extract tokenId from router query param
	const tokenId = useMemo(() => {
		return router.query.tokenId as string;
	}, [router]);

	// Data needed to populate the page
	const [rent, setRent] = useState<Rent | null>(null);
	const [nft, setNFT] = useState<NFT | null>(null);

	const onLoadRent = useCallback(async (_tokenId: string) => {
		try {
			const _rent = await RentFuseContract.getRent({ tokenId: _tokenId });
			setRent(_rent);
		} catch (error) {
			message.error('An error occurred loading rent from token id.');
		}
	}, []);

	useEffect(() => {
		onLoadRent(tokenId);
	}, [tokenId, onLoadRent]);

	useEffect(() => {
		const loadNFT = async (_rent: Rent) => {
			try {
				const _nft = await NEP11Contract.getNFT({ scriptHash: _rent.nftScriptHash, tokenId: _rent.nftTokenId });
				setNFT(_nft);
			} catch (error) {
				message.error('An error occurred loading nft data.');
			}
		};

		if (rent) {
			loadNFT(rent);
		}
	}, [rent]);

	// Get the wallet to perform transactions
	const { walletContext, walletAccount, connectWallet } = useWallet();

	const onCloseToken = useCallback(
		async (_tokenId: string) => {
			try {
				await RentFuseContract.closeToken({ tokenId: _tokenId, walletContext });
				await onLoadRent(_tokenId);
			} catch (error) {
				message.error('An error occurred closing the token.');
			}
		},
		[walletContext, onLoadRent],
	);
	const onRevokeToken = useCallback(
		async (_tokenId: string) => {
			try {
				await RentFuseContract.revokeToken({ tokenId: _tokenId, walletContext });
				await onLoadRent(_tokenId);
			} catch (error) {
				message.error('An error occurred revoking the token.');
			}
		},
		[walletContext, onLoadRent],
	);
	const onWithdrawToken = useCallback(
		async (_tokenId: string) => {
			try {
				await RentFuseContract.withdrawToken({ tokenId: _tokenId, walletContext });
				await onLoadRent(_tokenId);
			} catch (error) {
				message.error('An error occurred withdrawing the token.');
			}
		},
		[walletContext, onLoadRent],
	);
	const onRentToken = useCallback(
		async (_tokenId: string, _amount: number) => {
			try {
				await RentFuseContract.rentToken({ tokenId: _tokenId, amount: _amount, walletContext });
				await onLoadRent(_tokenId);
			} catch (error) {
				message.error('An error occurred renting the token.');
			}
		},
		[walletContext, onLoadRent],
	);
	const onPayToken = useCallback(
		async (_tokenId: string, _amount: number) => {
			try {
				await RentFuseContract.payToken({ tokenId: _tokenId, amount: _amount, walletContext });
				await onLoadRent(_tokenId);
			} catch (error) {
				message.error('An error occurred paying the token.');
			}
		},
		[walletContext, onLoadRent],
	);
	const onNoAccount = useCallback(async () => {
		await connectWallet();
	}, [connectWallet]);

	return (
		<>
			<Head>
				<title>rentfuse</title>
			</Head>

			<ApplicationPage>
				<Row gutter={24}>
					<Col xs={24} sm={24} md={24} lg={10} xl={10}>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<Card loading={!nft} cover={<Image src={nft ? nft.properties.image : undefined} preview={false} />} />

							<Card title={'Description'} style={{ marginTop: 24 }}>
								<div>
									<Typography>{nft ? nft.properties.description : undefined}</Typography>
								</div>
							</Card>
						</div>
					</Col>
					<Col xs={24} sm={24} md={24} lg={14} xl={14}>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<div>
								<Typography>{nft ? nft.symbol : undefined}</Typography>
							</div>

							<div>
								<Typography.Title>{nft ? '#' + nft.tokenId + ' ' + nft.properties.name : undefined}</Typography.Title>
							</div>

							<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
								<Typography>{'Owned by'}</Typography>

								<Link href={'/owner/' + (rent ? rent.owner : undefined)}>
									<a className={'g-link-no-border'}>
										<Typography>{rent ? rent.owner : undefined}</Typography>
									</a>
								</Link>
							</div>

							<Card title={'Price'} style={{ marginTop: 24 }}>
								<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
									<Icon component={GasIcon} style={{ fontSize: '30px', marginRight: 16 }} />
									<Typography.Title level={3}>
										{rent ? Math.ceil(Number(rent.price) / DEFAULT_GAS_PRECISION) : '-'}
									</Typography.Title>

									<Typography style={{ marginLeft: 24 }}>{'/ day'}</Typography>
								</div>
							</Card>

							{rent && (
								<TokenActionBar
									rent={rent}
									account={walletAccount}
									onCloseToken={onCloseToken}
									onRevokeToken={onRevokeToken}
									onWithdrawToken={onWithdrawToken}
									onRentToken={onRentToken}
									onPayToken={onPayToken}
									onNoAccount={onNoAccount}
									style={{ marginTop: 24 }}
								/>
							)}
						</div>
					</Col>
				</Row>

				<style jsx>{``}</style>
			</ApplicationPage>
		</>
	);
}

export const getStaticProps = async () => {
	return {
		props: {},
	};
};
