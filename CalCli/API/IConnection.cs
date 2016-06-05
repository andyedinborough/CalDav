using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.IO;

namespace CalCli.API
{
    public interface IConnection
    {
        WebResponse Request(WebRequest request);
    }
}
