export interface NFT {
	symbol: string;
	scriptHash: string;
	tokenId: string;
	properties: {
		name: string;
		description: string;
		image: string;
	};
}
