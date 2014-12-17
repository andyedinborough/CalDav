using System;
using System.Web.Mvc;
using System.Web.Routing;

namespace CalDav
{
    public class Method : ActionMethodSelectorAttribute, IRouteConstraint
    {
        private readonly string _method;

        public Method(string method)
        {
            _method = method.ToUpper();
        }

        public override bool IsValidForRequest(ControllerContext controllerContext, System.Reflection.MethodInfo methodInfo)
        {
            return _method.Equals(controllerContext.HttpContext.Request.HttpMethod, StringComparison.OrdinalIgnoreCase);
        }

        public bool Match(System.Web.HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
        {
            return _method.Equals(httpContext.Request.HttpMethod, StringComparison.OrdinalIgnoreCase);
        }
    }
}
