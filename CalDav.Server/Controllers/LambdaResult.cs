using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace CalDav.Server.Controllers {
	public class LambdaResult : ActionResult {
		List<Action<ControllerContext>> _action = new List<Action<ControllerContext>>();
		public LambdaResult(Action<ControllerContext> action) {
			_action.Add(action);
		}
		public override void ExecuteResult(ControllerContext context) {
			foreach (var action in _action)
				action(context);
		}
		public LambdaResult Then(Action<ControllerContext> action) {
			_action.Add(action);
			return this;
		}
		public LambdaResult WithHeaders(System.Net.HttpStatusCode code = System.Net.HttpStatusCode.OK, string contentType = null) {
			return WithHeaders((int)code, contentType);
		}
		public LambdaResult WithHeaders(int code = 200, string contentType = null) {
			_action.Add(ctx => {
				var res = ctx.HttpContext.Response;
				res.StatusCode = code;
				res.ContentType = contentType ?? "text/html";
			});
			return this;
		}
		public LambdaResult WithHeader(string name, string value) {
			_action.Add(ctx => ctx.HttpContext.Response.AppendHeader(name, value));
			return this;
		}
	}
}