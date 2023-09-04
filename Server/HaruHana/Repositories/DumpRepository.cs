using System.Collections.Immutable;

namespace HaruHana.Repositories;

public class DumpRepository : IRepository
{
    private readonly IRepository _repo;
    private readonly IEnumerable<OneThing> _dump = ImmutableList.CreateRange(new OneThing[]
    {
        new OneThing(1, "밥먹기"),
        new OneThing(2, "양치하기"),
        new OneThing(3, "세수하기"),
        new OneThing(4, "머리감기"),
        new OneThing(5, "출근하기"),
    });

    public DumpRepository(IRepository repo) => _repo = repo;

    public IEnumerable<OneThing> GetOneThings() => _repo.GetOneThings().UnionBy(_dump, x => x.Content);
}
