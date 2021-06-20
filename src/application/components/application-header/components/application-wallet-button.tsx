import React from 'react';
import { Button } from 'antd';
import { useResponsive } from '../../../../common/hooks/use-responsive';
import Icon from '@ant-design/icons';
import { WalletIcon } from '../../../../common/icons/wallet-icon';

export const ApplicationWalletButton = React.memo(function ApplicationWalletButton({}: {}) {
	const { isMobileAndBelow } = useResponsive();

	return (
		<div>
			{isMobileAndBelow ? (
				<Button type={'primary'} size={'large'} shape={'circle'} icon={<Icon component={WalletIcon} />} />
			) : (
				<Button type={'primary'} size={'large'} shape={'round'}>
					{'Connect wallet'}
				</Button>
			)}

			<style jsx>{``}</style>
		</div>
	);
});
