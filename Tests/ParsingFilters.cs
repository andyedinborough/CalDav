using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using System;
using System.Linq;
using System.Xml.Linq;

namespace Tests {
	[TestClass]
	public class Filters {
		[TestMethod]
		public void TimeZone() {

			var xdoc = XDocument.Parse(@"<?xml version=""1.0"" encoding=""utf-8"" ?>
<C:calendar-query xmlns:C=""urn:ietf:params:xml:ns:caldav"">
  <C:filter>
    <C:comp-filter name=""VCALENDAR"">
      <C:comp-filter name=""VTIMEZONE"">
        <C:is-defined/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>");

			var f = new CalDav.Filter(xdoc.Root.Elements().First());
			Test(f, x => {
				x.Filters[0].Name.ShouldBe("VCALENDAR");
				x.Filters[0].Filters[0].Name.ShouldBe("VTIMEZONE");
				x.Filters[0].Filters[0].IsDefined.ShouldBe(true);
			});
		}

		[TestMethod]
		public void ParticipationStatus() {

			var xdoc = XDocument.Parse(@"<?xml version=""1.0"" encoding=""utf-8"" ?>
<C:calendar-query xmlns:C=""urn:ietf:params:xml:ns:caldav"">
   <C:filter>
    <C:comp-filter name=""VCALENDAR"">
      <C:comp-filter name=""VEVENT"">
        <C:prop-filter name=""ATTENDEE"">
          <C:text-match
             caseless=""yes"">mailto:jsmith@foo.org</C:text-match>
          <C:param-filter name=""PARTSTAT"">
            <C:text-match caseless=""no"">NEEDS-ACTION</C:text-match>
          </C:param-filter>
        </C:prop-filter>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>");

			var f = new CalDav.Filter(xdoc.Root.Elements().First());
			Test(f, x => {
				x.Filters[0].Name.ShouldBe("VCALENDAR");
				x.Filters[0].Filters[0].Name.ShouldBe("VEVENT");
				var prop = x.Filters[0].Filters[0].Properties[0];
				prop.Name.ShouldBe("ATTENDEE");
				prop.IgnoreCase.ShouldBe(true);
				prop.Text.ShouldBe("mailto:jsmith@foo.org");
				prop.Parameters[0].Name.ShouldBe("PARTSTAT");
				prop.Parameters[0].Text.ShouldBe("NEEDS-ACTION");
				prop.Parameters[0].IgnoreCase.ShouldBe(false);
			});
		}

		[TestMethod]
		public void UID() {
			var xdoc = XDocument.Parse(@"<?xml version=""1.0"" encoding=""utf-8"" ?>
<C:calendar-query xmlns:C=""urn:ietf:params:xml:ns:caldav"">
  <C:filter>
    <C:comp-filter name=""VCALENDAR"">
      <C:comp-filter name=""VEVENT"">
        <C:prop-filter name=""UID"">
          <C:text-match
             caseless=""no"">20041121-FEEBDAED@foo.org</C:text-match>
        </C:prop-filter>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>");

			var f = new CalDav.Filter(xdoc.Root.Elements().First());
			Test(f, x => {
				x.Filters[0].Name.ShouldBe("VCALENDAR");
				x.Filters[0].Filters[0].Name.ShouldBe("VEVENT");
				var prop = x.Filters[0].Filters[0].Properties[0];
				prop.Name.ShouldBe("UID");
				prop.IgnoreCase.ShouldBe(false);
				prop.Text.ShouldBe("20041121-FEEBDAED@foo.org");
			});
		}

		[TestMethod]
		public void TimeRange() {
			var xdoc = XDocument.Parse(@"<?xml version=""1.0"" encoding=""utf-8"" ?>
<C:calendar-query xmlns:C=""urn:ietf:params:xml:ns:caldav"">
    <C:filter>
    <C:comp-filter name=""VCALENDAR"">
      <C:comp-filter name=""VTODO"">
        <C:comp-filter name=""VALARM"">
          <C:time-range start=""20041121T000000Z""
                        end=""20041121T235959Z""/>
        </C:comp-filter>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>");

			var f = new CalDav.Filter(xdoc.Root.Elements().First());
			Test(f, x => {
				x.Filters[0].Name.ShouldBe("VCALENDAR");
				x.Filters[0].Filters[0].Name.ShouldBe("VTODO");
				x.Filters[0].Filters[0].Filters[0].Name.ShouldBe("VALARM");
				var timerange = x.Filters[0].Filters[0].Filters[0].TimeRange;
				timerange.Start.ShouldBe(new DateTime(2004, 11, 21, 0, 0, 0, DateTimeKind.Utc));
				timerange.End.ShouldBe(new DateTime(2004, 11, 21, 23, 59, 59, DateTimeKind.Utc));
			});
		}

		private static void Test(CalDav.Filter filter, Action<CalDav.Filter> test){
			test(filter);
			filter = new CalDav.Filter((XElement)filter);
			test(filter);
		}
	}
}
