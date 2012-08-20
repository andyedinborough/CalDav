using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace CalDav.WPF {
	/// <summary>
	/// Interaction logic for MainWindow.xaml
	/// </summary>
	public partial class MainWindow : Window {
		public MainWindow() {
			InitializeComponent();
			Loaded += MainWindow_Loaded;
		}

		CalDav.Client.Server _Server;
		CalDav.Client.Calendar _Calendar;

		void MainWindow_Loaded(object sender, RoutedEventArgs e) {
			_Server = new Client.Server("https://www.google.com/calendar/dav/andy.edinborough@gmail.com/events/", "andy.edinborough@gmail.com", "Gboey6Emo!");
			_Calendar = _Server.GetCalendars().FirstOrDefault();

			this.AsyncUI(_Calendar.Initialize, () => lblCalendarName.Content = _Calendar.Name);
			LoadEvents();
		}

		void LoadEvents() {
			this.AsyncUI(() => {
				var now = DateTime.UtcNow;
				var from = new DateTime(now.Year, now.Month, 1);
				var to = from.AddMonths(1);
				return _Calendar.Search(CalDav.CalendarQuery.SearchEvents(from, to));
			}, results => {
				lbEvents.Items.Clear();
				var events = results.SelectMany(x => x.Events);
				lbEvents.HorizontalAlignment = System.Windows.HorizontalAlignment.Stretch;
				foreach (var evnt in events) {
					var grid = new Grid();
					grid.Margin = new Thickness(0);
					grid.HorizontalAlignment = System.Windows.HorizontalAlignment.Stretch;
					grid.ColumnDefinitions.Add(new ColumnDefinition { });
					grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(90) });
					grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(90) });

					var lbl = new Label { Content = evnt.Start.Value.ToShortDateString() + " " + evnt.Summary };
					grid.Children.Add(lbl);
					Grid.SetColumn(lbl, 0);

					var btn = new Button {
						Content = "Tomorrow"
					};
					btn.Click += (sender, ee) => {
						evnt.Start = DateTime.UtcNow.AddDays(1).Date;
						btn.IsEnabled = false;
						this.AsyncUI(() => _Calendar.Save(evnt), LoadEvents);
					};
					btn.HorizontalAlignment = System.Windows.HorizontalAlignment.Right;
					btn.Margin = new Thickness(0);
					grid.Children.Add(btn);
					Grid.SetColumn(btn, 1);

					var btn2 = new Button {
						Content = "Next Week"
					};
					btn2.Click += (sender, ee) => {
						evnt.Start = DateTime.UtcNow.AddDays(7).Date;
						btn2.IsEnabled = false;
						this.AsyncUI(() => _Calendar.Save(evnt), LoadEvents);
					};
					btn2.HorizontalAlignment = System.Windows.HorizontalAlignment.Right;
					btn2.Margin = new Thickness(0);
					grid.Children.Add(btn2);
					Grid.SetColumn(btn2, 2);

					lbEvents.Items.Add(grid);
				}
			});
		}
	}
}
