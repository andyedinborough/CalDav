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

namespace CalCli.UI
{
    public partial class OutlookOAuthForm : Form
    {
        string clientId = "c36b4fd4-8b5a-4831-b146-6e4cdac90d0e";
        AuthenticationContext authContext;

        // The url in our app that Azure should redirect to after successful signin
        Uri redirectUri = new Uri("urn:ietf:wg:oauth:2.0:oob");

    

        public OutlookOAuthForm()
        {
            InitializeComponent();
        }

        private void OutlookOAuthForm_Load(object sender, EventArgs e)
        {
            authContext = new AuthenticationContext("https://login.microsoftonline.com/common");
            string[] scopes = {
                    "https://outlook.office.com/calendars.readwrite"
            };

            // Generate the parameterized URL for Azure signin
            Uri authUri = authContext.GetAuthorizationRequestUrlAsync(scopes, null, clientId,
                redirectUri, UserIdentifier.AnyUser, null).Result;

            authBrowser.Navigate(authUri);
        }
    }
}
