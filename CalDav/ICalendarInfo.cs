using System;

namespace CalDav
{
    public interface ICalendarInfo
    {
        string ID { get; }
        string Name { get; }
        string Description { get; }
        DateTime LastModified { get; }
    }
}
