import { useWalletConnect } from '@cityofzion/wallet-connect-sdk-react';
import { useCallback, useMemo } from 'react';

export function useWallet() {
	const walletConnectCtx = useWalletConnect();

	const walletSession = useMemo(() => walletConnectCtx.session, [walletConnectCtx]);
	const loadingSession = useMemo(() => walletConnectCtx.loadingSession, [walletConnectCtx]);

	const connectWallet = useCallback(() => walletConnectCtx.connect(), [walletConnectCtx]);
	const disconnectWallet = useCallback(() => walletConnectCtx.disconnect(), [walletConnectCtx]);

	return { walletSession, loadingSession, connectWallet, disconnectWallet };
}
