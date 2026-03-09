using Microsoft.AspNetCore.Mvc;
using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PDHoursControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [SwaggerTag("Gerenciamento de Relatórios de Horas")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// Cria um novo report (registro de horas trabalhadas).
        /// </summary>
        /// <param name="dto">Dados do report: descrição, ID do employee, horas gastas.</param>
        /// <returns>ID do report criado.</returns>
        /// <response code="201">Report criado com sucesso.</response>
        /// <response code="400">Dados inválidos (ex: employee inexistente).</response>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(
            Summary = "Registrar horas trabalhadas",
            Description = "Cria um novo registro de horas trabalhadas para um funcionário"
        )]
        [SwaggerResponse(201, "Report criado com sucesso", typeof(object))]
        [SwaggerResponse(400, "Dados inválidos (ex: horas fora do intervalo)")]
        [SwaggerResponse(404, "Funcionário não encontrado")]
        public async Task<IActionResult> CreateReport([FromBody] ReportCreateDto dto)
        {
            var id = await _reportService.CreateReportAsync(dto);

            return StatusCode(StatusCodes.Status201Created, new
            {
                message = "Report created sucessfully",
                id
            });
        }

        /// <summary>
        /// Obtém todos os relatórios de horas de uma squad em um período específico.
        /// </summary>
        /// <param name="squadId">ID da squad.</param>
        /// <param name="startDate">Data inicial do período (formato: YYYY-MM-DD).</param>
        /// <param name="endDate">Data final do período (formato: YYYY-MM-DD).</param>
        /// <returns>Lista de relatórios detalhados da squad no período.</returns>
        /// <response code="200">Relatórios retornados com sucesso.</response>
        /// <response code="400">Data inicial maior que data final.</response>
        [HttpGet("squad/{squadId}")]
        [SwaggerOperation(
            Summary = "Listar relatórios por squad e período",
            Description = "Retorna todos os relatórios de horas de uma squad em um período específico"
        )]
        [SwaggerResponse(200, "Relatórios encontrados", typeof(IEnumerable<ReportDetailDto>))]
        [SwaggerResponse(400, "Período inválido")]
        [SwaggerResponse(404, "Squad não encontrada")]
        public async Task<ActionResult<IEnumerable<ReportDetailDto>>> GetReportsBySquad(
            int squadId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var reports = await _reportService.GetReportsBySquadAndPeriodAsync(squadId, startDate, endDate);
            return Ok(reports);
        }
    }
}