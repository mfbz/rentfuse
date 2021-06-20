import { Typography } from 'antd';
import React from 'react';

export const Section = React.memo(function Section({
	title,
	children,
	extra,
	style,
}: {
	title: string;
	children: React.ReactNode;
	extra?: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<section className={'c-section'} style={style}>
			<div className={'c-section-header'}>
				<Typography.Title level={2}>{title}</Typography.Title>

				{extra && <div className={'c-section-extra'}>{extra}</div>}
			</div>
			<div className={'c-section-content'}>{children}</div>

			<style jsx>{`
				.c-section {
					width: 100%;
					display: flex;
					flex-direction: column;
				}

				.c-section-header {
					width: 100%;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
				}

				.c-section-extra {
				}

				.c-section-content {
					width: 100%;
					padding: 0px;
				}
			`}</style>
		</section>
	);
});
