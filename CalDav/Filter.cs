using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace CalDav
{
    public class Filter
    {
        public CompFilter[] Filters { get; set; }

        public Filter() { }
        public Filter(XElement filter)
        {
            var filters = new List<CompFilter>();
            foreach (var elm in filter.Elements())
            {
                var obj = Create(elm);
                if (obj == null) continue;
                if (obj is CompFilter)
                    filters.Add((CompFilter)obj);
            }
            Filters = filters.ToArray();
        }

        private static object Create(XElement elm)
        {
            switch (elm.Name.LocalName.ToLower())
            {
                case "filter":
                    return new Filter(elm);
                case "comp-filter":
                    return new CompFilter(elm);
                case "time-range":
                    return new TimeRangeFilter(elm);
                case "prop-filter":
                    return new PropFilter(elm);
            }
            return null;
        }

        public static explicit operator XElement(Filter a)
        {
            return Common.xCalDav.Element("filter",
                a.Filters == null || a.Filters.Length == 0 ? null : a.Filters.Select(f => (XElement)f)
            );
        }

        public class CompFilter
        {
            public string Name { get; set; }
            public CompFilter[] Filters { get; set; }
            public PropFilter[] Properties { get; set; }
            public TimeRangeFilter TimeRange { get; set; }
            public bool? IsDefined { get; set; }

            public CompFilter() { }
            public CompFilter(XElement filter)
            {
                Name = (string)filter.Attribute("name");
                var props = new List<PropFilter>();
                var filters = new List<CompFilter>();
                foreach (var elm in filter.Elements())
                {
                    switch (elm.Name.LocalName)
                    {
                        case "is-defined":
                            IsDefined = true;
                            continue;
                    }
                    var obj = Create(elm);
                    if (obj == null) continue;
                    if (obj is PropFilter)
                        props.Add((PropFilter)obj);
                    if (obj is TimeRangeFilter)
                        TimeRange = (TimeRangeFilter)obj;
                    if (obj is CompFilter)
                        filters.Add((CompFilter)obj);
                }
                Properties = props.ToArray();
                Filters = filters.ToArray();
            }

            public static explicit operator XElement(CompFilter a)
            {
                return Common.xCalDav.Element("comp-filter",
                    new XAttribute("name", a.Name),
                    a.IsDefined != true ? null : Common.xCalDav.Element("is-defined"),
                    a.TimeRange == null ? null : (XElement)a.TimeRange,
                    a.Properties == null || a.Properties.Length == 0 ? null : a.Properties.Select(f => (XElement)f),
                    a.Filters == null || a.Filters.Length == 0 ? null : a.Filters.Select(f => (XElement)f)
                );
            }
        }

        public class PropFilter : ValueFilter
        {
            public PropFilter() { }
            public PropFilter(XElement filter)
                : base(filter)
            {
            }
        }
        public class ParamFilter : ValueFilter
        {
            public ParamFilter() { }
            public ParamFilter(XElement filter)
                : base(filter)
            {
            }
        }
        public abstract class ValueFilter
        {
            public ValueFilter() { }
            public ValueFilter(XElement filter)
            {
                Name = (string)filter.Attribute("name");
                var paramfilters = new List<ParamFilter>();
                foreach (var elm in filter.Elements())
                {
                    switch (elm.Name.LocalName)
                    {
                        case "text-match":
                            Text = elm.Value;
                            IgnoreCase = (string)elm.Attribute("caseless") == "yes";
                            break;
                        case "param-filter":
                            paramfilters.Add(new ParamFilter(elm));
                            break;
                    }
                    Parameters = paramfilters.ToArray();
                }
            }
            public string Name { get; set; }
            public bool? IgnoreCase { get; set; }
            public string Text { get; set; }
            public ParamFilter[] Parameters { get; set; }

            public static explicit operator XElement(ValueFilter a)
            {
                return Common.xCalDav.Element((a is PropFilter ? "prop" : "param") + "-filter",
                    string.IsNullOrEmpty(a.Name) ? null : new XAttribute("name", a.Name),
                    string.IsNullOrEmpty(a.Text) ? null : new XElement(Common.xCalDav.GetName("text-match"),
                    new XAttribute("caseless", a.IgnoreCase == true ? "yes" : "no"), a.Text),
                    a.Parameters == null || a.Parameters.Length == 0 ? null : a.Parameters.Select(f => (XElement)f)
                );
            }
        }

        public class TimeRangeFilter
        {
            public TimeRangeFilter() { }
            public TimeRangeFilter(XElement elm)
            {
                var attr = elm.Attribute("start");
                if (attr != null) Start = ((string)attr).ToDateTime();

                attr = elm.Attribute("end");
                if (attr != null) End = ((string)attr).ToDateTime();
            }
            public DateTime? Start { get; set; }
            public DateTime? End { get; set; }

            public static explicit operator XElement(TimeRangeFilter a)
            {
                return Common.xCalDav.Element("time-range",
                    a.Start == null ? null : new XAttribute("start", a.Start.Value.ToString("yyyyMMddTHHmmssZ")),
                    a.End == null ? null : new XAttribute("end", a.End.Value.ToString("yyyyMMddTHHmmssZ"))
                    );
            }
        }
    }
}