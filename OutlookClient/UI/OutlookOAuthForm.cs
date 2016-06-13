using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Experimental.IdentityModel.Clients.ActiveDirectory;
using System.IO;

namespace CalCli.UI
{
    public partial class OutlookOAuthForm : Form
    {
        string clientId = "c36b4fd4-8b5a-4831-b146-6e4cdac90d0e";
        //AuthenticationContext authContext;

        // The url in our app that Azure should redirect to after successful signin
        Uri redirectUri = new Uri("urn:ietf:wg:oauth:2.0:oob");

    

        public OutlookOAuthForm()
        {
            InitializeComponent();
        }

        private void OutlookOAuthForm_Load(object sender, EventArgs e)
        {
            //authContext = new AuthenticationContext("https://login.microsoftonline.com/common");
            string[] scopes = {
                    "https%3A%2F%2Fgraph.microsoft.com%2Fcalendars.readwrite%20"
            };

            // Generate the parameterized URL for Azure signin
            //Uri authUri = authContext.GetAuthorizationRequestUrlAsync(scopes, null, clientId,
            //    redirectUri, UserIdentifier.AnyUser, null).Result;

            //authBrowser.Navigate(authUri);

            authBrowser.Navigate(String.Format("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_mode=form_post&prompt=login&client_id={0}&scope={1}&response_type=code&redirect_uri={2}",
                clientId, scopes[0], "urn:ietf:wg:oauth:2.0:oob"));
        }

        private void authBrowser_Navigated(object sender, WebBrowserNavigatedEventArgs e)
        {
            Text = e.Url.ToString(); 
            StreamWriter sw = new StreamWriter("log.txt", true);
            sw.WriteLine(e.Url.ToString());
            sw.Close();
        }

        private void authBrowser_Navigating(object sender, WebBrowserNavigatingEventArgs e)
        {

            StreamWriter sw = new StreamWriter("loging.txt", true);
            sw.WriteLine(e.Url.ToString());
            sw.Close();
        }
    }
}
