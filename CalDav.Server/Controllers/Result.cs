using System;
using System.Collections.Generic;
using System.Web.Mvc;
using System.Xml.Linq;

namespace CalDav.Server.Controllers {
	public class Result : System.Web.Mvc.ActionResult {
		public Result() { }
		public Result(Action<ControllerContext> content) { Content = content; }

		public System.Net.HttpStatusCode? Status { get; set; }
		public object Content { get; set; }
		public Dictionary<string, string> Headers { get; set; }
		public string ContentType { get; set; }

		public override void ExecuteResult(System.Web.Mvc.ControllerContext context) {
			var res = context.HttpContext.Response;
			res.StatusCode = (int)(Status ?? System.Net.HttpStatusCode.OK);

			if (Headers != null && Headers.Count > 0)
				foreach (var header in Headers)
					res.AppendHeader(header.Key, header.Value);

			var content = Content;
			if (content is XDocument) content = ((XDocument)content).Root;
			if (content is XElement) {
				ContentType = "text/xml";
				((XElement)content).Save(res.Output);
			} else if (content is string) res.Write(content as string);
			else if (content is byte[]) res.BinaryWrite(content as byte[]);
			else if (content is Action<ControllerContext>) ((Action<ControllerContext>)content)(context);

			if (ContentType != null)
				res.ContentType = ContentType;
		}
	}
}