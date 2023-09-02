using HaruHana;
using HaruHana.Models;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration["ConnectionString"];
var db = new MongoClient(connectionString).GetDatabase("HaruHana");

builder.Services
    .AddSingleton(db)
    .AddSingleton<Repository>()
    ;

var app = builder.Build();

var repo = app.Services.GetRequiredService<Repository>();

await repo.InsertOneThing(new OneThing("1"));
await repo.InsertOneThing(new OneThing("2"));
await repo.InsertOneThing(new OneThing("3"));
var result = repo.GetOneThings();

app.Run();
