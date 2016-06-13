using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using CalCli.API;
using Microsoft.Experimental.IdentityModel.Clients.ActiveDirectory;

namespace CalCli.Connections
{
    public class OutlookConnection : IConnection
    {
        string token;
        public OutlookConnection(string token)
        {
            this.token = token;
        }
        public WebRequest Authorize(WebRequest request)
        {
            request.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + token);
            return request;
        }
    }
}
