using System;
using System.Linq;

namespace CalDav.MVC.Models
{
    public class CalendarInfo : CalDav.Calendar, CalDav.Server.Models.ICalendarInfo
    {
        public string Filename { get; set; }
        public DateTime LastModified
        {
            get
            {
                return System.IO.File.GetLastWriteTimeUtc(Filename);
            }
        }

        private string this[string name]
        {
            get
            {
                name = name.ToUpper();
                if (!name.StartsWith("X-")) name = "X-" + name;
                var prop = Properties.FirstOrDefault(x => x.Item1.Is(name));
                if (prop == null) return null;
                return prop.Item2;
            }
            set
            {
                name = name.ToUpper();
                if (!name.StartsWith("X-")) name = "X-" + name;
                var newprop = Tuple.Create(name, value, (System.Collections.Specialized.NameValueCollection)null);
                var prop = Properties.FirstOrDefault(x => x.Item1.Is(name));
                if (prop != null) Properties.Remove(prop);
                Properties.Add(newprop);
            }
        }

        public string Name
        {
            get
            {
                return this["Name"];
            }
            set
            {
                this["Name"] = value;
            }
        }

        public string Description
        {
            get
            {
                return this["Description"];
            }
            set
            {
                this["Description"] = value;
            }
        }

        public string ID
        {
            get
            {
                return this["ID"];
            }
            set
            {
                this["ID"] = value;
            }
        }

    }
}