import Head from 'next/head';
import React from 'react';
import { ApplicationPage } from '../application';

export default function IndexPage({}: {}) {
	return (
		<>
			<Head>
				<title>rentfuse</title>
			</Head>

			<ApplicationPage>
				<div></div>

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
