import React from 'react';
import { Space } from 'antd';
import { ApplicationNavBarItem } from './interfaces/application-nav-bar-item';
import { ApplicationNavBarButton } from './components/application-nav-bar-button';

export const ApplicationNavBar = React.memo(function ApplicationNavBar({
	selectedRoute,
	items,
}: {
	selectedRoute: string;
	items: ApplicationNavBarItem[];
}) {
	return (
		<nav>
			<Space size={24}>
				{items.map((item) => (
					<ApplicationNavBarButton item={item} selected={item.route === selectedRoute} key={item.route} />
				))}
			</Space>

			<style jsx>{`
				nav {
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
			`}</style>
		</nav>
	);
});
