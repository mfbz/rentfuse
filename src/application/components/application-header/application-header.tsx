import { Layout } from 'antd';
import React from 'react';

export const HEADER_HEIGHT = 80;

export const ApplicationHeader = React.memo(function ApplicationHeader({
	logo,
	navBar,
}: {
	logo: React.ReactNode;
	navBar: React.ReactNode;
}) {
	return (
		<div>
			<Layout.Header className={'a-header'}>
				<div className={'a-header-wrapper'}>
					<div className={'a-header-content'}>
						{logo}
						{navBar}
					</div>
				</div>
			</Layout.Header>

			<style jsx>{`
				div :global(.a-header) {
					width: 100%;
					height: ${HEADER_HEIGHT}px;
					padding: 0px 48px 0px 48px;
					border-radius: 0px 0px 48px 48px;
					display: flex;
					justify-content: center;
					align-items: center;
					position: fixed;
					z-index: 10;
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
