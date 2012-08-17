using CalDav;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using System;
using System.Collections.Specialized;
using System.Net.Mail;

namespace Tests {
	[TestClass]
	public class ParsingBasic {
		[TestMethod]
		public void KeyValue() {
			var values = DeserializeProperty("TEST;VALUE1=ONE;VALUE2=TWO:tested\n\t tested");
			values.Item1.ShouldBe("TEST");
			values.Item2.ShouldBe("tested tested");
			values.Item3["VALUE1"].ShouldBe("ONE");
			values.Item3["VALUE2"].ShouldBe("TWO");
		}

		private static Tuple<string, string, NameValueCollection> DeserializeProperty(string text) {
			using (var rdr = new System.IO.StringReader(text)) {
				string name, value;
				var parameters = new System.Collections.Specialized.NameValueCollection();
				rdr.Property(out name, out value, parameters);
				if (name == null) return null;
				return Tuple.Create(name, value, parameters);
			}
		}

		[TestMethod]
		public void Contact() {
			var values = DeserializeProperty("ORGANIZER;CN=JohnSmith;DIR=\"ldap" + "://host.com:6666/o=3DDC Associ\n\tates,c=3DUS??(cn=3DJohn Smith)\":MAILTO" + ":jsmith@host1.com");
			var contact = new Contact();
			contact.Deserialize(values.Item2, values.Item3);

			contact.Name.ShouldBe("JohnSmith");
			contact.Email.ShouldBe("jsmith@host1.com");
			var addr = (MailAddress)contact;
			addr.DisplayName.ShouldBe("JohnSmith");
			addr.Address.ShouldBe("jsmith@host1.com");

			contact.Directory.ShouldBe("ldap" + "://host.com:6666/o=DC Associates,c=US??(cn=John Smith)");
		}
	}
}
