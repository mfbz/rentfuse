import React from 'react';
import { Layout } from 'antd';
import { HEADER_HEIGHT } from '../application-header';

export const ApplicationPage = React.memo(function ApplicationPage({
	hero,
	children,
}: {
	hero?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div>
			<Layout.Content className={'a-content'}>
				<div className={'a-content-wrapper'}>
					{hero && (
						<div className={'a-hero'}>
							<div className={'a-hero-wrapper'}>
								<div className={'a-hero-content'}>{hero}</div>
							</div>
						</div>
					)}

					<div className={'a-inner'}>
						<div className={'a-inner-wrapper'}>{children}</div>
					</div>
				</div>
			</Layout.Content>

			<style jsx>{`
				div :global(.a-content) {
					width: 100%;
					height: 100%;
				}

				.a-content-wrapper {
					width: 100%;
				}

				.a-hero {
					width: 100%;
					background: #040214;
					border-radius: 0px 0px 48px 48px;
				}

				.a-hero-wrapper {
					width: 100%;
					padding: 24px 48px 24px 48px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.a-hero-content {
					width: 100%;
					padding-top: ${HEADER_HEIGHT}px;
					max-width: 1024px;
				}

				.a-inner {
					width: 100%;
					padding: 48px 48px 48px 48px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.a-inner-wrapper {
					width: 100%;
					max-width: 1024px;
				}
			`}</style>
			<style jsx>{`
				div :global(.a-content) {
					padding-top: ${hero ? 0 : HEADER_HEIGHT}px;
				}
			`}</style>
		</div>
	);
});
