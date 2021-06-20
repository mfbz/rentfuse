import React, { useMemo } from 'react';
import { useHeight } from './hooks/use-height';

export type HeroSize = 'large' | 'normal';

export const Hero = React.memo(function Hero({
	title,
	subTitle,
	extra,
	size = 'normal',
	style,
}: {
	title: React.ReactNode;
	subTitle?: React.ReactNode;
	extra?: React.ReactNode;
	size?: HeroSize;
	style?: React.CSSProperties;
}) {
	const height = useHeight(size);

	return (
		<section className={'c-hero'} style={style}>
			<div className={'c-hero-content'}>
				<div>
					<div className={'c-hero-content-text'}>
						{title}
						{subTitle}
					</div>

					{extra && <div className={'c-hero-content-extra'}>{extra}</div>}
				</div>
			</div>

			<style jsx>{`
				.c-hero {
					width: 100%;
					font-size: 1.5rem;
				}

				.c-hero-content {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: center;
				}

				.c-hero-content-text {
					width: 100%;
				}

				.c-hero-content-extra {
					width: 100%;
					margin-top: 24px;
				}
			`}</style>
			<style jsx>{`
				.c-hero {
					height: ${height}px;
				}
			`}</style>
		</section>
	);
});
