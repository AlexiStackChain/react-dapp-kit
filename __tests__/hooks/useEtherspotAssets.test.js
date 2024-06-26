import { renderHook, waitFor } from '@testing-library/react';
import { ethers } from 'ethers';

// hooks
import { EtherspotTransactionKit, useEtherspotAssets } from '../../src';

const ethersProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545', 'sepolia'); // replace with your node's RPC URL
const provider = new ethers.Wallet.createRandom().connect(ethersProvider);

describe('useEtherspotAssets()', () => {
  describe('getAssets()', () => {
    it('returns assets', async () => {
      const wrapper = ({ children }) => (
        <EtherspotTransactionKit provider={provider}>{children}</EtherspotTransactionKit>
      );

      const { result, rerender } = renderHook(({ chainId }) => useEtherspotAssets(chainId), {
        initialProps: { chainId: 1 },
        wrapper,
      });

      // wait for assets to be fetched for chain ID 1
      await waitFor(() => expect(result.current).not.toBeNull());
      const assetsMainnet = await result.current.getAssets();
      expect(assetsMainnet.length).toEqual(3);

      // rerender with different chain ID 137
      rerender({ chainId: 137 });

      const assetsPolygon = await result.current.getAssets();
      expect(assetsPolygon.length).toEqual(1);
    });
  });

  describe('getSupportedAssets()', () => {
    it('returns all supported assets by Etherspot', async () => {
      const wrapper = ({ children }) => (
        <EtherspotTransactionKit provider={provider}>
          {children}
        </EtherspotTransactionKit>
      );

      const { result } = renderHook(() => useEtherspotAssets(), {
        wrapper,
      });

      // wait for assets to be fetched
      await waitFor(() => expect(result.current).not.toBeNull());

      const allSupportedAssets = await result.current.getSupportedAssets();
      expect(allSupportedAssets).not.toBeUndefined();
      expect(allSupportedAssets.tokens.length).toEqual(3);
    });

    it('returns all supported assets by Etherspot and by Chain ID', async () => {
      const wrapper = ({ children }) => (
        <EtherspotTransactionKit provider={provider}>
          {children}
        </EtherspotTransactionKit>
      );

      const { result } = renderHook(() => useEtherspotAssets(), {
        wrapper,
      });

      // wait for assets to be fetched
      await waitFor(() => expect(result.current).not.toBeNull());

      // chain ID 1
      const allSupportedAssetsMainnet = await result.current.getSupportedAssets(1);
      expect(allSupportedAssetsMainnet).not.toBeUndefined();
      expect(allSupportedAssetsMainnet.tokens.length).toEqual(2);

      // chain ID 137
      const allSupportedAssetsPolygon = await result.current.getSupportedAssets(137);
      expect(allSupportedAssetsPolygon).not.toBeUndefined();
      expect(allSupportedAssetsPolygon.tokens.length).toEqual(1);

      // chain ID 56
      const allSupportedAssetsBinance = await result.current.getSupportedAssets(56);
      expect(allSupportedAssetsBinance).not.toBeUndefined();
      expect(allSupportedAssetsBinance.tokens.length).toEqual(0);
    });
  });
});
