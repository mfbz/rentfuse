using System;
using System.ComponentModel;
using System.Numerics;

using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Native;
using Neo.SmartContract.Framework.Services;
using RentFuse.Models;

namespace RentFuse
{
	[DisplayName("mfbz.RentFuseContract")]
	[ManifestExtra("Author", "Michael Fabozzi")]
	[ManifestExtra("Name", "RentFuseContract")]
	[ManifestExtra("Description", "Peer to peer renting of Neo N3 NFTs")]
	[ManifestExtra("Version", "1.0.0")]
	public class RentFuseContract : SmartContract
	{
		private static ByteString OwnerAddress() => (ByteString)Storage.Get(Storage.CurrentContext, "OwnerAddress");
		private static BigInteger TokenCount() => (BigInteger)Storage.Get(Storage.CurrentContext, "TokenCount");
		private static StorageMap TokenToRent => new StorageMap(Storage.CurrentContext, "TokenToRent");

		private static Transaction Tx => (Transaction)Runtime.ScriptContainer;

		// Fires whenever a token is created (providing the token ID and the address of the owner)
		[DisplayName("TokenCreated")]
		public static event Action<BigInteger, UInt160> OnTokenCreated;

		public static void CreateToken(NFT nft, BigInteger price, ulong duration)
		{
			// Call nft contract to get the owner of the nft (Only the owner of an nft can lend a token)
			UInt160 owner = (UInt160)Contract.Call(nft.ContractAddress, "ownerOf", CallFlags.ReadOnly, new object[] { nft.TokenId });
			// Check that the owner of the nft is the person that is calling the contract
			Runtime.CheckWitness(owner);

			// Create a token id that is token count plus 1
			BigInteger tokenCount = TokenCount();
			tokenCount += 1;

			// Create rent object and fill it with properties
			Rent rent = new()
			{
				Owner = owner,
				Tenant = null,
				NFT = nft,
				Price = price,
				Balance = 0,
				State = Rent.StateType.Open,
				Duration = duration,
				CreatedOn = Runtime.Time,
				RentedOn = 0,
				ClosedOn = 0
			};

			// Update global token count
			Storage.Put(Storage.CurrentContext, "TokenCount", tokenCount);
			// Assign token to rent object
			TokenToRent.Put((ByteString)tokenCount, StdLib.Serialize(rent));

			// Fire event to notify that a token has been created
			OnTokenCreated(tokenCount, owner);
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

		private static void ValidateOwner()
		{
			ByteString owner = OwnerAddress();
			if (!Runtime.CheckWitness((UInt160)owner)) throw new Exception("No authorization");
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
	}
}
