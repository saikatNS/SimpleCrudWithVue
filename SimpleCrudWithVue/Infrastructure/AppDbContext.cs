using Microsoft.EntityFrameworkCore;
using SimpleCrudWithVue.Models;

namespace SimpleCrudWithVue.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Project> Projects { get; set; }
    public virtual DbSet<Category> Categories { get; set; }

}