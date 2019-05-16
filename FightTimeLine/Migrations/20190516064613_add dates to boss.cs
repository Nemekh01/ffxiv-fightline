using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FightTimeLine.Migrations
{
    public partial class adddatestoboss : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "Reference",
                table: "Bosses",
                nullable: true,
                oldClrType: typeof(long));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreateDate",
                table: "Bosses",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ModifiedDate",
                table: "Bosses",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "Bosses");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "Bosses");

            migrationBuilder.AlterColumn<long>(
                name: "Reference",
                table: "Bosses",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);
        }
    }
}
