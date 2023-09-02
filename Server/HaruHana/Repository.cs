using HaruHana.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HaruHana;

public class Repository
{
    private readonly IMongoDatabase _db;

    public Repository(IMongoDatabase db) => _db = db;

    public IEnumerable<OneThing> GetOneThings() => _db.GetCollection<OneThing>("OneThing").Find(new BsonDocument()).ToEnumerable();

    public async Task InsertOneThing(OneThing oneThing) => await _db.GetCollection<OneThing>("OneThing").InsertOneAsync(oneThing);

}
