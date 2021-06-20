using System;
using System.ComponentModel;
using System.Numerics;

using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;

namespace DummyNFT
{
	[DisplayName("mfbz.DummyNFTContract")]
	[ManifestExtra("Author", "Michael Fabozzi")]
	[ManifestExtra("Name", "DummyNFTContract")]
	[ManifestExtra("Description", "A dummy Neo N3 NFT built upon NEP11 specs")]
	[ManifestExtra("Version", "1.0.0")]
	[SupportedStandards("NEP-11")]
	[ContractPermission("*", "onNEP11Payment")]
	public class DummyNFTContract : SmartContract
	{
		private static ByteString OwnerAddress() => (ByteString)Storage.Get(Storage.CurrentContext, "OwnerAddress");
		private static BigInteger TokenCount() => (BigInteger)Storage.Get(Storage.CurrentContext, "TokenCount");
		private static StorageMap TokenToOwner => new StorageMap(Storage.CurrentContext, "TokenToOwner");
		private static StorageMap AddressToTokenCount => new StorageMap(Storage.CurrentContext, "AddressToTokenCount");

		[DisplayName("symbol")]
		public static string Symbol() => "DUMMY";

		[DisplayName("decimals")]
		public static byte Decimals() => 0;

		[DisplayName("totalSupply")]
		public static BigInteger TotalSupply() => 100000;

		[DisplayName("balanceOf")]
		public static BigInteger BalanceOf(UInt160 address)
		{
			ValidateAddress(address);
			return (BigInteger)AddressToTokenCount[address];
		}

		[DisplayName("tokensOf")]
		public static Iterator TokensOf(UInt160 address)
		{
			ValidateAddress(address);
			return TokenToOwner.Find(address, FindOptions.KeysOnly | FindOptions.RemovePrefix);
		}

		[DisplayName("transfer")]
		public static bool Transfer(UInt160 to, ByteString tokenId)
		{
			ValidateAddress(to);
			// TODO
			/*
			StorageMap tokenMap = new(Storage.CurrentContext, Prefix_Token);
            TokenState token = (TokenState)StdLib.Deserialize(tokenMap[tokenId]);
            UInt160 from = token.Owner;
            if (!Runtime.CheckWitness(from)) return false;
            if (from != to)
            {
                token.Owner = to;
                tokenMap[tokenId] = StdLib.Serialize(token);
                UpdateBalance(from, tokenId, -1);
                UpdateBalance(to, tokenId, +1);
            }
            PostTransfer(from, to, tokenId, data);
            return true;
			*/
			return true;
		}

		[DisplayName("_deploy")]
		public static void Deploy(object data, bool update)
		{
			if (update) return;
			Storage.Put(Storage.CurrentContext, "OwnerAddress", (ByteString)Tx.Sender);
		}

		public static void Update(ByteString nefFile, string manifest)
		{
			ValidateOwner();
			ContractManagement.Update(nefFile, manifest, null);
		}

		public static void Destroy()
		{
			ValidateOwner();
			ContractManagement.Destroy();
		}

		private static Transaction Tx => (Transaction)Runtime.ScriptContainer;

		private static bool IsOwner()
		{
			ByteString owner = OwnerAddress();
			return Runtime.CheckWitness((UInt160)owner);
		}

		private static void ValidateOwner()
		{
			if (!IsOwner()) throw new Exception("No authorization");
		}

		private static void ValidateAddress(UInt160 address)
		{
			if (address is null || !address.IsValid)
				throw new Exception("The argument <address> is invalid");
		}

	}
}
