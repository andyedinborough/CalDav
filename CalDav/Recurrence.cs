using System;
using System.Linq;

namespace CalDav
{
    public class Recurrence : IHasParameters
    {
        public Frequencies? Frequency { get; set; }
        public int? Count { get; set; }
        public int? Interval { get; set; }
        public DateTime? Until { get; set; }
        public int? ByMonth { get; set; }
        public string[] ByDay { get; set; }
        public int? ByMonthDay { get; set; }

        public System.Collections.Specialized.NameValueCollection GetParameters() { return null; }

        public override string ToString()
        {
            var parameters = new System.Collections.Specialized.NameValueCollection();
            if (Count != null) parameters["COUNT"] = Count.ToString();
            if (Interval != null) parameters["INTERVAL"] = Interval.ToString();
            if (Frequency != null) parameters["FREQ"] = Frequency.Value.ToString().ToUpper();
            if (Until != null) parameters["UNTIL"] = Common.FormatDate(Until.Value);
            if (ByMonth != null) parameters["BYMONTH"] = ByMonth.ToString();
            if (ByMonthDay != null) parameters["BYMONTHDAY"] = ByMonthDay.ToString();
            if (ByDay != null && ByDay.Length > 0) parameters["BYDAY"] = string.Join(",", ByDay);

            return Common.FormatParameters(parameters).TrimStart(';');
        }

        public void Deserialize(string value, System.Collections.Specialized.NameValueCollection parameters)
        {
            Count = parameters["COUNT"].ToInt();
            Interval = parameters["INTERVAL"].ToInt();
            Frequency = parameters["FREQ"].ToEnum<Frequencies>();
            Until = parameters["UNTIL"].ToDateTime();
            ByMonth = parameters["BYMONTH"].ToInt();
            ByMonthDay = parameters["BYMONTHDAY"].ToInt();
            ByDay = parameters["BYDAY"].SplitEscaped().ToArray();
        }
    }
}
