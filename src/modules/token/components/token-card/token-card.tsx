import { Image, Card, Typography } from 'antd';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Rent } from '../../../../wallet';
import { NFT } from '../../../../wallet/interfaces/nft';
import Icon from '@ant-design/icons';
import { GasIcon } from '../../../../common/icons/gas-icon';

export const TokenCard = React.memo(function TokenCard({
	rent,
	onLoadNFT,
	style,
}: {
	rent: Rent;
	onLoadNFT: (nftScriptHash: string, nftTokenId: string) => Promise<NFT | null>;
	style?: React.CSSProperties;
}) {
	const [nft, setNFT] = useState<NFT | null>(null);

	useEffect(() => {
		const loadNFT = async () => {
			const nft = await onLoadNFT(rent.nftScriptHash, rent.nftTokenId);
			setNFT(nft);
		};

		loadNFT();
	}, [rent, onLoadNFT]);

	return (
		<div style={style}>
			<Card hoverable={true} loading={!nft} cover={<Image src={nft?.properties.image} preview={false} />}>
				<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<div>
						<Typography.Text>{nft?.symbol}</Typography.Text>
						<Typography.Text strong={true}>{nft?.tokenId}</Typography.Text>
					</div>

					<div>
						<Typography.Text>{'Price'}</Typography.Text>
						<span>
							<Icon component={GasIcon} style={{ marginRight: 8 }} />
							<Typography.Text strong={true}>{rent.price + '/d'}</Typography.Text>
						</span>
					</div>
				</div>
			</Card>

			<style jsx>{``}</style>
		</div>
	);
});
