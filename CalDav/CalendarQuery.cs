using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace CalDav {
	public class CalendarQuery {
		public class CalendarData : Property {
			internal override XElement Serialize() {
				return new XElement(Common.xCaldav.GetName("calendar-data"));
			}
		}

		public abstract class Property {
			internal abstract XElement Serialize();
			public static implicit operator XElement(Property query) {
				return query.Serialize();
			}
		}

		public Filter Filter { get; set; }
		public List<Property> Properties { get; set; }

		public static CalendarQuery SearchEvents(DateTime? from = null, DateTime? to = null) {
			return new CalendarQuery {
				Properties = new System.Collections.Generic.List<CalendarQuery.Property> {
					  new CalendarQuery.CalendarData()
				 },
				Filter = new Filter {
					Filters = new[] {
							new  Filter.CompFilter {
								Name = "VCALENDAR",
								Filters =  new [] {
								  to == null &&  from == null  ?  null :	new Filter.CompFilter  {
										 Name = "VEVENT", 
										 TimeRange = new Filter.TimeRangeFilter {
												Start=  from.Value,
												End= to.Value,
										 } 
									}
								}
						 }
					}
				}
			};
		}

		public static implicit operator XElement(CalendarQuery query) {
			return new XElement(Common.xCaldav.GetName("calendar-query"),
					new XElement(Common.xDAV.GetName("prop"), query.Properties.Select(x => (XElement)x)),
					(XElement)query.Filter
				);
		}
	}
}
