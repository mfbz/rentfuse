import { Button, Space } from 'antd';
import Head from 'next/head';
import React, { useCallback } from 'react';
import { ApplicationPage } from '../application';
import { RentFuseContract, useWallet } from '../wallet';

export default function IndexPage({}: {}) {
	const { walletContext } = useWallet();

	const onGetRent = useCallback(() => {
		const getRent = async () => {
			const rent = await RentFuseContract.getRent({ tokenId: '1' });

			console.log(rent);
		};

		getRent();
	}, []);

	const onGetRentList = useCallback(() => {
		const getRentList = async () => {
			const rentList = await RentFuseContract.getRentList({});

			console.log(rentList);
		};

		getRentList();
	}, []);

	const onGetRentListAsOwner = useCallback(() => {
		const getRentListAsOwner = async () => {
			const rentList = await RentFuseContract.getRentListAsOwner({ address: 'NMojetgaoRD74h9fRb3T8Yd5DEfCdxx7pD' });

			console.log(rentList);
		};

		getRentListAsOwner();
	}, []);

	const onGetRentListAsTenant = useCallback(() => {
		const getRentListAsTenant = async () => {
			const rentList = await RentFuseContract.getRentListAsTenant({ address: 'NWEcD5bRPmF1vywSWDYpf7XmDC8ArYyNLb' });

			console.log(rentList);
		};

		getRentListAsTenant();
	}, []);

	const onCreateToken = useCallback(() => {
		const getRentListAsTenant = async () => {
			const result = await RentFuseContract.createToken({
				nftScriptHash: '0xe91c69379c44bd6abe15c52b52549d6aaa0ea3d9',
				nftTokenId: '6',
				price: 2,
				duration: 1000 * 60 * 60 * 24, // one day in ms
				walletContext,
			});

			console.log(result);
		};

		getRentListAsTenant();
	}, [walletContext]);

	return (
		<>
			<Head>
				<title>rentfuse</title>
			</Head>

			<ApplicationPage>
				<div>
					<Space direction="vertical">
						<Button onClick={onGetRent}>GET RENT</Button>
						<Button onClick={onGetRentList}>GET RENT LIST</Button>
						<Button onClick={onGetRentListAsOwner}>GET RENT LIST AS OWNER</Button>
						<Button onClick={onGetRentListAsTenant}>GET RENT LIST AS TENANT</Button>

						<Button danger={true} onClick={onCreateToken}>
							CREATE TOKEN
						</Button>
					</Space>
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
