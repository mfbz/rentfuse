namespace RentFuse.Models
{
	public class NEP17PaymentData
	{
		public enum ActionType
		{
			RentToken,
			PayToken
		}

		public ActionType Action;
		public object[] Payload;
	}
}
