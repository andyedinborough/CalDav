using System;
using System.Net;
using CalCli.API;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;

namespace CalCli.Connections
{
    public class GoogleConnection : API.IConnection
    {
        private string token;

        public GoogleConnection(string token)
        {
            this.token = token;
        }

        public WebRequest Authorize(WebRequest request)
        {
            request.Headers.Add(HttpRequestHeader.Authorization, "Bearer "+token);
            return request;
        }
    }
}
