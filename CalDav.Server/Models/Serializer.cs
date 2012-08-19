
namespace CalDav.Server.Models {
	public class  Serializer : CalDav.Serializer {
		public override T GetService<T>() {
			if (typeof(T) == typeof(CalDav.Calendar))
				return (T)(object)new CalDav.Server.Models.Calendar();
			return base.GetService<T>();
		}
	}
}