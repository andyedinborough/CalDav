using System;
using System.Windows.Forms;
using CalCli.UI;
using CalCli.Connections;
using System.IO;
using CalCli.API;
using CalCli;
using Outlook = Microsoft.Office.Interop.Outlook;

namespace Demo.CalCli
{
    public partial class Main : Form
    {
        IConnection connection;

        public Main()
        {
            InitializeComponent();

            updateFulllUrl();
        }

        private void testButton_Click(object sender, EventArgs e)
        {
            OutlookOAuthForm form = new OutlookOAuthForm();
            form.ShowDialog();
            //if (fullUrlTextBox.Text == "https://apidata.googleusercontent.com/caldav/v2/altostratous@gmail.com/events/")
            //{
            //    if (File.Exists("token"))
            //    {
            //        StreamReader sr = new StreamReader("token");
            //        connection = new GoogleConnection(sr.ReadLine());
            //        sr.Close();
            //        return;
            //    }
            //    GoogleOAuthForm form = new GoogleOAuthForm();
            //    form.ShowDialog();
            //    connection = new GoogleConnection(form.Result.Token);
            //    StreamWriter sw = new StreamWriter("token");
            //    sw.WriteLine(form.Result.Token);
            //    sw.Close();
            //}
            //else
            //{
            //    connection = new BasicConnection(usernameTextBox.Text, passwordTextBox.Text);
            //}
        }

        private void createEventButton_Click(object sender, EventArgs e)
        {
            //http://server/calendars/domain/user@domain/Calendar

            IServer server = new CalDav.Client.Server(fullUrlTextBox.Text, connection);
            var sets = server.GetCalendars();
            ICalendar calendar = sets[0];
            IEvent ev = new CalDav.Event
            {
                Description = eventDescriptionTextBox.Text,
                Summary = eventSummaryTextBox.Text,
                Sequence = (int)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds,
                Start = eventStartPicker.Value,
                End = eventEndPicker.Value,
            };
            calendar.Save(ev);
        }

        private void updateFulllUrl()
        {
            if (urlCombo.Text.EndsWith("/"))
            {

            }
            else
            {
                urlCombo.Text += "/";
            }
            fullUrlTextBox.Text = urlCombo.Text + calidTextBox.Text;
        }

        private void urlCombo_TextChanged(object sender, EventArgs e)
        {
            updateFulllUrl();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Outlook.Application olApp = new Outlook.Application();
            Outlook.NameSpace mapiNS = olApp.GetNamespace("MAPI");

            string profile = "";
            mapiNS.Logon(profile, null, null, null);

            Outlook.AppointmentItem apt = olApp.CreateItem(Outlook.OlItemType.olAppointmentItem);
            apt.Start = DateTime.Now.AddHours(-3);
            apt.End = apt.Start.AddHours(1);
            apt.Subject = "Please synch in advance.";
            apt.Save();
            apt.Send();
        }
    }
}
