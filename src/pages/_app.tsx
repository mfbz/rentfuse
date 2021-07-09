import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { Application } from '../application';

import './../styles/global.css';

export default function _App({ Component, pageProps }: AppProps) {
	return (
		<Application>
			<Head>
				<link rel="shortcut icon" href="favicon/favicon.ico" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" />

				<meta name="description" content="Peer to peer renting of Neo N3 NFTs" />
			</Head>

			<Component {...pageProps} />
		</Application>
	);
}
