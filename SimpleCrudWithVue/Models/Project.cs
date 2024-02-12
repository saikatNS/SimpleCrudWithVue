namespace SimpleCrudWithVue.Models
{
    public class Project
    {
        public int ProjectId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int Price { get; set; }
        public int CategoryId { get; set;}
    }
}
