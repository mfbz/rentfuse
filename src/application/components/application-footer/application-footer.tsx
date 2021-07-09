import { Typography } from 'antd';
import React from 'react';
import { Layout } from 'antd';
import Icon from '@ant-design/icons';
import { GithubIcon } from '../../../common/icons/github-icon';

export const ApplicationFooter = React.memo(function ApplicationFooter({}: {}) {
	return (
		<div>
			<Layout.Footer className={'a-footer'}>
				<div className={'a-footer-wrapper'}>
					<div className={'a-footer-inner'}>
						<div className={'a-footer-column'}>
							<Typography.Paragraph style={{ marginBottom: 0, color: '#FFFFFF' }}>
								Made in Italy with ❤️
							</Typography.Paragraph>
							<Typography.Paragraph style={{ marginBottom: 0, color: '#FFFFFF' }} strong={true}>
								© rentfuse
							</Typography.Paragraph>
						</div>

						<div className={'a-footer-column'}>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<div>
									<a href="https://github.com/mfbz/rentfuse" target="_blank" className={'g-link-no-border'}>
										<Icon component={GithubIcon} className={'a-footer-icon'} style={{ color: '#FFFFFF' }} />
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout.Footer>

			<style jsx>{`
				div :global(.a-footer) {
					width: 100%;
					padding: 24px 48px 24px 48px;
					display: flex;
					justify-content: center;
					align-items: center;
					background: #040214;
				}

				div :global(a) {
					display: flex;
					align-items: center;
				}

				div :global(.a-footer-icon) {
					padding: 8px;
					font-size: 32px;
					border: 0px;
					border-radius: 16px;
					color: #ffffff;
					background: #00000000;
				}

				div :global(.a-footer-icon):hover {
					color: #eceff1;
				}

				.a-footer-wrapper {
					width: 100%;
					max-width: 1024px;
				}

				.a-footer-inner {
					width: 100%;
					padding: 24px 0px 24px 0px;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
				}

				.a-footer-column {
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
			`}</style>
		</div>
	);
});
