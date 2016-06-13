using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalCli.API
{
    public interface ICalendar
    {
        string Name { get; set; }
        string Description { get; set; }
        void Save(IEvent e);
        void Save(IToDo t);
    }
}
