using Microsoft.AspNetCore.Mvc;
using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PDHoursControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [SwaggerTag("Gerenciamento de Squads")]
    public class SquadController : ControllerBase
    {
        private readonly ISquadService _squadService;
        private readonly ISquadQueryService _squadQueryService;

        public SquadController(ISquadService squadService, ISquadQueryService squadQueryService)
        {
            _squadService = squadService;
            _squadQueryService = squadQueryService;
        }

        /// <summary>
        /// Retorna todas as squads cadastradas.
        /// </summary>
        /// <returns>Lista de squads.</returns>
        /// <response code="200">Lista retornada com sucesso.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SquadDto>), StatusCodes.Status200OK)]
        [SwaggerOperation(
            Summary = "Listar todas as squads",
            Description = "Retorna uma lista com todas as squads cadastradas no sistema"
        )]
        [SwaggerResponse(200, "Squads encontradas", typeof(IEnumerable<SquadDto>))]
        public async Task<ActionResult<IEnumerable<SquadDto>>> GetAllSquads()
        {
            var squads = await _squadService.GetAllSquadsAsync();
            return Ok(squads);
        }

        /// <summary>
        /// Cria uma nova squad.
        /// </summary>
        /// <param name="dto">Dados da squad (nome).</param>
        /// <returns>ID da squad criada.</returns>
        /// <response code="201">Squad criada com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>s
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(
            Summary = "Criar nova squad",
            Description = "Cria uma nova squad no sistema"
        )]
        [SwaggerResponse(201, "Squad criada", typeof(object))]
        [SwaggerResponse(400, "Dados inválidos")]

        public async Task<IActionResult> CreateSquad([FromBody] SquadCreateDto dto)
        {
            var id = await _squadService.CreateSquadAsync(dto);

            return StatusCode(StatusCodes.Status201Created, new
            {
                message = "Squad created sucessfully",
                id
            });
        }

        /// <summary>
        /// Retorna uma squad pelo ID.
        /// </summary>
        /// <param name="id">ID da squad.</param>
        /// <returns>Dados da squad.</returns>
        /// <response code="200">Squad encontrada.</response>
        /// <response code="404">Squad não encontrada.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SquadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(
            Summary = "Buscar squad por ID",
            Description = "Retorna os dados de uma squad específica"
        )]
        [SwaggerResponse(200, "Squad encontrada", typeof(SquadDto))]
        [SwaggerResponse(404, "Squad não encontrada")]
        public async Task<ActionResult<SquadDto>> GetSquadById(int id)
        {
            var squad = await _squadService.GetSquadByIdAsync(id);
            return Ok(squad);
        }

        /// <summary>
        /// Retorna as horas gastas por cada membro de uma squad em um período.
        /// </summary>
        /// <param name="squadId">ID da squad.</param>
        /// <param name="startDate">Data inicial (formato yyyy-MM-dd).</param>
        /// <param name="endDate">Data final (formato yyyy-MM-dd).</param>
        /// <returns>Lista de membros com total de horas.</returns>
        /// <response code="200">Consulta realizada com sucesso.</response>
        /// <response code="400">Parâmetros inválidos.</response>
        /// <response code="404">Squad não encontrada.</response>
        [HttpGet("{squadId}/hours")]
        [ProducesResponseType(typeof(IEnumerable<MemberHoursDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(
            Summary = "Horas por membro",
            Description = "Retorna as horas gastas por cada membro da squad em um período"
        )]
        [SwaggerResponse(200, "Dados encontrados", typeof(IEnumerable<MemberHoursDto>))]
        [SwaggerResponse(400, "Datas inválidas")]
        [SwaggerResponse(404, "Squad não encontrada")]
        public async Task<ActionResult<IEnumerable<MemberHoursDto>>> GetMemberHours(
            int squadId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var result = await _squadQueryService.GetMemberHoursAsync(squadId, startDate, endDate);
            return Ok(result);
        }

        /// <summary>
        /// Retorna o total de horas gastas por uma squad em um período.
        /// </summary>
        /// <param name="squadId">ID da squad.</param>
        /// <param name="startDate">Data inicial (formato yyyy-MM-dd).</param>
        /// <param name="endDate">Data final (formato yyyy-MM-dd).</param>
        /// <returns>Total de horas.</returns>
        /// <response code="200">Consulta realizada com sucesso.</response>
        /// <response code="400">Parâmetros inválidos.</response>
        /// <response code="404">Squad não encontrada.</response>
        [HttpGet("{squadId}/total-hours")]
        [ProducesResponseType(typeof(SquadTotalHoursDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(
            Summary = "Total de horas",
            Description = "Retorna o total de horas da squad em um período"
        )]
        [SwaggerResponse(200, "Total calculado", typeof(SquadTotalHoursDto))]
        [SwaggerResponse(400, "Datas inválidas")]
        [SwaggerResponse(404, "Squad não encontrada")]
        public async Task<ActionResult<SquadTotalHoursDto>> GetTotalHours(
            int squadId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var total = await _squadQueryService.GetTotalHoursAsync(squadId, startDate, endDate);
            return Ok(new SquadTotalHoursDto(squadId, total));
        }

        /// <summary>
        /// Retorna a média de horas por dia gastas por uma squad em um período.
        /// </summary>
        /// <param name="squadId">ID da squad.</param>
        /// <param name="startDate">Data inicial (formato yyyy-MM-dd).</param>
        /// <param name="endDate">Data final (formato yyyy-MM-dd).</param>
        /// <returns>Média de horas por dia.</returns>
        /// <response code="200">Consulta realizada com sucesso.</response>
        /// <response code="400">Parâmetros inválidos.</response>
        /// <response code="404">Squad não encontrada.</response>
        [HttpGet("{squadId}/average-hours-per-day")]
        [ProducesResponseType(typeof(SquadAverageHoursDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(
            Summary = "Média de horas por dia",
            Description = "Retorna a média de horas por dia da squad no período"
        )]
        [SwaggerResponse(200, "Média calculada", typeof(SquadAverageHoursDto))]
        [SwaggerResponse(400, "Datas inválidas")]
        [SwaggerResponse(404, "Squad não encontrada")]
        public async Task<ActionResult<SquadAverageHoursDto>> GetAverageHoursPerDay(
            int squadId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var average = await _squadQueryService.GetAverageHoursPerDayAsync(squadId, startDate, endDate);
            return Ok(new SquadAverageHoursDto(average));
        }
    }
}