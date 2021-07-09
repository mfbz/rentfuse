import { useWalletConnect } from '@cityofzion/wallet-connect-sdk-react';
import { useCallback, useMemo } from 'react';

export function useWallet() {
	const walletContext = useWalletConnect();

	const walletSession = useMemo(() => walletContext.session, [walletContext]);
	const loadingSession = useMemo(() => walletContext.loadingSession, [walletContext]);

	const walletAccount = useMemo(() => {
		if (walletSession && walletContext.accounts.length) {
			return walletContext.accounts[0].split('@')[0];
		}
		return null;
	}, [walletContext, walletSession]);

	const connectWallet = useCallback(() => walletContext.connect(), [walletContext]);
	const disconnectWallet = useCallback(() => walletContext.disconnect(), [walletContext]);

	return { walletContext, walletAccount, walletSession, loadingSession, connectWallet, disconnectWallet };
}
