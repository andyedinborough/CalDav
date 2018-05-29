using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CalCli.API
{
    public interface ITrigger
    {
        Relateds Related { get; set; }
        TimeSpan? Duration { get; set; }
        DateTime? DateTime { get; set; }
    }
}
