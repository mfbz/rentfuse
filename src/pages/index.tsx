import { Button } from 'antd';
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

	return (
		<>
			<Head>
				<title>rentfuse</title>
			</Head>

			<ApplicationPage>
				<div>
					<Button onClick={onGetRent}>GET RENT</Button>
					<Button onClick={onGetRentList}>GET RENT LIST</Button>
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
