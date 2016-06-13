using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalCli.API
{
    public interface IAlarm
    {
        AlarmActions Action { get; set; }
        string Description { get; set; }
        ITrigger Trigger { get; set; }
    }
}
