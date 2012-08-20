
using System;
using System.Threading.Tasks;
using System.Windows;
namespace CalDav.WPF {
	public static class Utilities {

		public static void UI(this Window window, Action dothis) {
			window.Dispatcher.BeginInvoke(dothis);
		}

		public static Task AsyncUI(this Window window, Action dothis, Action thenThisOnUI) {
			return Task.Run(dothis).ContinueWith(_ => window.Dispatcher.BeginInvoke(thenThisOnUI));
		}

		public static Task AsyncUI<T>(this Window window, Func<T> dothis, Action<T> thenThisOnUi) {
			return Task.Run<T>(dothis).ContinueWith(_ => window.Dispatcher.BeginInvoke((Action)(() => thenThisOnUi(_.Result))));
		}
	}
}
