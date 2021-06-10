import React from 'react';
import { ApplicationFooter } from './components/application-footer';
import { ApplicationHeader } from './components/application-header';
import { ApplicationLayout } from './components/application-layout';
import { ApplicationLogo } from './components/application-logo';
import { ApplicationNavBar } from './components/application-nav-bar';
import { ApplicationNavBarItem } from './components/application-nav-bar/interfaces/application-nav-bar-item';
import { useRouter } from 'next/router';

export const Application = React.memo(function Application({
	navBarItems,
	children,
}: {
	navBarItems: ApplicationNavBarItem[];
	children: React.ReactNode;
}) {
	const router = useRouter();

	return (
		<ApplicationLayout>
			<ApplicationHeader
				logo={<ApplicationLogo />}
				navBar={<ApplicationNavBar selectedRoute={router.asPath} items={navBarItems} />}
			/>
			<div className={'a-application-wrapper'}>
				<div style={{ flex: 1 }}>{children}</div>
				<ApplicationFooter />
			</div>

			<style jsx>{`
				.a-application-wrapper {
					width: 100%;
					min-height: 100vh;
					display: flex;
					flex-direction: column;
				}
			`}</style>
		</ApplicationLayout>
	);
});
