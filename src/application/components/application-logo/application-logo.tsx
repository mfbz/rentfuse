import React from 'react';
import Link from 'next/link';
import { LogoIcon } from '../../../common/icons/logo-icon';

export const ApplicationLogo = React.memo(function ApplicationLogo({}: {}) {
	return (
		<div>
			<Link href={'/'}>
				<a className={'g-link-no-border'}>
					<LogoIcon height={40} className={'a-logo-icon'} />
				</a>
			</Link>

			<style jsx>{`
				div :global(a) {
					display: flex;
					align-items: center;
				}

				div :global(.a-logo-icon) {
					padding: 8px;
					color: #040214;
				}

				div :global(.a-logo-icon):hover {
					color: #eceff1;
				}
			`}</style>
		</div>
	);
});
