import { Button, ButtonProps } from 'antd';
import React from 'react';

export const BigButton = React.memo(function BigButton(props: ButtonProps) {
	return (
		<div className={'c-big-button'}>
			<Button size={'large'} {...props} />

			<style jsx>{`
				.c-big-button :global(button) {
					font-size: 1.5rem;
					height: 48px;
				}
			`}</style>
		</div>
	);
});
