namespace HaruHana.Models;

public record OneThing
{
    public OneThing(int id, string content)
    {
        Id = id;
        Content = content;
    }

    public int Id { get; init; }
    public string Content { get; init; }
}
