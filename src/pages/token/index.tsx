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

export default function IndexPage() {
	const router = useRouter();
	// Extract tokenId from router query param
	const tokenId = useMemo(() => {
		return router.query.id as string;
	}, [router]);

	// If no token id redirect to 404 page
	useEffect(()=> {
		if (tokenId === undefined) {
			router.push('/404');
		}
	}, [router, tokenId]);

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
		if (tokenId !== undefined) {
			onLoadRent(tokenId);
		}
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

							<Card title={<Typography.Text strong={true}>{'Description'}</Typography.Text>} style={{ marginTop: 24 }}>
								<div>
									<Typography.Text>{nft ? nft.properties.description : undefined}</Typography.Text>
								</div>
							</Card>
						</div>
					</Col>
					<Col xs={24} sm={24} md={24} lg={14} xl={14}>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<div>
								<Typography.Text>{nft ? nft.symbol : undefined}</Typography.Text>
							</div>

							<div>
								<Typography.Title>{nft ? '#' + nft.tokenId + ' ' + nft.properties.name : undefined}</Typography.Title>
							</div>

							<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
								<Typography.Text style={{marginRight:8}}>{'Owned by'}</Typography.Text>

								<Link href={'/owner?address=' + (rent ? rent.owner : undefined)}>
									<a className={'g-link-no-border'}>
										<Typography.Text>{rent ? rent.owner : undefined}</Typography.Text>
									</a>
								</Link>
							</div>

							<Card title={<Typography.Text strong={true}>{'Price'}</Typography.Text>} style={{ marginTop: 24 }}>
								<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
									<Icon component={GasIcon} style={{ fontSize: '42px', marginRight: 16 }} />
									<Typography.Title level={2} style={{marginBottom:0}}>
										{rent ? Math.ceil(Number(rent.price) / DEFAULT_GAS_PRECISION) : '-'}
									</Typography.Title>

									<Typography.Text style={{ marginLeft: 24, marginTop:16, marginBottom:0 }}>{'/ day'}</Typography.Text>
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

