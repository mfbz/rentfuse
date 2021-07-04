import { Button, Space } from 'antd';
import Head from 'next/head';
import React, { useCallback } from 'react';
import { ApplicationPage } from '../application';
import { RentFuseContract } from '../wallet';

export default function IndexPage({}: {}) {
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
