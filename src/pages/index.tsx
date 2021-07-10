import { message } from 'antd';
import Head from 'next/head';
import React, { useCallback, useState, useEffect } from 'react';
import { ApplicationPage } from '../application';
import { TokenGrid } from '../modules/token';
import { Rent, RentFuseContract } from '../wallet';
import { useRouter } from 'next/router';
import { NEP11Contract } from '../wallet/contracts/nep11-contract';

export default function IndexPage() {
	const router = useRouter();

	const [rents, setRents] = useState<Rent[]>([]);

	useEffect(() => {
		const loadRents = async () => {
			try {
				const _rents = await RentFuseContract.getRentList({});
				setRents(_rents);
			} catch (error) {
				message.error('An error occurred loading rents.');
			}
		};

		loadRents();
	}, []);

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
				<div>
					<TokenGrid rents={rents} onLoadNFT={onLoadNFT} onClickRent={onClickRent} />
				</div>

				<style jsx>{``}</style>
			</ApplicationPage>
		</>
	);
}
