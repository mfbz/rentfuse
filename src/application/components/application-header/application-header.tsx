import { Layout, Space } from 'antd';
import React from 'react';
import { ApplicationLogo } from '../application-logo';
import { ApplicationWalletButton } from './components/application-wallet-button';

export const HEADER_HEIGHT = 80;

export const ApplicationHeader = React.memo(function ApplicationHeader({}: {}) {
	return (
		<div>
			<Layout.Header className={'a-header'}>
				<div className={'a-header-wrapper'}>
					<div className={'a-header-content'}>
						<ApplicationLogo />

						<Space>
							<ApplicationWalletButton />
						</Space>
					</div>
				</div>
			</Layout.Header>

			<style jsx>{`
				div :global(.a-header) {
					width: 100%;
					height: ${HEADER_HEIGHT}px;
					padding: 0px 48px 0px 48px;
					box-shadow: 0px 2px 8px #f0f1f2;
					display: flex;
					justify-content: center;
					align-items: center;
					position: fixed;
					z-index: 10;
					background: #ffffff;
				}

				.a-header-wrapper {
					width: 100%;
					max-width: 1024px;
				}

				.a-header-content {
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
			`}</style>
		</div>
	);
});
