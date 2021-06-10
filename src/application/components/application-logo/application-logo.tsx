import React from 'react';
import Link from 'next/link';
import Icon from '@ant-design/icons';
import { AppIcon } from './../../../common/icons/app-icon';

export const ApplicationLogo = React.memo(function ApplicationLogo({}: {}) {
	return (
		<div>
			<Link href={'/'}>
				<a className={'g-link-no-border'}>
					<Icon component={AppIcon} className={'a-logo-icon'} />
				</a>
			</Link>

			<style jsx>{`
				div :global(a) {
					display: flex;
					align-items: center;
				}

				div :global(.a-logo-icon) {
					font-size: 2rem;
					padding: 8px;
					border: 0px;
					border-radius: 16px;
					color: #ffffff;
					background: #00000000;
				}

				div :global(.a-logo-icon):hover {
					color: #00ffb9;
					background: #171336;
				}
			`}</style>
		</div>
	);
});
