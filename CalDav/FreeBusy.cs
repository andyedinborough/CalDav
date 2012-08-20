using System;

namespace CalDav {
	public class FreeBusy : ICalendarObject {
		public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			throw new NotImplementedException();
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			throw new NotImplementedException();
		}

		public Calendar Calendar { get; set; }

		public string UID { get; set; }


		public int? Sequence { get; set; }

		public DateTime? LastModified { get; set; }
	}
}
