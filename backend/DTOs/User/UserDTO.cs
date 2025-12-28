namespace backend.DTOs;

public class UserLoginDto
{
    public string Login { get; set; } // Can be either username or email
    public string Password { get; set; }
}

public class UserRegisterDto
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string LastName { get; set; }
    public string FirstName { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

public class UserResponseDto
{
    public Guid UId { get; set; }
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string Role { get; set; }
}

public class UserUpdateDto
{
    public string FirstName { get; set; } = null!;
    public string LastName  { get; set; } = null!;
    public string Email     { get; set; } = null!;
    public string? Phone    { get; set; }
    public string? Address  { get; set; }
}
