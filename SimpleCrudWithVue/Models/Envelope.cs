namespace SimpleCrudWithVue.Models
{
    public class Envelope
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public static Envelope Ok(object data = null, string message = "Success")
        {
            return new Envelope
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static Envelope Error(string message = null, object data = null)
        {
            return new Envelope
            {
                Success = false,
                Message = message,
                Data = data
            };
        }
    }

}
