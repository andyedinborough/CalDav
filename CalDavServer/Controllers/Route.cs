
namespace CalDavServer.Controllers {
	public class Route : AttributeRouting.Web.Mvc.RouteAttribute {
		public Route(string path, string verb = null)
			: base(path) {
			if (verb != null) HttpMethods = new[] { verb };
		}

		public override bool IsValidForRequest(System.Web.Mvc.ControllerContext controllerContext, System.Reflection.MethodInfo methodInfo) {
			var isValid = base.IsValidForRequest(controllerContext, methodInfo);
			return isValid;
		}
	}
}