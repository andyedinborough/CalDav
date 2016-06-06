using System.Net;

namespace CalCli.Connections
{
    public class GoogleConnection : CalDav.Client.IConnection
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
