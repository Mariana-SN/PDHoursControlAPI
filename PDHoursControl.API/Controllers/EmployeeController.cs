using Microsoft.AspNetCore.Mvc;
using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PDHoursControl.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [SwaggerTag("Gerenciamento de Funcionários")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        /// <summary>
        /// Retorna todos os employees cadastrados.
        /// </summary>
        /// <returns>Lista de employees.</returns>
        /// <response code="200">Lista retornada com sucesso.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EmployeeResponseDto>), StatusCodes.Status200OK)]
        [SwaggerOperation(
            Summary = "Listar todos os funcionários",
            Description = "Retorna uma lista com todos os funcionários cadastrados no sistema"
        )]
        [SwaggerResponse(200, "Funcionários encontrados", typeof(IEnumerable<EmployeeResponseDto>))]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetAllEmployees()
        {
            var employees = await _employeeService.GetAllEmployeesAsync();
            return Ok(employees);
        }

        /// <summary>
        /// Cria um novo employee.
        /// </summary>
        /// <param name="dto">Dados do employee: nome, horas estimadas por dia, ID da squad.</param>
        /// <returns>ID do employee criado.</returns>
        /// <response code="201">Employee criado com sucesso.</response>
        /// <response code="400">Dados inválidos (ex: estimatedHours fora de 1-12, squad inexistente).</response>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(
            Summary = "Criar novo funcionário",
            Description = "Cria um novo funcionário no sistema"
        )]
        [SwaggerResponse(201, "Funcionário criado", typeof(object))]
        [SwaggerResponse(400, "Dados inválidos")]
        public async Task<IActionResult> CreateEmployee([FromBody] EmployeeCreateDto dto)
        {
            var id = await _employeeService.CreateEmployeeAsync(dto);

            return StatusCode(StatusCodes.Status201Created, new
            {
                message = "Employee created sucessfully",
                id
            });
        }

        /// <summary>
        /// Obtém um employee pelo ID.
        /// </summary>
        /// <param name="id">ID do employee.</param>
        /// <returns>Dados do employee.</returns>
        /// <response code="200">Employee encontrado com sucesso.</response>
        /// <response code="404">Employee não encontrado.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status200OK)]
        [SwaggerOperation(
            Summary = "Buscar funcionário por ID",
            Description = "Retorna os dados de um funcionário específico"
        )]
        [SwaggerResponse(200, "Funcionário encontrado", typeof(EmployeeResponseDto))]
        [SwaggerResponse(404, "Funcionário não encontrado")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployee(int id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            return Ok(employee);
        }

        /// <summary>
        /// Obtém todos os employees pertencentes a uma squad específica.
        /// </summary>
        /// <param name="squadId">ID da squad.</param>
        /// <returns>Lista de employees da squad.</returns>
        /// <response code="200">Lista retornada com sucesso.</response>
        [HttpGet("bysquad/{squadId}")]
        [ProducesResponseType(typeof(IEnumerable<EmployeeResponseDto>), StatusCodes.Status200OK)]
        [SwaggerOperation(
            Summary = "Listar funcionários por squad",
            Description = "Retorna todos os funcionários pertencentes a uma squad específica"
        )]
        [SwaggerResponse(200, "Funcionários encontrados", typeof(IEnumerable<EmployeeResponseDto>))]
        [SwaggerResponse(404, "Squad não encontrada")]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetEmployeesBySquad(int squadId)
        {
            var employees = await _employeeService.GetBySquadIdAsync(squadId);
            return Ok(employees);
        }
    }
}