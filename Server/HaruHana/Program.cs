using HaruHana;
using HaruHana.Repositories;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration["ConnectionString"];
var db = new MongoClient(connectionString).GetDatabase("HaruHana");

builder.Services
    .AddSingleton(db)
    .AddSingleton<IRepository, Repository>()
    .Decorate<IRepository, DumpRepository>()
;

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
;

var app = builder.Build();

app.MapGraphQL();

app.Run();