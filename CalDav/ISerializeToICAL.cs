using System.IO;

namespace CalDav {
	public interface ISerializeToICAL {
		void Deserialize(TextReader rdr, Serializer serializer);
		void Serialize(TextWriter wrtr);
	}
}
