using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace PDHoursControl.Shared.Filters
{
    public class RequestLoggingFilter : IActionFilter
    {
        private readonly ILogger<RequestLoggingFilter> _logger;

        public RequestLoggingFilter(ILogger<RequestLoggingFilter> logger)
        {
            _logger = logger;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                var request = context.HttpContext.Request;
                var controller = context.RouteData.Values["controller"];
                var action = context.RouteData.Values["action"];

                var arguments = JsonSerializer.Serialize(context.ActionArguments);

                _logger.LogInformation(
                    "[REQUEST] {Method} {Path} | Controller: {Controller}.{Action} | Args: {Arguments}",
                    request.Method,
                    request.Path,
                    controller,
                    action,
                    arguments);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                var controller = context.RouteData.Values["controller"];
                var action = context.RouteData.Values["action"];
                var response = context.HttpContext.Response;

                _logger.LogInformation(
                    "[RESPONSE] {Controller}.{Action} | Status: {StatusCode}",
                    controller,
                    action,
                    response.StatusCode);
            }
        }
    }
}