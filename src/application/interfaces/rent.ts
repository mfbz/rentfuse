import { NFT } from './nft';

export enum StateType {
	Open,
	Rented,
	Closed,
}

export interface Rent {
	tokenId: string;
	owner: string;
	tenant: string;
	nft: NFT;
	price: number;
	balance: number;
	amount: number;
	state: StateType;
	duration: number;
	createdOn: number;
	rentedOn: number;
	closedOn: number;
}
