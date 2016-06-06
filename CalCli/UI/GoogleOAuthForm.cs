using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Net;
using System.IO;
using Newtonsoft.Json.Linq;
using CalCli.Connections;

namespace CalCli.UI
{
    public partial class GoogleOAuthForm : Form
    {
        public GoogleOAuthFormResponse Result { get; set; }

        public GoogleOAuthForm()
        {
            InitializeComponent();
        }

        private void GoogleOAuthForm_Load(object sender, EventArgs e)
        {
            authWebBrowser.Navigate("https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob:auto&client_id=562771573604-thtg508t2k88730qveaalj8fuq43iuki.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/calendar");
        }

        private void authWebBrowser_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            if (authWebBrowser.DocumentTitle.Contains("code="))
            {
                getToken(extractCode(authWebBrowser.DocumentTitle));
            }
        }

        private void getToken(object code)
        {
            WebRequest request = HttpWebRequest.Create("https://accounts.google.com/o/oauth2/token");

            string postData = "code="+code+"&" +
            "client_id=562771573604-thtg508t2k88730qveaalj8fuq43iuki.apps.googleusercontent.com&" +
            "client_secret=LpgRRdGGqrHDr7KIG-FA604x&" +
            "redirect_uri=urn:ietf:wg:oauth:2.0:oob:auto&" +
            "grant_type=authorization_code";

            var data = Encoding.ASCII.GetBytes(postData);

            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = data.Length;

            using (var stream = request.GetRequestStream())
            {
                stream.Write(data, 0, data.Length);
            }

            string response = new StreamReader(request.GetResponse().GetResponseStream()).ReadToEnd();

            Result = new GoogleOAuthFormResponse()
            {
                DialogResult = DialogResult.OK,
                Token = extractToken(response),
                RefreshToken = extractRefreshToken(response),
                ExpiresIn = extractExpiresIn(response)
            };
            Close();
        }

        private int extractExpiresIn(string response)
        {
            return Convert.ToInt32(extractJsonParameter("expires_in", response));
        }

        private string extractRefreshToken(string response)
        {
            return extractJsonParameter("refresh_token", response);
        }

        private string extractToken(string response)
        {
            return extractJsonParameter("access_token", response);
        }

        private string extractJsonParameter(string key, string json)
        {
            JObject o = JObject.Parse(json);
            return o.GetValue(key).ToString() ;
        }

        private object extractCode(string documentTitle)
        {
            return documentTitle.Substring(documentTitle.IndexOf("code=") + 5);
        }
    }
}
