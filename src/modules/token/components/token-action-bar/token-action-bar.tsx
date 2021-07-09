import React from 'react';
import { Rent, StateType } from '../../../../wallet';
import { Button, Space } from 'antd';

export const TokenActionBar = React.memo(function TokenActionBar({
	rent,
	account,
	onCloseToken,
	onRevokeToken,
	onWithdrawToken,
	onRentToken,
	onPayToken,
	onNoAccount,
	style,
}: {
	rent: Rent;
	account: string | null;
	onCloseToken: (tokenId: string) => Promise<void>;
	onRevokeToken: (tokenId: string) => Promise<void>;
	onWithdrawToken: (tokenId: string) => Promise<void>;
	onRentToken: (tokenId: string, amount: number) => Promise<void>;
	onPayToken: (tokenId: string, amount: number) => Promise<void>;
	onNoAccount: () => Promise<void>;
	style?: React.CSSProperties;
}) {
	if (account === rent.owner) {
		return (
			<div style={style}>
				<Space size={24}>
					{rent.balance > 0 && (
						<Button shape={'round'} size={'large'} onClick={() => onWithdrawToken(rent.tokenId)}>
							{'Withdraw'}
						</Button>
					)}
					{(rent.state === StateType.Open ||
						(rent.state === StateType.Rented && Date.now() > rent.rentedOn + rent.duration)) && (
						<Button shape={'round'} size={'large'} onClick={() => onCloseToken(rent.tokenId)}>
							{'Close'}
						</Button>
					)}
					{rent.amount <
						rent.price *
							(Date.now() > rent.rentedOn + rent.duration
								? Math.ceil(rent.duration / (1000 * 60 * 60 * 24))
								: Math.ceil((Date.now() - rent.rentedOn) / (1000 * 60 * 60 * 24))) && (
						<Button shape={'round'} size={'large'} onClick={() => onRevokeToken(rent.tokenId)}>
							{'Revoke'}
						</Button>
					)}
				</Space>

				<style jsx>{``}</style>
			</div>
		);
	}

	if (account === rent.tenant) {
		return (
			<div style={style}>
				<Space size={24}>
					{rent.state === StateType.Rented && (
						<Button shape={'round'} size={'large'} onClick={() => onPayToken(rent.tokenId, rent.price)}>
							{'Pay'}
						</Button>
					)}
				</Space>

				<style jsx>{``}</style>
			</div>
		);
	}

	if (account !== null) {
		return (
			<div style={style}>
				<Space size={24}>
					{rent.state === StateType.Open && (
						<Button shape={'round'} size={'large'} onClick={() => onRentToken(rent.tokenId, rent.price)}>
							{'Rent'}
						</Button>
					)}
				</Space>

				<style jsx>{``}</style>
			</div>
		);
	}

	return (
		<div style={style}>
			<Space size={24}>
				{rent.state === StateType.Open && (
					<Button shape={'round'} size={'large'} onClick={() => onNoAccount()}>
						{'Rent'}
					</Button>
				)}
			</Space>

			<style jsx>{``}</style>
		</div>
	);
});
