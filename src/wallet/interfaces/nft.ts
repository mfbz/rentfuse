export interface NFT {
	scriptHash: string;
	tokenId: string;
	properties: {
		name: string;
		description: string;
		image: string;
	};
}
