using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FightTimeLine.Migrations
{
    public partial class update : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn("Author", "Fights", "dbo");
            migrationBuilder.DropColumn("BossRef", "Fights", "dbo");
            migrationBuilder.DropColumn("Secret", "Fights", "dbo");
            migrationBuilder.DropColumn("Author", "Bosses", "dbo");
            migrationBuilder.DropColumn("Secret", "Bosses", "dbo");
            migrationBuilder.AddColumn<long?>("Reference", "Bosses",nullable:true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
        }
    }
}
