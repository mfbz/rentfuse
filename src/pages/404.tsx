import { Typography } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { ApplicationPage } from '../application';
import { BigButton } from '../common/components/big-button';
import { useRouter } from 'next/router';

const NAVIGATE_HOME_DELAY = 5000; // ms

export default function FourZeroFourPage({}: {}) {
	// Get router object to automatically go back to home after delay
	const router = useRouter();

	// After timeout go back to home page automatically
	useEffect(() => {
		const timeout = setTimeout(() => {
			router.push('/');
		}, NAVIGATE_HOME_DELAY);

		return () => {
			// Clear timeout on cleanup if not resolved
			clearTimeout(timeout);
		};
	}, []);

	return (
		<>
			<Head>
				<title> Not found | rentfuse</title>
			</Head>

			<ApplicationPage>
				<div>
					<Typography.Title>Lost in the blockchain?</Typography.Title>
					<Typography.Paragraph style={{ marginBottom: 0 }}>
						It looks like this page doesn't exists.
					</Typography.Paragraph>
					<Typography.Paragraph>Wait to be teleported back home or click the button below.</Typography.Paragraph>

					<div style={{ marginTop: 24 }}>
						<Link href={'/'}>
							<a className={'g-link-no-border'}>
								<BigButton shape={'round'} type={'primary'}>
									Go home
								</BigButton>
							</a>
						</Link>
					</div>
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
