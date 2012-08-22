using System.Web.Mvc;
using System.Web.Routing;

namespace CalDav.MVC {
	public class RouteConfig {
		public static void RegisterRoutes(RouteCollection routes) {
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
			routes.IgnoreRoute("Content/{*pathInfo}");


		}
	}
}