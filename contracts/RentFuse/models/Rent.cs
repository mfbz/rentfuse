using System.Numerics;
using Neo;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;

namespace RentFuse.Models
{
	public class Rent
	{
		public const ulong ONE_DAY_MS = 1000 * 60 * 60 * 24;

		public enum StateType
		{
			Open,
			Rented,
			Closed
		}

		public ByteString TokenId;
		public UInt160 Owner;
		public UInt160 Tenant;
		public UInt160 NFTScriptHash;
		public ByteString NFTTokenId;
		public BigInteger Price;
		public BigInteger Balance; // The balance available to the rent as example for withdrawing (+ and -) 
		public BigInteger Amount; // The amount of the rent paid (only +)
		public StateType State;
		public ulong Duration;
		public ulong CreatedOn;
		public ulong RentedOn;
		public ulong ClosedOn;

		public BigInteger GetWithdrawableAmount()
		{
			return Balance;
		}

		public BigInteger GetTotalCost()
		{
			return Price * GetDays(Duration);
		}

		public bool IsFilled()
		{
			return Amount >= GetTotalCost();
		}

		public bool IsFinished()
		{
			return Runtime.Time > RentedOn + Duration;
		}

		public bool IsExpired()
		{
			ulong now = Runtime.Time;

			// Fix ending date as maximum rent max duration
			if (now > RentedOn + Duration)
				now = RentedOn + Duration;

			return Amount < Price * GetDays(now - RentedOn);
		}

		private int GetDays(ulong durationMS)
		{
			return (int)(durationMS / ONE_DAY_MS);
		}
	}
}
