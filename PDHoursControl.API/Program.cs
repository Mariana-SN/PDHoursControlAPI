using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using PDHoursControl.Application.Interfaces;
using PDHoursControl.Application.Services;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Infrastructure.Data;
using PDHoursControl.Infrastructure.Repositories;
using PDHoursControl.Shared.Filters;
using PDHoursControl.Shared.Middlewares;
using System.Reflection;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<RequestLoggingFilter>();

builder.Services.AddControllers(options =>
{
    options.Filters.AddService<RequestLoggingFilter>();
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.WriteIndented = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PD Hours Control API",
        Version = "v1",
        Description = "API para controle de horas de membros por squad"
    });

    c.EnableAnnotations();

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

builder.Services.AddDbContext<PDHoursContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ISquadService, SquadService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<ISquadQueryService, SquadQueryService>();

builder.Services.AddScoped<ISquadRepository, SquadRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PD Hours Control API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection(); 

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
