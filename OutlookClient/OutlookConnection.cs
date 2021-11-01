using System.Net;
using CalCli.API;
//using Microsoft.Experimental.IdentityModel.Clients.ActiveDirectory;

namespace CalCli.Connections
{
    public class OutlookConnection : IConnection
    {
        public WebRequest Authorize(WebRequest request)
        {
            return request;
        }
    }
}
