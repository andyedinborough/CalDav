using CalDav;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;

namespace Tests {
	[TestClass]
	public class ParsingBasic {
		[TestMethod]
		public void KeyValue() {

			var text = "TEST;VALUE1=ONE;VALUE2=TWO:tested\n\t tested";
			using (var rdr = new System.IO.StringReader(text)) {
				string name, value;
				var parameters = new System.Collections.Specialized.NameValueCollection();
				rdr.Property(out name, out value, parameters);

				name.ShouldBe("TEST");
				value.ShouldBe("tested tested");
				parameters["VALUE1"].ShouldBe("ONE");
				parameters["VALUE2"].ShouldBe("TWO");

			}
		}
	}
}
