using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FightTimeLine.DataLayer
{
     [Table("Bosses")]
     public class BossEntity
     {
          [Key]
          public int Id { get; set; }
          public Guid Identifier { get; set; }
          public string Name { get; set; }
          public string UserName { get; set; }
          public bool IsPrivate { get; set; }
          public string Data { get; set; }
          public long? Reference { get; set; }
          public DateTimeOffset? CreateDate { get; set; }
          public DateTimeOffset? ModifiedDate { get; set; }
     }

     [Table("Fights")]
     public class FightEntity
     {
          [Key]
          public int Id { get; set; }
          public Guid Identifier { get; set; }
          public string Name { get; set; }
          public string UserName { get; set; }
          public string Data { get; set; }
     }

     [Table("Users")]
     public class UserEntity
     {
          [Key]
          public int Id { get; set; }
          public string Name { get; set; }
          public string Password { get; set; }
     }

     public interface IFightTimelineDbContext
     {
          DbSet<BossEntity> Bosses { get; set; }
          DbSet<FightEntity> Fights { get; set; }
          DbSet<UserEntity> Users { get; set; }
     }


     public class FightTimelineDataContext : DbContext, IFightTimelineDbContext
     {
          public DbSet<BossEntity> Bosses { get; set; }
          public DbSet<FightEntity> Fights { get; set; }
          public DbSet<UserEntity> Users { get; set; }

          public FightTimelineDataContext(DbContextOptions options) : base(options)
          {
          }
     }
}