﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Xml.Linq;

namespace CalDav.Client
{
    public class Calendar
    {
        public Uri Url { get; set; }
        public NetworkCredential Credentials { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public void Initialize()
        {
            var result = Common.Request(Url, "PROPFIND", CalDav.Common.xDav.Element("propfind",
                CalDav.Common.xDav.Element("allprop")), Credentials, new Dictionary<string, object> {
					{ "Depth", 0 }
				});
            var xdoc = XDocument.Parse(result.Item2);
            var desc = xdoc.Descendants(CalDav.Common.xCalDav.GetName("calendar-description")).FirstOrDefault();
            var name = xdoc.Descendants(CalDav.Common.xDav.GetName("displayname")).FirstOrDefault();
            if (name != null) Name = name.Value;
            if (desc != null) Description = desc.Value;

            var resourceTypes = xdoc.Descendants(CalDav.Common.xDav.GetName("resourcetype"));
            if (!resourceTypes.Any(
                r => r.Elements(CalDav.Common.xDav.GetName("collection")).Any()
                    && r.Elements(CalDav.Common.xCalDav.GetName("calendar")).Any()
                ))
                throw new Exception("This server does not appear to support CALDAV");
        }

        public CalendarCollection Search(CalDav.CalendarQuery query)
        {
            var result = Common.Request(Url, "REPORT", (XElement)query, Credentials, new Dictionary<string, object> {
				{ "Depth", 1 }
			});
            var xdoc = XDocument.Parse(result.Item2);
            var data = xdoc.Descendants(CalDav.Common.xCalDav.GetName("calendar-data"));
            var serializer = new Serializer();
            return new CalendarCollection(data.SelectMany(x =>
            {
                using (var rdr = new System.IO.StringReader(x.Value))
                {
                    return serializer.Deserialize<CalendarCollection>(rdr);
                }
            }));
        }

        public void Save(Event e)
        {
            if (string.IsNullOrEmpty(e.UID)) e.UID = Guid.NewGuid().ToString();
            e.LastModified = DateTime.UtcNow;

            var result = Common.Request(new Uri(Url, e.UID + ".ics"), "PUT", (req, str) =>
            {
                req.Headers[System.Net.HttpRequestHeader.IfNoneMatch] = "*";
                req.ContentType = "text/calendar";
                var calendar = new CalDav.Calendar();
                e.Sequence = (e.Sequence ?? 0) + 1;
                calendar.Events.Add(e);
                Common.Serialize(str, calendar);

            }, Credentials);
            if (result.Item1 != System.Net.HttpStatusCode.Created && result.Item1 != HttpStatusCode.NoContent)
                throw new Exception("Unable to save event: " + result.Item1);
            e.Url = new Uri(Url, result.Item3[System.Net.HttpResponseHeader.Location]);

            GetObject(e.UID);
        }

        public CalendarCollection GetAll()
        {
            var result = Common.Request(Url, "PROPFIND", CalDav.Common.xCalDav.Element("calendar-multiget",
            CalDav.Common.xDav.Element("prop",
                CalDav.Common.xDav.Element("getetag"),
                CalDav.Common.xCalDav.Element("calendar-data")
                )
            ), Credentials, new Dictionary<string, object> { { "Depth", 1 } });




            return null;
        }

        public CalendarCollection GetObject(string uid)
        {
            var result = Common.Request(Url, "REPORT", CalDav.Common.xCalDav.Element("calendar-multiget",
                CalDav.Common.xDav.Element("prop",
                    CalDav.Common.xDav.Element("getetag"),
                    CalDav.Common.xCalDav.Element("calendar-data")
                    ),
                CalDav.Common.xDav.Element("href", new Uri(Url, uid + ".ics"))
                ), Credentials, new Dictionary<string, object> { { "Depth", 1 } });


            return null;

        }
    }
}
