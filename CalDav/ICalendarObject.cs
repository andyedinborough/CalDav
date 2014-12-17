using System;

namespace CalDav
{
    public interface ICalendarObject : ISerializeToICAL
    {
        string UID { get; set; }
        int? Sequence { get; set; }
        DateTime? LastModified { get; set; }
        Calendar Calendar { get; set; }
    }
}
