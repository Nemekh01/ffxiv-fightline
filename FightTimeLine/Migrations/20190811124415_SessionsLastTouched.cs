using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FightTimeLine.Migrations
{
    public partial class SessionsLastTouched : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastTouched",
                table: "Sessions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastTouched",
                table: "Sessions");
        }
    }
}
