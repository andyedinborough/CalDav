using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace CalDav {
	public static class Common {
		public const string PROGID = "-//tracky/CalDav//FUBU v1.0//EN";
		public static readonly XNamespace xDAV = XNamespace.Get("DAV");
		public static readonly XNamespace xCaldav = XNamespace.Get("urn:ietf:params:xml:ns:caldav");

		internal static void BeginBlock(this System.IO.TextWriter wrtr, string name) {
			wrtr.WriteLine("BEGIN:" + name);
		}
		internal static void EndBlock(this System.IO.TextWriter wrtr, string name) {
			wrtr.WriteLine("End:" + name);
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, IEnumerable<string> value) {
			wrtr.Property(name, string.Join(",", value.Select(Encode)), true);
		}
		private static string Encode(string value) {
			return value
				.Replace("\n", "\\n")
				.Replace("\r", "\\r")
				.Replace("\\", "\\\\")
				.Replace(";", "\\;")
				.Replace(",", "\\,")
				.Replace("\r", "");
		}
		private static string Decode(string value) {
			return value
				.Replace("\\n", "\n")
				.Replace("\\r", "\r")
				.Replace("\\\\", "\\")
				.Replace("\\;", ";")
				.Replace("\\,", ",");
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, string value, bool encoded = false) {
			if (value == null) return;

			value = name.ToUpper() + ":" + (encoded ? value : Encode(value));
			while (value.Length > 75) {
				wrtr.Write(value.Substring(0, 75));
				value = "\t" + value.Substring(75);
			}
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, DateTime? value) {
			if (value == null
				|| value < System.Data.SqlTypes.SqlDateTime.MinValue.Value
				|| value > System.Data.SqlTypes.SqlDateTime.MaxValue.Value) return;
			wrtr.Property(name, value.Value.ToString("yyyyMMddTHHmmss") + (value.Value.Kind == DateTimeKind.Utc ? "Z" : ""));
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, object value) {
			if (value == null) return;
			wrtr.Property(name, Convert.ToString(value));
		}
	}
}
