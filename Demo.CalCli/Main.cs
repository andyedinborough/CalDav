using System;
using System.Windows.Forms;
using CalCli.UI;
using CalCli.Connections;
using System.IO;
using CalCli.API;
using CalCli;
using Outlook = Microsoft.Office.Interop.Outlook;
using System.Collections.Generic;

namespace Demo.CalCli
{
    public partial class Main : Form
    {
        IConnection connection;

        ICalendar[] calendars;

        List<IToDo> todos;

        IServer server;

        public Main()
        {
            InitializeComponent();

            todos = new List<IToDo>();
        }

        private void testButton_Click(object sender, EventArgs e)
        {
            if (urlCombo.Text.Contains("google"))
            {
                if (File.Exists("token"))
                {
                    StreamReader sr = new StreamReader("token");
                    connection = new GoogleConnection(sr.ReadLine());
                    sr.Close();
                }
                else
                {
                    refreshGoogleToken();
                }
                server = null;
            }
            else if (urlCombo.Text.Contains("outlook"))
            {
                connection = new BasicConnection(null, null);
                server = new OutlookClient.OutlookServer();
            }
            else
            {
                connection = new BasicConnection(usernameTextBox.Text, passwordTextBox.Text);
                server = null;
            }
            if(server == null)
            {
                try
                {
                    server = new CalDav.Client.Server(urlCombo.Text, connection, usernameTextBox.Text, passwordTextBox.Text);

                }
                catch (Exception ex)
                {
                    if (ex.Message == "Authentication is required")
                    {
                        refreshGoogleToken();
                        server = new CalDav.Client.Server(urlCombo.Text, connection, usernameTextBox.Text, passwordTextBox.Text);

                    }
                }
            }

            try {
                calendars = server.GetCalendars();
            }catch(NullReferenceException ex)
            {
                MessageBox.Show("Could not login.");
                return;
            }
            comboBox1.Items.Clear();
            foreach(ICalendar calendar in calendars)
            {
                comboBox1.Items.Add(calendar.Name);
            }
            if(comboBox1.Items.Count > 0)
            {
                comboBox1.Text = (string)comboBox1.Items[0];
            }
        }

        private void refreshGoogleToken()
        {
            GoogleOAuthForm form = new GoogleOAuthForm();
            form.ShowDialog();
            connection = new GoogleConnection(form.Result.Token);
            StreamWriter sw = new StreamWriter("token");
            sw.WriteLine(form.Result.Token);
            sw.Close();
        }

        private void createEventButton_Click(object sender, EventArgs e)
        {
            List < IAlarm > alarms = new List<IAlarm>();
            IAlarm alarm = calendars[comboBox1.SelectedIndex].createAlarm();
            ITrigger trigger = calendars[comboBox1.SelectedIndex].createTrigger();
            alarm.Trigger = trigger;
            //trigger.DateTime = eventStartPicker.Value;
            trigger.Duration = new TimeSpan();
            trigger.Duration = trigger.Duration.Value.Add(new TimeSpan(0, -5, 0));
            trigger.Related = Relateds.Start;
            alarm.Action = AlarmActions.DISPLAY;
            alarms.Add(alarm);
            IEvent ev = new CalDav.Event
            {
                Description = eventDescriptionTextBox.Text,
                Summary = eventSummaryTextBox.Text,
                Sequence = (int)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds,
                Start = eventStartPicker.Value,
                End = eventEndPicker.Value,
                Alarms = alarms
            };
            calendars[comboBox1.SelectedIndex].Save(ev);
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

        private void Main_Load(object sender, EventArgs e)
        {

        }

        private void usernameTextBox_TextChanged(object sender, EventArgs e)
        {

        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            IToDo todo = calendars[comboBox1.SelectedIndex].createToDo();
            todo.Summary = eventSummaryTextBox.Text;
            todo.Start = eventStartPicker.Value;
            todo.Due = eventStartPicker.Value;
            try
            {
                calendars[comboBox1.SelectedIndex].Save(todo);
                todos.Add(todo);
                checkList.Items.Add(todo.Summary);
            }catch(Exception ex)
            {
                MessageBox.Show("Calendar doesn't support todos.");
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            for(int i = 0; i < checkList.Items.Count; i++)
            {
                if(checkList.GetItemChecked(i) != (todos[i].Completed != null))
                {
                    if (checkList.GetItemChecked(i))
                    {
                        todos[i].Completed = DateTime.UtcNow;
                        todos[i].Status = Statuses.COMPLETED;
                    }
                    else
                    {
                        todos[i].Completed = null;
                    }
                    calendars[comboBox1.SelectedIndex].Save(todos[i]);
                }
            }
        }
    }
}
