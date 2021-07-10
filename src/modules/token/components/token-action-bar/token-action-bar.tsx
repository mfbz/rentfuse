import React from 'react';
import { Rent, StateType } from '../../../../wallet';
import { Space, Button, Modal } from 'antd';
import { BigButton } from '../../../../common/components/big-button';

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
						<BigButton
							type={'primary'}
							shape={'round'}
							size={'large'}
							onClick={() =>
								Modal.confirm({
									title: 'Do you want to withdraw from the rent?',
									okText: 'Withdraw',
									cancelText: 'Cancel',
									centered: true,
									icon: null,
									onOk: async () => await onWithdrawToken(rent.tokenId),
								})
							}
						>
							{'Withdraw'}
						</BigButton>
					)}
					{(rent.state === StateType.Open ||
						(rent.state === StateType.Rented && Date.now() > rent.rentedOn + rent.duration)) && (
						<BigButton
							type={'primary'}
							danger={true}
							shape={'round'}
							size={'large'}
							onClick={() =>
								Modal.confirm({
									title: 'Do you want to close the rent?',
									okType: 'danger',
									okText: 'Close',
									cancelText: 'Cancel',
									centered: true,
									icon: null,
									onOk: async () => await onCloseToken(rent.tokenId),
								})
							}
						>
							{'Close'}
						</BigButton>
					)}
					{rent.tenant !== null &&
						rent.amount <
							rent.price *
								(Date.now() > rent.rentedOn + rent.duration
									? Math.ceil(rent.duration / (1000 * 60 * 60 * 24))
									: Math.ceil((Date.now() - rent.rentedOn) / (1000 * 60 * 60 * 24))) && (
							<BigButton
								type={'primary'}
								danger={true}
								shape={'round'}
								size={'large'}
								onClick={() =>
									Modal.confirm({
										title: 'Do you want to revoke the rent?',
										okType: 'danger',
										okText: 'Revoke',
										cancelText: 'Cancel',
										centered: true,
										icon: null,
										onOk: async () => await onRevokeToken(rent.tokenId),
									})
								}
							>
								{'Revoke'}
							</BigButton>
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
						<BigButton
							type={'primary'}
							shape={'round'}
							size={'large'}
							onClick={() =>
								Modal.confirm({
									title: 'Do you want to pay the rent?',
									okText: 'Pay',
									cancelText: 'Cancel',
									centered: true,
									icon: null,
									onOk: async () => await onPayToken(rent.tokenId, rent.price),
								})
							}
						>
							{'Pay'}
						</BigButton>
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
						<BigButton
							type={'primary'}
							shape={'round'}
							size={'large'}
							onClick={() =>
								Modal.confirm({
									title: 'Do you want to rent the nft?',
									okText: 'Rent',
									cancelText: 'Cancel',
									centered: true,
									icon: null,
									onOk: async () => await onRentToken(rent.tokenId, rent.price),
								})
							}
						>
							{'Rent'}
						</BigButton>
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
					<BigButton type={'primary'} shape={'round'} size={'large'} onClick={() => onNoAccount()}>
						{'Rent'}
					</BigButton>
				)}
			</Space>

			<style jsx>{``}</style>
		</div>
	);
});
