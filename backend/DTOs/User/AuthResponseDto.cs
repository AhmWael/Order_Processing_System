namespace backend.DTOs;

public class AuthResponseDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public string Username { get; set; }
    public string Role { get; set; }
}

public class RefreshRequestDto
{
    public string RefreshToken { get; set; }
}
