using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace CalDav.Server {
	// Note: For instructions on enabling IIS6 or IIS7 classic mode, 
	// visit http://go.microsoft.com/?LinkId=9394801
	public class MvcApplication : System.Web.HttpApplication {
		protected void Application_Start() {
			AreaRegistration.RegisterAllAreas();

			WebApiConfig.Register(GlobalConfiguration.Configuration);
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);

			var @base = System.Web.Mvc.DependencyResolver.Current;
			System.Web.Mvc.DependencyResolver.SetResolver(type => {
				if (type == typeof(Models.ICalendarRepository))
					return new Models.CalendarRepository(User);

				return @base.GetService(type);
			}, types => {
				return @base.GetServices(types);
			});
		}
	}
}