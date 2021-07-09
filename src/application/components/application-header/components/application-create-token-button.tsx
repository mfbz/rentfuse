import { Button } from 'antd';
import React from 'react';
import { NFT } from '../../../../wallet/interfaces/nft';

export const ApplicationCreateTokenButton = React.memo(function ApplicationCreateTokenButton({
	onLoadNFT,
	onCreateToken,
}: {
	onLoadNFT: (nftScriptHash: string, nftTokenId: string) => Promise<NFT | null>;
	onCreateToken: (nftScriptHash: string, nftTokenId: string, price: number, duration: number) => Promise<void>;
}) {
	// TODO ADD DRAWER USAGE WITH FORM AND NFT!!!

	return (
		<div>
			<Button size={'large'} shape={'round'}>
				{'Lend NFT'}
			</Button>

			<style jsx>{``}</style>
		</div>
	);
});
