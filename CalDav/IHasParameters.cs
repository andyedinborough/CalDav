using System.Collections.Specialized;

namespace CalDav
{
    public interface IHasParameters
    {
        NameValueCollection GetParameters();
        void Deserialize(string value, NameValueCollection parameters);
    }
}
