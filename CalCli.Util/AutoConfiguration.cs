using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CalCli;
using OutlookClient;
using CalCli.API;
using System.IO;
using CalCli.Connections;
using CalCli.UI;

namespace CalCli.Util
{
    public class AutoConfiguration
    {
        private static IConnection refreshGoogleToken()
        {
            IConnection connection;
            GoogleOAuthForm form = new GoogleOAuthForm();
            form.ShowDialog();
            connection = new GoogleConnection(form.Result.Token);
            StreamWriter sw = new StreamWriter("token");
            sw.WriteLine(form.Result.Token);
            sw.Close();
            return connection;
        }
        public static IServer GetCalendarServer(CalendarTypes calendarTypes, string username = null, string password = null)
        {
            IServer server;
            if(calendarTypes == CalendarTypes.Outlook)
            {
                return new OutlookServer();
            }
            else
            {
                IConnection connection;
                if (calendarTypes == CalendarTypes.Google)
                {
                    if (File.Exists("token"))
                    {
                        StreamReader sr = new StreamReader("token");
                        connection = new GoogleConnection(sr.ReadLine());
                        sr.Close();
                    }
                    else
                    {
                        connection = refreshGoogleToken();
                    }
                    server = null;
                }
                else
                {
                    connection = new BasicConnection(username , password);
                    server = null;
                }
                if (server == null)
                {
                    try
                    {
                        server = new CalDav.Client.Server(urlFromCalendarType(calendarTypes), connection, username, password);

                    }
                    catch (Exception ex)
                    {
                        if (ex.Message == "Authentication is required" && connection.GetType().Equals(new GoogleConnection("").GetType()))
                        {
                            connection = refreshGoogleToken();
                            server = new CalDav.Client.Server(urlFromCalendarType(calendarTypes), connection, username, password);

                        }
                        else
                            throw ex;
                    }
                }
                return server;
            }
        }

        private static string urlFromCalendarType(CalendarTypes calendarTypes)
        {
            switch (calendarTypes) {
                case CalendarTypes.Google:
                    return "https://apidata.googleusercontent.com/caldav/v2/";
                case CalendarTypes.iCloud:
                    return "https://caldav.icloud.com/";
                case CalendarTypes.Yahoo:
                    return "https://caldav.calendar.yahoo.com/dav/";
                case CalendarTypes.Outlook:
                    return "Outlook";
            }
            return null;
        }
    }
}



