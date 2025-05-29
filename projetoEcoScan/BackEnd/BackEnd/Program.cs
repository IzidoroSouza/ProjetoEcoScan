

// BackEnd/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Adicionar serviços ao container.
builder.Services.AddControllers();

// Configuração do CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactNativeApp", // Dê um nome para a política
        builder =>
        {
            builder.AllowAnyOrigin() // Para desenvolvimento. Em produção, seja mais específico.
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure o pipeline de requisições HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.Urls.Clear();
app.Urls.Add("http://localhost:5291");        // Para acesso do próprio PC
app.Urls.Add("http://COLOCAR_IP:5291"); //ACESSO NO CELULAR
// Se quiser manter o 0.0.0.0 como fallback geral, pode adicionar, mas o IP explícito é bom para este teste
// app.Urls.Add("http://0.0.0.0:5291");
app.Urls.Add("https://localhost:7299");       // Se você usa HTTPS no localhost
// ...
app.Run();
app.UseHttpsRedirection(); // Mantenha se estiver usando HTTPS

app.UseRouting(); // Adicionado para garantir que o roteamento funcione antes do CORS

app.UseCors("AllowReactNativeApp"); // Aplicar a política CORS

app.UseAuthorization();

app.MapControllers();

app.Run();