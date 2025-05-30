using BackEnd.Data;
using BackEnd.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Para ToListAsync
using System; // Para DateTime
using System.ComponentModel.DataAnnotations; // Para [Required]
using System.Threading.Tasks;
using System.Collections.Generic; // Para IEnumerable
using System.Linq; // Para OrderByDescending

namespace BackEnd.Controllers
{
    public class CreateSuggestionDto
    {
        [Required]
        public string Barcode { get; set; } = string.Empty;
        [Required]
        public string ProductName { get; set; } = string.Empty;
        [Required]
        public string Material { get; set; } = string.Empty;
        public string? DisposalTips { get; set; }
        public string? RecyclingInfo { get; set; }
        public string? SustainabilityImpact { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SuggestionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuggestionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSuggestion([FromBody] CreateSuggestionDto suggestionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newSuggestion = new Suggestion
            {
                Barcode = suggestionDto.Barcode,
                ProductName = suggestionDto.ProductName,
                Material = suggestionDto.Material,
                DisposalTips = !string.IsNullOrWhiteSpace(suggestionDto.DisposalTips) ? suggestionDto.DisposalTips : "Aguardando análise",
                RecyclingInfo = !string.IsNullOrWhiteSpace(suggestionDto.RecyclingInfo) ? suggestionDto.RecyclingInfo : "Aguardando análise",
                SustainabilityImpact = !string.IsNullOrWhiteSpace(suggestionDto.SustainabilityImpact) ? suggestionDto.SustainabilityImpact : "Aguardando análise",
                DateSubmitted = DateTime.UtcNow,
                Status = "Pendente"
            };

            _context.Suggestions.Add(newSuggestion);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Obrigado pela sua colaboração!" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Suggestion>>> GetAllSuggestions()
        {
            var suggestions = await _context.Suggestions.OrderByDescending(s => s.DateSubmitted).ToListAsync();
            return Ok(suggestions);
        }
    }
}
