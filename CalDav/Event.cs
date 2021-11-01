using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using CalCli.API;

namespace CalDav {
	public class Event : ICalendarObject, IEvent {
		private DateTime DTSTAMP = DateTime.UtcNow;

		public Event() {
			Attendees = new List<Contact>();
			Alarms = new List<IAlarm>();
			Categories = new List<string>();
			Recurrences = new List<Recurrence>();
			Properties = new List<Tuple<string, string, System.Collections.Specialized.NameValueCollection>>();
			Attachments = new List<Uri>();
		}

		public virtual Calendar Calendar { get; set; }
		public virtual ICollection<Contact> Attendees { get; set; }
		public virtual ICollection<IAlarm> Alarms { get; set; }
		public virtual ICollection<string> Categories { get; set; }
		public virtual ICollection<Uri> Attachments { get; set; }
		public virtual Classes? Class { get; set; }
		public virtual DateTime? Created { get; set; }
		public virtual string Description { get; set; }
		public virtual bool IsAllDay { get; set; }
		public virtual DateTime? LastModified { get; set; }
		public virtual DateTime? Start { get; set; }
		public virtual DateTime? End { get; set; }
		public virtual string Location { get; set; }
		public virtual int? Priority { get; set; }
		public virtual Statuses? Status { get; set; }
		public virtual int? Sequence { get; set; }
		public virtual string Summary { get; set; }
		public virtual string Transparency { get; set; }
		public virtual string UID { get; set; }
		public virtual Uri Url { get; set; }
		public virtual Contact Organizer { get; set; }
		public virtual ICollection<Recurrence> Recurrences { get; set; }

		public ICollection<Tuple<string, string, System.Collections.Specialized.NameValueCollection>> Properties { get; set; }

		ICollection<IAlarm> IEvent.Alarms
		{
			get
			{
				List<IAlarm> result = new List<IAlarm>();
				foreach(Alarm alarm in Alarms)
				{
					result.Add(alarm); 
				}
				return result;
			}

			set
			{
				Alarms.Clear();
				foreach(IAlarm alarm in value)
				{
					Alarms.Add((Alarm)alarm);
				}
			}
		}

			public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name.ToUpper()) {
					case "BEGIN":
						switch (value) {
							case "VALARM":
								var a = serializer.GetService<Alarm>();
								a.Deserialize(rdr, serializer);
								Alarms.Add(a);
								break;
						}
						break;
					case "ATTENDEE":
						var contact = new Contact();
						contact.Deserialize(value, parameters);
						Attendees.Add(contact);
						break;
					case "CATEGORIES":
						Categories = value.SplitEscaped().ToList();
						break;
					case "CLASS": Class = value.ToEnum<Classes>(); break;
					case "CREATED": Created = value.ToDateTime(); break;
					case "DESCRIPTION": Description = value; break;
					case "DTEND":
						End = value.ToDateTime();
						if (End == null)
						{
							DateTime endDate;
							if (DateTime.TryParseExact(value, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out endDate))
							{
								End = endDate;
							}
						}
						break;
					case "DTSTAMP": DTSTAMP = value.ToDateTime().GetValueOrDefault(); break;
					case "DTSTART":
						Start = value.ToDateTime();
						if (Start == null)
						{
							DateTime startDate;
							if (DateTime.TryParseExact(value, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out startDate))
							{
								Start = startDate;
							}
						}
						break;
					case "LAST-MODIFIED": LastModified = value.ToDateTime(); break;
					case "LOCATION": Location = value; break;
					case "ORGANIZER":
						Organizer = serializer.GetService<Contact>();
						Organizer.Deserialize(value, parameters);
						break;
					case "PRIORITY": Priority = value.ToInt(); break;
					case "SEQUENCE": Sequence = value.ToInt(); break;
					case "STATUS": Status = value.ToEnum<Statuses>(); break;
					case "SUMMARY": Summary = value; break;
					case "TRANSP": Transparency = value; break;
					case "UID": UID = value; break;
					case "URL": Url = value.ToUri(); break;
					case "ATTACH":
						var attach = value.ToUri();
						if (attach != null)
							Attachments.Add(attach);
						break;
					case "RRULE":
						var rule = serializer.GetService<Recurrence>();
						rule.Deserialize(null, parameters);
						Recurrences.Add(rule);
						break;
					case "END": return;
					default:
						Properties.Add(Tuple.Create(name, value, parameters));
						break;
				}
			}

			IsAllDay = Start == End;
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			if (End != null && Start != null && End < Start)
				End = Start;

			wrtr.BeginBlock("VEVENT");
			wrtr.Property("UID", UID);
			if (Attendees != null)
				foreach (var attendee in Attendees)
					wrtr.Property("ATTENDEE", attendee);
			if (Categories != null && Categories.Count > 0)
				wrtr.Property("CATEGORIES", Categories);
			wrtr.Property("CLASS", Class);
			wrtr.Property("CREATED", Created);
			wrtr.Property("DESCRIPTION", Description);
			if (IsAllDay)
			{
				wrtr.Property("DTEND;VALUE=DATE", (End ?? Start.Value).ToString("yyyyMMdd"));
				wrtr.Property("DTSTART;VALUE=DATE", (Start ?? End.Value).ToString("yyyyMMdd"));
			}
			else
			{
				wrtr.Property("DTEND", End);
				wrtr.Property("DTSTART", Start);
			}
			wrtr.Property("DTSTAMP", DTSTAMP);
			wrtr.Property("LAST-MODIFIED", LastModified);
			wrtr.Property("LOCATION", Location);
			wrtr.Property("ORGANIZER", Organizer);
			wrtr.Property("PRIORITY", Priority);
			wrtr.Property("SEQUENCE", Sequence);
			wrtr.Property("STATUS", Status);
			wrtr.Property("SUMMARY", Summary);
			wrtr.Property("TRANSP", Transparency);
			wrtr.Property("URL", Url);

			if (Properties != null)
				foreach (var prop in Properties)
					wrtr.Property(prop.Item1, prop.Item2, parameters: prop.Item3);

			if (Alarms != null)
				foreach (var alarm in Alarms)
					((Alarm)alarm).Serialize(wrtr);
			wrtr.EndBlock("VEVENT");
		}
	}
}
