import { useMemo } from 'react';
import { HeroSize } from '../hero';

export function useHeight(size: HeroSize) {
	return useMemo(() => {
		switch (size) {
			case 'large':
				return 500;
			case 'normal':
			default:
				return 300;
		}
	}, [size]);
}
