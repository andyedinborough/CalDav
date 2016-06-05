using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using CalCli.UI;

namespace Demo.CalCli
{
    public partial class Main : Form
    {
        public Main()
        {
            InitializeComponent();
        }

        private void testButton_Click(object sender, EventArgs e)
        {
            // urn:ietf:wg:oauth:2.0:oob
            //authWebBrowser.Navigate("https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob&client_id=562771573604-thtg508t2k88730qveaalj8fuq43iuki.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/calendar");
            GoogleOAuthForm form =  new GoogleOAuthForm();
            form.ShowDialog();
            MessageBox.Show(form.Result.Token);

        }

        private void authWebBrowser_Navigating(object sender, WebBrowserNavigatingEventArgs e)
        {
            Text = e.Url.ToString();
        }
    }
}
