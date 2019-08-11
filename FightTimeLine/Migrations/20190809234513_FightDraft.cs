using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FightTimeLine.Migrations
{
    public partial class FightDraft : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreateDate",
                table: "Fights",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Fights",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ModifiedDate",
                table: "Fights",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "Fights");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Fights");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "Fights");
        }
    }
}
