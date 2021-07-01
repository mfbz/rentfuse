import React from 'react';
import { Button } from 'antd';
import { useResponsive } from '../../../../common/hooks/use-responsive';
import Icon from '@ant-design/icons';
import { WalletIcon } from '../../../../common/icons/wallet-icon';

export const ApplicationWalletButton = React.memo(function ApplicationWalletButton({
	loading,
	onClick,
}: {
	loading?: boolean;
	onClick: () => void;
}) {
	const { isMobileAndBelow } = useResponsive();

	return (
		<div>
			{isMobileAndBelow ? (
				<Button
					type={'primary'}
					size={'large'}
					shape={'circle'}
					icon={<Icon component={WalletIcon} />}
					loading={loading}
					onClick={onClick}
				/>
			) : (
				<Button type={'primary'} size={'large'} shape={'round'} loading={loading} onClick={onClick}>
					{'Connect wallet'}
				</Button>
			)}

			<style jsx>{``}</style>
		</div>
	);
});
