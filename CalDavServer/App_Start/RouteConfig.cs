using System.Web.Mvc;
using System.Web.Routing;

namespace CalDavServer {
	public class RouteConfig {
		public static void RegisterRoutes(RouteCollection routes) {
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");


		}
	}
}