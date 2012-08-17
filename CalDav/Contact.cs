
using System.Net.Mail;
namespace CalDav {
	public class Contact : IHasParameters {
		public Contact() { }
		public Contact(MailAddress addr) {
			Name = addr.DisplayName;
			Email = addr.Address;
		}

		public string Name { get; set; }
		public string Email { get; set; }
		public string SentBy { get; set; }
		public string Directory { get; set; }

		public static  implicit operator MailAddress(Contact c){
			return new MailAddress(c.Email, c.Name);
		} 

		public string GetParameterString() {
			return (Name == null ? null : (";CN=\"" + Common.ParamEncode(Name) + "\""))
				+ (Directory == null ? null : (";DIR=\"" + Common.ParamEncode(Directory) + "\""))
				+ (SentBy == null ? null : (";SENT-BY=\"MAILTO:" + SentBy + "\""));
		}

		public override string ToString() {
			return Email;
		}
	}
}
