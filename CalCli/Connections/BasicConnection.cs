using System;
using System.Net;
using CalDav.Client;

namespace CalCli
{
    public class BasicConnection : IConnection, ICredentials
    {
        private string username;
        private string password;

        public BasicConnection(string username, string password)
        {
            this.username = username;
            this.password = password;
        }

        public WebRequest Authorize(WebRequest request)
        {
            request.Credentials = this;

            if (request.Credentials != null)
            {
                //req.Credentials = credentials;
                var b64 = username + ":" + password;
                b64 = System.Convert.ToBase64String(System.Text.Encoding.Default.GetBytes(b64));
                request.Headers[HttpRequestHeader.Authorization] = "Basic " + b64;
            }
            return request;
        }

        public NetworkCredential GetCredential(Uri uri, string authType)
        {
            return new NetworkCredential(username, password);
        }
    }
}