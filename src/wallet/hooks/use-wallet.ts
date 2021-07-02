import { useWalletConnect } from '@cityofzion/wallet-connect-sdk-react';
import { useCallback, useMemo } from 'react';

export function useWallet() {
	const walletConnectCtx = useWalletConnect();

	const walletAccount = useMemo(() => {
		if (walletConnectCtx.accounts.length) {
			return walletConnectCtx.accounts[0].split('@')[0];
		}
		return null;
	}, [walletConnectCtx]);

	const walletSession = useMemo(() => walletConnectCtx.session, [walletConnectCtx]);
	const loadingSession = useMemo(() => walletConnectCtx.loadingSession, [walletConnectCtx]);

	const connectWallet = useCallback(() => walletConnectCtx.connect(), [walletConnectCtx]);
	const disconnectWallet = useCallback(() => walletConnectCtx.disconnect(), [walletConnectCtx]);

	return { walletAccount, walletSession, loadingSession, connectWallet, disconnectWallet };
}
