using Microsoft.EntityFrameworkCore.Migrations;

namespace FightTimeLine.Migrations
{
    public partial class GameColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Game",
                table: "Fights",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Game",
                table: "Bosses",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Game",
                table: "Fights");

            migrationBuilder.DropColumn(
                name: "Game",
                table: "Bosses");
        }
    }
}
