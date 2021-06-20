import React from 'react';
import { Button } from 'antd';
import { useResponsive } from '../../../../common/hooks/use-responsive';
import Icon from '@ant-design/icons';

export const ApplicationWalletButton = React.memo(function ApplicationWalletButton({}: {}) {
	const { isMobileAndBelow } = useResponsive();

	return (
		<div>
			<Button type={'primary'} size={'large'} shape={'round'}>
				{'Connect wallet'}
			</Button>

			<style jsx>{``}</style>
		</div>
	);
});
