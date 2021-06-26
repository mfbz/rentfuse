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
		private const ulong MIN_RENT_DURATION = 1000 * 60 * 60 * 24; // 1 day in ms

		private static ByteString OwnerAddress() => (ByteString)Storage.Get(Storage.CurrentContext, "OwnerAddress");
		private static BigInteger TokenCount() => (BigInteger)Storage.Get(Storage.CurrentContext, "TokenCount");
		private static StorageMap TokenToRent => new StorageMap(Storage.CurrentContext, "TokenToRent");

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
			// Call nft contract to get the owner of the nft (Only the owner of an nft can lend a token)
			UInt160 owner = (UInt160)Contract.Call(nft.TokenScriptHash, "ownerOf", CallFlags.ReadOnly, new object[] { nft.TokenId });
			// Check that the owner of the nft is the person that is calling the contract
			if (!owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(owner)) throw new Exception("Only the owner can lend a NFT");

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
			TokenToRent.Put((ByteString)tokenCount, StdLib.Serialize(rent));

			// Fire event to notify that a token has been created
			OnTokenCreated((ByteString)tokenCount, owner);
		}

		public bool WithdrawRent(ByteString tokenId)
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
				if (rent.IsCompleted())
				{
					rent.State = Rent.StateType.Closed;
					rent.ClosedOn = Runtime.Time;
				}

				// Save updated rent
				TokenToRent.Put(tokenId, StdLib.Serialize(rent));
				return true;
			}

			// As default return that the withdraw doesn't went well
			return false;
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

		public bool Withdraw(UInt160 to)
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
