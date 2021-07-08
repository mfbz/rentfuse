import { message } from 'antd';
import Head from 'next/head';
import React, { useCallback, useState, useEffect } from 'react';
import { ApplicationPage } from '../application';
import { TokenGrid } from '../modules/token';
import { Rent, RentFuseContract } from '../wallet';
import { useRouter } from 'next/router';

export default function IndexPage({}: {}) {
	const router = useRouter();

	const [rents, setRents] = useState<Rent[]>([]);

	useEffect(() => {
		const loadRents = async () => {
			try {
				const _rents = await RentFuseContract.getRentList({});
				setRents(_rents);

				console.log(_rents);
			} catch (error) {
				message.error('An error occurred loading rents.');
			}
		};

		loadRents();
	}, []);

	const onLoadNFT = useCallback(async () => {
		// TODO: ADD CONTRACT CALL TO GET NFT
		const rentList = await RentFuseContract.getRentList({});

		return null;
	}, []);
	const onClickRent = useCallback(
		(rent: Rent) => {
			router.push('/token/' + rent.tokenId);
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

export const getStaticProps = async () => {
	return {
		props: {},
	};
};
