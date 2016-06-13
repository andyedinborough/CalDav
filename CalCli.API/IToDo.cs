using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalCli.API
{
    public interface IToDo
    {
        string UID { get; set; }
        DateTime? Start { get; set; }
        DateTime? Due { get; set; }
        string Summary { get; set; }
        ICollection<string> Categories { get; set; }
        int? Priority { get; set; }
        int? Sequence { get; set; }
        DateTime? Completed { get; set; }
    }
}
