using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using PDHoursControl.Shared.Exceptions;

namespace PDHoursControl.Shared.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu uma exceção não tratada.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                ArgumentNullException => (StatusCodes.Status400BadRequest, exception.Message),
                ArgumentOutOfRangeException => (StatusCodes.Status400BadRequest, exception.Message),
                ArgumentException => (StatusCodes.Status400BadRequest, exception.Message),
                InvalidOperationException => (StatusCodes.Status400BadRequest, exception.Message),
                KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
                ResourceNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
                _ => (StatusCodes.Status500InternalServerError, "Ocorreu um erro interno no servidor.")
            };

            context.Response.StatusCode = statusCode;
            var response = new { error = message };
            return context.Response.WriteAsJsonAsync(response);
        }
    }
}