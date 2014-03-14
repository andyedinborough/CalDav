using System;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;

namespace CalDav
{
    public class Serializer
    {
        public Func<Type, object> DependencyResolver { get; set; }
        private readonly ConcurrentDictionary<Type, Type> _cache = new ConcurrentDictionary<Type, Type>();

        public Serializer()
        {
            Encoding = new System.Text.UTF8Encoding(false);
        }

        public System.Text.Encoding Encoding { get; set; }

        public virtual T GetService<T>()
        {
            if (DependencyResolver == null)
            {
                DependencyResolver = type =>
                {
                    type = _cache.GetOrAdd(type, t =>
                             typeof(Serializer).Assembly.GetTypes().FirstOrDefault(x => x.IsClass && !x.IsAbstract && x.IsAssignableFrom(type))
                        );
                    return Activator.CreateInstance(type);
                };
            }
            return (T)DependencyResolver(typeof(T));
        }

        public T Deserialize<T>(string filename, System.Text.Encoding encoding = null) where T : ISerializeToICAL
        {
            using (var file = new System.IO.FileStream(filename, FileMode.Open))
                return Deserialize<T>(file, encoding);
        }

        public T Deserialize<T>(Stream stream, System.Text.Encoding encoding = null) where T : ISerializeToICAL
        {
            using (var rdr = new StreamReader(stream, encoding ?? Encoding))
                return Deserialize<T>(rdr);
        }

        public virtual T Deserialize<T>(TextReader rdr) where T : ISerializeToICAL
        {
            var obj = GetService<T>();
            obj.Deserialize(rdr, this);
            return obj;
        }

        public void Serialize<T>(string filename, T obj, System.Text.Encoding encoding = null) where T : ISerializeToICAL
        {
            using (var file = new System.IO.FileStream(filename, FileMode.Create))
                Serialize(file, obj, encoding);
        }

        public void Serialize<T>(Stream stream, T obj, System.Text.Encoding encoding = null) where T : ISerializeToICAL
        {
            if (obj == null) return;
            using (var wrtr = new StreamWriter(stream, encoding ?? Encoding))
                Serialize(wrtr, obj);
        }

        public virtual void Serialize<T>(TextWriter wrtr, T obj) where T : ISerializeToICAL
        {
            if (obj == null) return;
            obj.Serialize(wrtr);
        }

    }
}
