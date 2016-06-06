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
using CalCli.Connections;
using System.IO;
using CalDav.Client;

namespace Demo.CalCli
{
    public partial class Main : Form
    {
        IConnection connection;

        public Main()
        {
            InitializeComponent();
        }

        private void testButton_Click(object sender, EventArgs e)
        {
            // urn:ietf:wg:oauth:2.0:oob
            //authWebBrowser.Navigate("https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob&client_id=562771573604-thtg508t2k88730qveaalj8fuq43iuki.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/calendar");
            if (File.Exists("token"))
            {
                StreamReader sr = new StreamReader("token");
                connection = new GoogleConnection(sr.ReadLine());
                sr.Close();
                return;
            }
            GoogleOAuthForm form =  new GoogleOAuthForm();
            form.ShowDialog();
            connection = new GoogleConnection(form.Result.Token);
            StreamWriter sw = new StreamWriter("token");
            sw.WriteLine(form.Result.Token);
            sw.Close();
        }

        private void createEventButton_Click(object sender, EventArgs e)
        {
            //http://server/calendars/domain/user@domain/Calendar
            //https://apidata.googleusercontent.com/caldav/v2/altostratous@gmail.com/user
            CalDav.Client.Server server = new CalDav.Client.Server("https://apidata.googleusercontent.com/caldav/v2/altostratous@gmail.com/events/", connection, "altostratous", "Sha'erNazer");
            var sets = server.GetCalendars();
            //MessageBox.Show(sets.Length.ToString() + "Calendars found.");
            CalDav.Client.Calendar calendar = sets[0];
            var ev = new CalDav.Event
            {
                Description = "this is a description",
                Summary = "summary",
                Sequence = (int)(DateTime.UtcNow.AddHours(1) - new DateTime(1970, 1, 1)).TotalSeconds,
                Start = DateTime.UtcNow.AddHours(1),
                End = DateTime.UtcNow.AddHours(2)
            };
            calendar.Save(ev);
        }
    }
}
