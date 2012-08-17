using System.IO;

namespace CalDav {
	public interface ISerializeToICAL {
		void Deserialize(TextReader rdr);
		void Serialize(TextWriter wrtr);
	}
}
