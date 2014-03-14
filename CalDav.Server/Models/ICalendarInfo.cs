using System;

namespace CalDav.Server.Models
{
    public interface ICalendarInfo
    {
        string ID { get; }
        string Name { get; }
        string Description { get; }
        DateTime LastModified { get; }
    }
}
