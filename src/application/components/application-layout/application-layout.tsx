import React from 'react';
import { Layout } from 'antd';

export const ApplicationLayout = React.memo(function ApplicationLayout({ children }: { children: React.ReactNode }) {
	return (
		<Layout style={{ width: '100%', minHeight: '100vh' }}>
			{children}

			<style jsx>{``}</style>
		</Layout>
	);
});
