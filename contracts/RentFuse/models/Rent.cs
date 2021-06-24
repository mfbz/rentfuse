using System.Numerics;
using Neo;

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
		public BigInteger Balance;
		public StateType State;
		public ulong Duration;
		public ulong CreatedOn;
		public ulong RentedOn;
		public ulong ClosedOn;
	}
}
