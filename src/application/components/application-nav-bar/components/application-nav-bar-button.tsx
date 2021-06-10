import React from 'react';
import { Button } from 'antd';
import { ApplicationNavBarItem } from '../interfaces/application-nav-bar-item';
import Link from 'next/link';
import { useResponsive } from '../../../../common/hooks/use-responsive';
import Icon from '@ant-design/icons';

export const ApplicationNavBarButton = React.memo(function ApplicationNavBarButton({
	item,
	selected,
}: {
	item: ApplicationNavBarItem;
	selected?: boolean;
}) {
	const { isMobileAndBelow } = useResponsive();

	return (
		<div>
			<Link href={item.route}>
				<a className={'g-link-no-border'}>
					{isMobileAndBelow ? (
						<Icon component={item.icon} className={'a-navbar-icon'} />
					) : (
						<Button size={'large'}>{item.title}</Button>
					)}
				</a>
			</Link>

			<style jsx>{`
				div :global(button) {
					border: 0;
					border-radius: 16px;
				}

				div :global(button):hover,
				div :global(button):focus {
					color: #00ffb9;
					background: #171336;
				}

				div :global(a) {
					display: flex;
					align-items: center;
				}

				div :global(.a-navbar-icon) {
					font-size: 2rem;
					padding: 8px;
					border: 0px;
					border-radius: 16px;
				}

				div :global(.a-navbar-icon):hover {
					color: #00ffb9;
					background: #171336;
				}
			`}</style>
			<style jsx>{`
				div :global(button) {
					color: ${selected ? '#00ffb9' : '#FFFFFF'};
					background: ${selected ? '#171336' : '#00000000'};
				}

				div :global(.a-navbar-icon) {
					color: ${selected ? '#00ffb9' : '#FFFFFF'};
					background: ${selected ? '#171336' : '#00000000'};
				}
			`}</style>
		</div>
	);
});
