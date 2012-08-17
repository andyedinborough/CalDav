using System.Xml.Linq;

namespace CalDav {
	public static class Common {
		public static readonly XNamespace xDAV = XNamespace.Get("DAV");
		public static readonly XNamespace xCaldav = XNamespace.Get("urn:ietf:params:xml:ns:caldav");
	}
}
