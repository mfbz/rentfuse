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
	[ContractPermission("*", "*")]
	public class RentFuseContract : SmartContract
	{
		private const int MAX_GET_COUNT = 100;

		// The address of the owner of the contract
		private static ByteString OwnerAddress() => (ByteString)Storage.Get(Storage.CurrentContext, "OwnerAddress");
		// The total token count minted
		private static BigInteger TokenCount() => (BigInteger)Storage.Get(Storage.CurrentContext, "TokenCount");

		// TokenId -> Rent (NB: Token are never deleted!)
		private static StorageMap TokenToRent => new StorageMap(Storage.CurrentContext, "TokenToRent");
		// Address + Index -> TokenId
		private static StorageMap OwnerToToken => new StorageMap(Storage.CurrentContext, "OwnerToToken");
		// Address -> LastIndex (count)
		private static StorageMap OwnerToTokenCount => new StorageMap(Storage.CurrentContext, "OwnerToTokenCount");
		// Address + Index -> TokenId
		private static StorageMap TenantToToken => new StorageMap(Storage.CurrentContext, "TenantToToken");
		// Address -> LastIndex (count)
		private static StorageMap TenantToTokenCount => new StorageMap(Storage.CurrentContext, "TenantToTokenCount");
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

		// data contains [action: Integer, tokenId: ByteString]
		public static void OnNEP17Payment(UInt160 from, BigInteger amount, object[] data)
		{
			ValidateAddress(from);
			if (Runtime.CallingScriptHash != GAS.Hash) throw new Exception("RentFuse only accepts GAS tokens");
			if (amount <= 0) throw new Exception("Invalid payment amount");
			if (data == null || data.Length != 2) throw new Exception("Invalid data argument");

			// Execute a different function depending on data action
			switch (data[0])
			{
				case 0:
					RentToken((ByteString)data[1], from, amount);
					break;
				case 1:
					PayToken((ByteString)data[1], from, amount);
					break;
				default:
					throw new Exception("Invalid action");
			}
		}

		public static void CreateToken(UInt160 NFTScriptHash, ByteString NFTTokenId, BigInteger price, ulong duration)
		{
			// Call nft contract to get the owner of the nft and check if it exists (Only the owner of an nft can lend a token)
			UInt160 owner = (UInt160)Contract.Call(NFTScriptHash, "ownerOf", CallFlags.ReadOnly, new object[] { NFTTokenId });
			// Check that the owner of the nft is the person that is calling the contract
			if (!owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(owner)) throw new Exception("Only the owner can lend a NFT");
			// Check that the NFT is not listed in a open token
			if (IsNFTListed(NFTScriptHash, NFTTokenId)) throw new Exception("The NFT is already listed");
			// Check that the NFT has not been rented yet, a nft can only have 1 open rent
			if (IsNFTRented(NFTScriptHash, NFTTokenId)) throw new Exception("The NFT is already rented");
			// Check that price is valid
			if (price <= 0) throw new Exception("Invalid price");
			// Check that duration is valid, at least 1 day
			if (duration < Rent.ONE_DAY_MS) throw new Exception("Invalid duration, minimum is 1 day");

			// Create a token id that is token count plus 1
			BigInteger tokenCount = TokenCount();
			tokenCount += 1;

			// Create rent object and fill it with properties
			Rent rent = new()
			{
				TokenId = (ByteString)tokenCount,
				Owner = owner,
				Tenant = null,
				NFTScriptHash = NFTScriptHash,
				NFTTokenId = NFTTokenId,
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

			// Calculate owner token new count
			BigInteger ownerTokenCount = (BigInteger)OwnerToTokenCount[rent.Owner];
			ownerTokenCount += 1;
			// Save the value in its storage map
			OwnerToToken.Put(Helper.Concat((byte[])rent.Owner, ownerTokenCount.ToByteArray()), rent.TokenId);
			OwnerToTokenCount.Put(rent.Owner, ownerTokenCount);

			// Assign token to nft
			NFTToToken.Put(Helper.Concat((byte[])rent.NFTScriptHash, rent.NFTTokenId), rent.TokenId);

			// Fire event to notify that a token has been created
			OnTokenCreated((ByteString)tokenCount, owner);
		}

		// Withdraw available balance from token rent and close it if it's terminated
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
				// Variable indicating if the rent has been closed now to emit the correct event
				bool hasClosed = false;

				// Update balance decreasing it by withdrawn amount
				rent.Balance = rent.Balance - withdrawableAmount;
				// Check if the rent is finished and not already closed if so set it as closed
				if (rent.IsFilled() && rent.IsFinished() && rent.State != Rent.StateType.Closed)
				{
					rent.State = Rent.StateType.Closed;
					rent.ClosedOn = Runtime.Time;

					hasClosed = true;
				}

				// Save updated rent
				TokenToRent.Put(tokenId, StdLib.Serialize(rent));

				// Emit closed event if rent has been closed with this withdraw operation
				if (hasClosed) OnTokenClosed(tokenId, rent.Owner);

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

		// Close the rent if it's open and the owner doesn't want it anymore or if rented and all concluded
		public static void CloseRent(ByteString tokenId)
		{
			ValidateToken(tokenId);

			// Get the rent associated with the token
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Check that the address calling this function is the owner of the rent
			if (!rent.Owner.Equals((UInt160)Tx.Sender) || !Runtime.CheckWitness(rent.Owner)) throw new Exception("Only the owner can withdraw token rent");
			// Check that the rent is not already closed
			if (rent.State == Rent.StateType.Closed) throw new Exception("You cannot close a token that is already closed");
			// Check that the token is not still rented
			if (rent.State == Rent.StateType.Rented && !rent.IsFinished()) throw new Exception("You cannot close a token that is still rented");

			// Update the rent
			rent.State = Rent.StateType.Closed;
			rent.ClosedOn = Runtime.Time;

			// Save updated rent
			TokenToRent.Put(tokenId, StdLib.Serialize(rent));

			// Fire token closed event
			OnTokenClosed(tokenId, rent.Owner);
		}

		// Check if a nft is rented or not
		public static bool IsNFTRented(UInt160 NFTScriptHash, ByteString NFTTokenId)
		{
			// Get the token id associated to input nft if any
			ByteString tokenId = NFTToToken[Helper.Concat((byte[])NFTScriptHash, NFTTokenId)];
			if (tokenId != null)
			{
				// Get the rent associated with the token
				Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

				// It's considered rented if the associated token has rented status not finished
				return rent.State == Rent.StateType.Rented && !rent.IsFinished();
			}

			return false;
		}

		// Check if a nft is listed or not
		public static bool IsNFTListed(UInt160 NFTScriptHash, ByteString NFTTokenId)
		{
			// Get the token id associated to input nft if any
			ByteString tokenId = NFTToToken[Helper.Concat((byte[])NFTScriptHash, NFTTokenId)];
			if (tokenId != null)
			{
				// Get the rent associated with the token
				Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

				// It's considered listed if it's in a open state
				return rent.State == Rent.StateType.Open;
			}

			return false;
		}


		public static string GetRent(ByteString tokenId)
		{
			ValidateToken(tokenId);
			Rent rent = (Rent)StdLib.Deserialize(TokenToRent[tokenId]);

			// Return it as JSON string for easier data access
			var result = new object[] { rent };
			return StdLib.JsonSerialize(result);
		}

		// Get a rent list in descending order from index (inclusive) or last one if passed 0 (default for BigInteger)
		public static string GetRentList(BigInteger fromIndex)
		{
			BigInteger tokenCount = TokenCount();
			// Check that fromIndex is valid
			if (fromIndex < 0 || fromIndex > tokenCount) throw new Exception("Invalid starting index");

			// Initialize an empty list that will be returned filled with rent found
			List<Rent> rentList = new List<Rent>();
			// Cycle starting from last index until final index calculated considering the max record i can return from a GET
			for (BigInteger i = (fromIndex == 0) ? tokenCount : fromIndex; i > ((fromIndex - MAX_GET_COUNT > 0) ? (fromIndex - MAX_GET_COUNT) : 0); i--)
			{
				rentList.Add((Rent)StdLib.Deserialize(TokenToRent[(ByteString)i]));
			}

			// Return it as JSON string for easier data access
			var result = new object[] { rentList };
			return StdLib.JsonSerialize(result);
		}

		// Get rent list as owner of rent token with pagination through fromIndex arg
		public static string GetRentListAsOwner(UInt160 owner, BigInteger fromIndex)
		{
			ValidateAddress(owner);

			BigInteger tokenCount = (BigInteger)OwnerToTokenCount[owner];
			// Check that fromIndex is valid
			if (fromIndex < 0 || fromIndex > tokenCount) throw new Exception("Invalid starting index");

			// Initialize an empty list that will be returned filled with rent found
			List<Rent> rentList = new List<Rent>();
			// Cycle starting from last index until final index calculated considering the max record i can return from a GET
			for (BigInteger i = (fromIndex == 0) ? tokenCount : fromIndex; i > ((fromIndex - MAX_GET_COUNT > 0) ? (fromIndex - MAX_GET_COUNT) : 0); i--)
			{
				// Get the token id at index i
				ByteString tokenId = OwnerToToken[Helper.Concat((byte[])owner, i.ToByteArray())];
				// Get token at id and add to rent list
				rentList.Add((Rent)StdLib.Deserialize(TokenToRent[tokenId]));
			}

			// Return it as JSON string for easier data access
			var result = new object[] { rentList };
			return StdLib.JsonSerialize(result);
		}

		// Get rent list as tenant of rent token with pagination through fromIndex arg
		public static string GetRentListAsTenant(UInt160 tenant, BigInteger fromIndex)
		{
			ValidateAddress(tenant);

			BigInteger tokenCount = (BigInteger)TenantToTokenCount[tenant];
			// Check that fromIndex is valid
			if (fromIndex < 0 || fromIndex > tokenCount) throw new Exception("Invalid starting index");

			// Initialize an empty list that will be returned filled with rent found
			List<Rent> rentList = new List<Rent>();
			// Cycle starting from last index until final index calculated considering the max record i can return from a GET
			for (BigInteger i = (fromIndex == 0) ? tokenCount : fromIndex; i > ((fromIndex - MAX_GET_COUNT > 0) ? (fromIndex - MAX_GET_COUNT) : 0); i--)
			{
				// Get the token id at index i
				ByteString tokenId = TenantToToken[Helper.Concat((byte[])tenant, i.ToByteArray())];
				// Get token at id and add to rent list
				rentList.Add((Rent)StdLib.Deserialize(TokenToRent[tokenId]));
			}

			// Return it as JSON string for easier data access
			var result = new object[] { rentList };
			return StdLib.JsonSerialize(result);
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

			// Calculate tenant token new count
			BigInteger tenantTokenCount = (BigInteger)TenantToTokenCount[rent.Tenant];
			tenantTokenCount += 1;
			// Save the value in its storage map
			TenantToToken.Put(Helper.Concat((byte[])rent.Tenant, tenantTokenCount.ToByteArray()), rent.TokenId);
			TenantToTokenCount.Put(rent.Tenant, tenantTokenCount);

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
