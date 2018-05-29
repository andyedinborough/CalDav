using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalCli.API
{
    public interface IEvent
    {
        ICollection<IAlarm> Alarms { get; set; }
        ICollection<string> Categories { get; set; }
        DateTime? Created { get; set; }
        string Description { get; set; }
        DateTime? Start { get; set; }
        DateTime? End { get; set; }
        string Summary { get; set; }
        string UID { get; set; }
        Uri Url { get; set; }
    }
}
