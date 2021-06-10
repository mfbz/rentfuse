import { Typography } from 'antd';
import React from 'react';
import { Layout } from 'antd';
import Icon from '@ant-design/icons';
import { LinkedinIcon } from '../../../common/icons/linkedin-icon';
import { GithubIcon } from '../../../common/icons/github-icon';

export const ApplicationFooter = React.memo(function ApplicationFooter({}: {}) {
	return (
		<div>
			<Layout.Footer className={'a-footer'}>
				<div className={'a-footer-wrapper'}>
					<div className={'a-footer-inner'}>
						<div className={'a-footer-column'}>
							<Typography.Paragraph style={{ marginBottom: 0 }}>Made in Italy with ❤️</Typography.Paragraph>
							<Typography.Paragraph style={{ marginBottom: 0 }} strong={true}>
								© Michael Fabozzi
							</Typography.Paragraph>
						</div>

						<div className={'a-footer-column'}>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<div style={{ marginRight: 16 }}>
									<a href="https://www.linkedin.com/in/michael-fabozzi/" target="_blank" className={'g-link-no-border'}>
										<Icon component={LinkedinIcon} className={'a-footer-icon'} style={{ color: '#0e76a8' }} />
									</a>
								</div>

								<div>
									<a href="https://github.com/mfbz" target="_blank" className={'g-link-no-border'}>
										<Icon component={GithubIcon} className={'a-footer-icon'} style={{ color: '#333333' }} />
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
					background: #ededfd;
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
					color: #ffffff;
					background: #00ffb9;
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
