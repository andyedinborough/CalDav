using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.IO;

namespace CalDav.Client
{
    public interface IConnection
    {
        WebRequest Authorize(WebRequest request);
    }
}
