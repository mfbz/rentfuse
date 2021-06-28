using System;
using System.ComponentModel;
using System.Linq;
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
		private const int MAX_GET_COUNT = 100;
		private static ByteString OwnerAddress() => (ByteString)Storage.Get(Storage.CurrentContext, "OwnerAddress");
		private static BigInteger TokenCount() => (BigInteger)Storage.Get(Storage.CurrentContext, "TokenCount");

		// TokenId -> Rent
		private static StorageMap TokenToRent => new StorageMap(Storage.CurrentContext, "TokenToRent");
		// Address + TokenId -> TokenId
		private static StorageMap OwnerToToken => new StorageMap(Storage.CurrentContext, "OwnerToToken");
		// Address + TokenId -> TokenId
		private static StorageMap TenantToToken => new StorageMap(Storage.CurrentContext, "TenantToToken");
		// NFT_TokenScriptHash + NFT_TokenId -> TokenId (Unique per NFT because it's used to check rent status)
		private static StorageMap NFTToToken => new StorageMap(Storage.CurrentContext, "NFTToToken");

		private static Transaction Tx => (Transaction)Runtime.ScriptContainer;

		// Fires whenever a token is created (providing the token ID and the address of the owner)
		[DisplayName("TokenCreated")]
		public static event Action<ByteString, UInt160> OnTokenCreated;
		// Fires whenever a token is rented (providing the token ID and the address of the tenant)
		[DisplayName("TokenRented")]
		public static event Action<ByteString, UInt160> OnTokenRented;
		// Fires whenever a token rent is paid (providing the token ID and the address of the tenant)
		[DisplayName("TokenPaid")]
		public static event Action<ByteString, UInt160> OnTokenPaid;
		// Fires whenever a token rent is closed (providing the token ID and the address of the owner)
		[DisplayName("TokenClosed")]
		public static event Action<ByteString, UInt160> OnTokenClosed;

		public static void OnNEP17Payment(UInt160 from, BigInteger amount, NEP17PaymentData data)
		{
			ValidateAddress(from);
			if (Runtime.CallingScriptHash != GAS.Hash) throw new Exception("RentFuse only accepts GAS tokens");
			if (amount <= 0) throw new Exception("Invalid payment amount");
			if (data == null) throw new Exception("Invalid data argument");

			// Execute a different function depending on data action
			switch (data.Action)
			{
				case NEP17PaymentData.ActionType.RentToken:
					RentToken((ByteString)data.Payload[0], from, amount);
					break;
				case NEP17PaymentData.ActionType.PayToken:
					PayToken((ByteString)data.Payload[0], from, amount);
					break;
				default:
					throw new Exception("Invalid action");
			}
		}

		public static void CreateToken(NFT nft, BigInteger price, ulong duration)
		{
			// Call nft contract to get the owner of the nft and check if it exists (Only the owner of an nft can lend a token)
			UInt160 owner = (UInt160)Contract.Call(nft.TokenScriptHash, "ownerOf", CallFlags.ReadOnly, new object[] { nft.TokenId });
			// Check that the owner of the nft is the person that is calling the contract
			if (!owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(owner)) throw new Exception("Only the owner can lend a NFT");
			// Check that the NFT has not been rented yet, a nft can only have 1 open rent
			if (IsRented(nft)) throw new Exception("Cannot create a token for a rented NFT");

			// Create a token id that is token count plus 1
			BigInteger tokenCount = TokenCount();
			tokenCount += 1;

			// Create rent object and fill it with properties
			Rent rent = new()
			{
				TokenId = (ByteString)tokenCount,
				Owner = owner,
				Tenant = null,
				NFT = nft,
				Price = price,
				Balance = 0,
				Amount = 0,
				State = Rent.StateType.Open,
				Duration = duration,
				CreatedOn = Runtime.Time,
				RentedOn = 0,
				ClosedOn = 0
			};

			// Update global token count
			Storage.Put(Storage.CurrentContext, "TokenCount", tokenCount);

			// Assign token to rent object
			TokenToRent.Put(rent.TokenId, StdLib.Serialize(rent));
			// Assign token to owner
			OwnerToToken.Put(rent.Owner + rent.TokenId, rent.TokenId);

			// Assign token to nft
			NFTToToken.Put(rent.NFT.TokenScriptHash + rent.NFT.TokenId, rent.TokenId);

			// Fire event to notify that a token has been created
			OnTokenCreated((ByteString)tokenCount, owner);
		}

		// Withdraw available balance from token rent and close it if it's terminated, it's like the terminating function
		public static bool WithdrawRent(ByteString tokenId)
		{
			ValidateToken(tokenId);

			// Get the rent associated with the token
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Check that the address calling this function is the owner of the rent
			if (!rent.Owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(rent.Owner)) throw new Exception("Only the owner can withdraw token rent");
			// Check that the rent is not open, otherwise i cannot withdraw anything
			if (rent.State == Rent.StateType.Open) throw new Exception("You cannot withdraw from an open token rent");

			// Get the amount the user can withdraw from rent token
			BigInteger withdrawableAmount = rent.GetWithdrawableAmount();
			// Transfer the amount to rent owner and update rent balance to prevent further withdraw
			if (GAS.Transfer(Runtime.ExecutingScriptHash, rent.Owner, withdrawableAmount))
			{
				// Update balance decreasing it by withdrawn amount
				rent.Balance = rent.Balance - withdrawableAmount;
				// Check if the rent is finished and if so set it as closed
				if (rent.IsFilled() && rent.IsFinished())
				{
					rent.State = Rent.StateType.Closed;
					rent.ClosedOn = Runtime.Time;
				}

				// Save updated rent
				TokenToRent.Put(tokenId, StdLib.Serialize(rent));

				// Do final operations if the rent has been closed with this withdraw
				if (rent.State == Rent.StateType.Closed)
					// Fire token closed event if it has been closed
					OnTokenClosed(tokenId, rent.Owner);

				// Return true, everything went well
				return true;
			}

			// As default return that the withdraw doesn't went well
			return false;
		}

		// Revoke the rent if the tenant doesn't pay and the rent is expired
		public static void RevokeRent(ByteString tokenId)
		{
			ValidateToken(tokenId);

			// Get the rent associated with the token
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Check that the address calling this function is the owner of the rent
			if (!rent.Owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(rent.Owner)) throw new Exception("Only the owner can withdraw token rent");
			// Check that the rent is in rented state, otherwise i cannot close it
			if (rent.State != Rent.StateType.Rented) throw new Exception("You cannot revoke a token that is not rented");
			// Check that the the tenant is in time with payment
			if (!rent.IsExpired()) throw new Exception("You can revoke only an expired rent");

			// Update the rent
			rent.State = Rent.StateType.Closed;
			rent.ClosedOn = Runtime.Time;

			// Save updated rent
			TokenToRent.Put(tokenId, StdLib.Serialize(rent));

			// Fire token closed event
			OnTokenClosed(tokenId, rent.Owner);
		}

		// Close the rent if it's open and the owner doesn't want it anymore
		public static void CloseRent(ByteString tokenId)
		{
			ValidateToken(tokenId);

			// Get the rent associated with the token
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Check that the address calling this function is the owner of the rent
			if (!rent.Owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(rent.Owner)) throw new Exception("Only the owner can withdraw token rent");
			// Check that the rent is in open state, otherwise i cannot close it
			if (rent.State != Rent.StateType.Open) throw new Exception("You cannot close a token that is not open");

			// Update the rent
			rent.State = Rent.StateType.Closed;
			rent.ClosedOn = Runtime.Time;

			// Save updated rent
			TokenToRent.Put(tokenId, StdLib.Serialize(rent));

			// Fire token closed event
			OnTokenClosed(tokenId, rent.Owner);
		}

		// Check if an nft is in rented state
		public static bool IsRented(NFT nft)
		{
			// Get the token id associated to input nft if any
			ByteString tokenId = NFTToToken[nft.TokenScriptHash + nft.TokenId];
			if (tokenId != null)
			{
				// Get the rent associated with the token
				Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

				// It's considered rented if the associated token has rented status otherwise no
				return rent.State == Rent.StateType.Rented;
			}

			return false;
		}

		public static Rent GetRent(ByteString tokenId)
		{
			ValidateToken(tokenId);
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			return rent;
		}

		// Get a list of all the rents in the contracts, if reached max value returnable
		// startingIndex needs to be used for pagination purpose
		public static List<Rent> GetRentList(BigInteger startingIndex)
		{
			BigInteger finalIndex = startingIndex + MAX_GET_COUNT;

			// Create the rent list that will be returned
			List<Rent> rentList = new List<Rent>();

			// Create an iterator on all tokens removing key prefix
			Iterator iterator = TokenToRent.Find(FindOptions.RemovePrefix);
			// Iterate on the iterator to get a map of the token and rents
			while (iterator.Next())
			{
				var kvp = (object[])iterator.Value;

				var key = (ByteString)kvp[0];
				var rent = (Rent)StdLib.Deserialize((ByteString)kvp[1]);

				rentList.Add(rent);
			}

			return rentList;
		}

		public static List<Rent> GetRentListAsOwner(UInt160 owner)
		{
			ValidateAddress(owner);

			// Create the rent list that will be returned
			List<Rent> rentList = new List<Rent>();

			// Create an iterator on all owner tokens removing key prefix
			Iterator iterator = OwnerToToken.Find(owner, FindOptions.RemovePrefix);
			// Iterate on the iterator to get a map of the token and rents
			while (iterator.Next())
			{
				var kvp = (object[])iterator.Value;

				var key = (ByteString)kvp[0];
				var tokenId = (ByteString)kvp[1];

				rentList.Add((Rent)StdLib.Deserialize(TokenToRent[tokenId]));
			}

			return rentList;
		}

		public static List<Rent> GetRentListAsTenant(UInt160 tenant)
		{
			ValidateAddress(tenant);

			// Create the rent list that will be returned
			List<Rent> rentList = new List<Rent>();

			// Create an iterator on all tenant tokens removing key prefix
			Iterator iterator = TenantToToken.Find(tenant, FindOptions.RemovePrefix);
			// Iterate on the iterator to get a map of the token and rents
			while (iterator.Next())
			{
				var kvp = (object[])iterator.Value;

				var key = (ByteString)kvp[0];
				var tokenId = (ByteString)kvp[1];

				rentList.Add((Rent)StdLib.Deserialize(TokenToRent[tokenId]));
			}

			return rentList;
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

		public static bool Withdraw(UInt160 to)
		{
			ValidateOwner();
			ValidateAddress(to);

			var balance = GAS.BalanceOf(Runtime.ExecutingScriptHash);
			if (balance <= 0) return false;

			return GAS.Transfer(Runtime.ExecutingScriptHash, to, balance);
		}

		private static void ValidateOwner()
		{
			ByteString owner = OwnerAddress();
			if (!Runtime.CheckWitness((UInt160)owner)) throw new Exception("No authorization");
		}

		private static void ValidateAddress(UInt160 address)
		{
			if (address is null || !address.IsValid) throw new Exception("The argument <address> is invalid");
		}

		private static void ValidateToken(ByteString tokenId)
		{
			// Get rent data associated to token id passed
			var rentData = TokenToRent[tokenId];
			// If not found it means that the token id is invalid
			if (rentData == null) throw new Exception("Invalid token id");
		}

		// I can always pay at least for one day
		private static void RentToken(ByteString tokenId, UInt160 tenant, BigInteger amount)
		{
			ValidateToken(tokenId);

			// Get the rent associated to the token
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Check that the one who is calling the function is not the owner of the rent
			if (rent.Owner == tenant) throw new Exception("The tenant cannot rent its own token");
			// Check that the status of the rent is open to renting
			if (rent.State != Rent.StateType.Open) throw new Exception("Only open listed token can be rented");
			// Check that the amount is at least the price of a single day rent that is the min possible
			if (rent.Price > amount) throw new Exception("The amount is not enough to pay for the rent");

			// It's all ok, update rent data
			// Add all the amount trasnferred to the balance in case a person want to pay anticipately for the rent
			rent.Tenant = tenant;
			rent.State = Rent.StateType.Rented;
			rent.Balance = amount;
			rent.Amount = amount;
			rent.RentedOn = Runtime.Time;

			// Save updated rent
			TokenToRent.Put(tokenId, StdLib.Serialize(rent));
			// Assign token to account
			TenantToToken.Put(rent.Tenant + rent.TokenId, rent.TokenId);

			// Fire event to notify that a token has been created
			OnTokenRented(tokenId, tenant);
		}

		// I can only pay at least for 1 day
		private static void PayToken(ByteString tokenId, UInt160 tenant, BigInteger amount)
		{
			ValidateToken(tokenId);

			// Get the rent associated to the token
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Check that the status of the rent is open to renting
			if (rent.State != Rent.StateType.Rented) throw new Exception("Only rented token can be paid");
			// Check that the amount is at least the price of a single day rent that is the min possible
			if (rent.Price > amount) throw new Exception("The amount is not enough to pay for the rent");

			// It's all ok, update rent data
			rent.Balance = rent.Balance + amount;
			rent.Amount = rent.Amount + amount;

			// Save updated rent
			TokenToRent.Put(tokenId, StdLib.Serialize(rent));

			// Fire event to notify that a token has been created
			OnTokenPaid(tokenId, tenant);
		}
	}
}
