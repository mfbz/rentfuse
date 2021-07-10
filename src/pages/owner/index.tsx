import { message, Typography } from 'antd';
import Head from 'next/head';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { ApplicationPage } from '../../application';
import { TokenGrid } from '../../modules/token';
import { Rent, RentFuseContract } from '../../wallet';
import { useRouter } from 'next/router';
import { NEP11Contract } from '../../wallet/contracts/nep11-contract';

export default function IndexPage() {
	const router = useRouter();
	// Extract address from router query param
	const address = useMemo(() => {
		return router.query.address as string;
	}, [router]);

	// If no address redirect to 404 page
	useEffect(() => {
		if (router.isReady && address === undefined) {
			router.push('/404');
		}
	}, [router, address]);

	const [rents, setRents] = useState<Rent[]>([]);

	useEffect(() => {
		const loadRents = async (_address: string) => {
			try {
				const _rents = await RentFuseContract.getRentListAsOwner({ address: _address });
				setRents(_rents);
			} catch (error) {
				message.error('An error occurred loading rents.');
				console.error(error);
			}
		};

		console.log(address);
		if (address) {
			loadRents(address);
		}
	}, [address]);

	const onLoadNFT = useCallback(async (nftScriptHash: string, nftTokenId: string) => {
		try {
			// Get needed data calling the contract
			return await NEP11Contract.getNFT({ scriptHash: nftScriptHash, tokenId: nftTokenId });
		} catch (error) {
			message.error('An error occurred loading nft data.');
		}

		return null;
	}, []);
	const onClickRent = useCallback(
		(rent: Rent) => {
			router.push('/token?id=' + rent.tokenId);
		},
		[router],
	);

	return (
		<>
			<Head>
				<title>rentfuse</title>
			</Head>

			<ApplicationPage>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							flexWrap: 'wrap',
							alignItems: 'center',
							overflow: 'hidden',
						}}
					>
						<Typography.Text style={{ marginRight: 8 }}>{'Listings of'}</Typography.Text>
						<Typography.Text strong={true}>{address}</Typography.Text>
					</div>

					<TokenGrid rents={rents} onLoadNFT={onLoadNFT} onClickRent={onClickRent} style={{ marginTop: 24 }} />
				</div>

				<style jsx>{``}</style>
			</ApplicationPage>
		</>
	);
}
