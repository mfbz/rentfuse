export enum StateType {
	Open,
	Rented,
	Closed,
}

export interface Rent {
	tokenId: string;
	owner: string;
	tenant: string | null;
	nftScriptHash: string;
	nftTokenId: string;
	price: number;
	balance: number;
	amount: number;
	state: StateType;
	duration: number;
	createdOn: number;
	rentedOn: number;
	closedOn: number;
}
