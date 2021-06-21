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

		[DisplayName("Transfer")]
		public static event Action<UInt160, UInt160, BigInteger, ByteString> OnTransfer;

		[DisplayName("symbol")]
		public static string Symbol() => "DUMMY";

		[DisplayName("decimals")]
		public static byte Decimals() => 0;

		[DisplayName("totalSupply")]
		public static BigInteger TotalSupply() => 10000;

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
			ValidateToken((BigInteger)tokenId);

			// Get the owner of the token and check that it's really it that is calling the contract
			UInt160 from = (UInt160)TokenToOwner[tokenId];
			if (!Runtime.CheckWitness(from)) return false;

			// Do ownership update if transferred to other address
			if (from != to)
			{
				// Assign the token to the new owner
				TokenToOwner[tokenId] = to;
				// Update token owners balances
				UpdateBalance(from, tokenId, -1);
				UpdateBalance(to, tokenId, +1);
			}

			PostTransfer(from, to, tokenId);
			return true;
		}

		[DisplayName("_deploy")]
		public static void Deploy(object data, bool update)
		{
			if (update) return;
			// Initialize contract data
			Storage.Put(Storage.CurrentContext, "OwnerAddress", (ByteString)Tx.Sender);
			Storage.Put(Storage.CurrentContext, "TokenCount", 0);
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

		private static void ValidateToken(BigInteger tokenId)
		{
			BigInteger tokenCount = TokenCount();
			if (tokenId < 1 || tokenId > tokenCount) throw new Exception("Invalid token id");
		}

		private static void UpdateBalance(UInt160 address, ByteString tokenId, int increment)
		{
			BigInteger tokenCount = (BigInteger)AddressToTokenCount[address];

			tokenCount += increment;
			if (tokenCount < 0) throw new Exception("An address cannot have negative token count");

			if (tokenCount.IsZero)
				AddressToTokenCount.Delete(address);
			else
				AddressToTokenCount.Put(address, tokenCount);
		}

		private static void PostTransfer(UInt160 from, UInt160 to, ByteString tokenId)
		{
			OnTransfer(from, to, 1, tokenId);
			if (to is not null && ContractManagement.GetContract(to) is not null)
				Contract.Call(to, "onNEP11Payment", CallFlags.All, from, 1, tokenId);
		}
	}
}
