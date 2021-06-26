using System;
using System.Numerics;
using Neo;
using Neo.SmartContract.Framework.Services;

namespace RentFuse.Models
{
	public class Rent
	{
		public enum StateType
		{
			Open,
			Rented,
			Closed
		}

		public UInt160 Owner;
		public UInt160 Tenant;
		public NFT NFT;
		public BigInteger Price;
		public BigInteger Balance; // The balance available to the rent as example for withdrawing 
		public BigInteger Amount; // The amount of the rent paid
		public StateType State;
		public ulong Duration;
		public ulong CreatedOn;
		public ulong RentedOn;
		public ulong ClosedOn;

		public BigInteger GetWithdrawableAmount()
		{
			return Balance;
		}

		public bool IsCompleted()
		{
			// Is considered completed if the tenant has paid it all and the duration is concluded
			return (Amount >= Price * TimeSpan.FromMilliseconds(Duration).Days) && (Runtime.Time >= RentedOn + Duration);
		}
	}
}
