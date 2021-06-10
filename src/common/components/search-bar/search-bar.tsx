import React, { useCallback, useMemo } from 'react';
import { Input } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { SearchIcon } from '../../icons/search-icon';
import Icon from '@ant-design/icons';

export const SearchBar = React.memo(function SearchBar({
	placeholder,
	size = 'middle',
	onSearch,
	style,
}: {
	placeholder?: string;
	size?: SizeType;
	onSearch: (text: string) => void;
	style?: React.CSSProperties;
}) {
	const onChange = useCallback(
		(event) => {
			onSearch(event.target.value || '');
		},
		[onSearch],
	);

	return (
		<div>
			<Input
				size={size}
				placeholder={placeholder}
				suffix={<Icon component={SearchIcon} className={'c-searchbar-icon'} />}
				onChange={onChange}
				style={style}
			/>

			<style jsx>{`
				div :global(input) {
					margin: 8px;
					border: 0;
					border-radius: 16px;
				}

				div :global(.c-searchbar-icon) {
					font-size: 32px;
				}
			`}</style>
		</div>
	);
});
