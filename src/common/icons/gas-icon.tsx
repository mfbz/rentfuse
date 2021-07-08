import React from 'react';

export const GasIcon = React.memo(function GasIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em">
			<defs>
				<style>{'.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#01e397;}'}</style>
			</defs>
			<g id="\u56FE\u5C42_2" data-name="\u56FE\u5C42 2">
				<g id="Layer_1" data-name="Layer 1">
					<rect className="cls-1" width={512} height={512} />
					<path
						className="cls-2"
						d="M263.41,438.88,91.7,377.21V136.09L263.86,72.91l154.48,55.33.85,254.22L263.41,324.77ZM107.66,366l139.8,50.2V186L387,134,263.93,89.89,107.65,147.24Zm155.75-58.24L403.15,359.5l-.71-214.23-139,51.81Z"
					/>
				</g>
			</g>
		</svg>
	);
});
