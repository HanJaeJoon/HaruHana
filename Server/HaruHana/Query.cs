using HaruHana.Repositories;

namespace HaruHana;

public class Query
{
    private readonly IRepository _repository;

    public Query(IRepository repository)
    {
        _repository = repository;
    }

    public IEnumerable<OneThing> GetOneThings() => _repository.GetOneThings();
}
