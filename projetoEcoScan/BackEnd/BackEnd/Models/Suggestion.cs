
using System; // Para DateTime
using System.ComponentModel.DataAnnotations;

namespace BackEnd.Models
{
    public class Suggestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Barcode { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public string Material { get; set; } = string.Empty;

        public string DisposalTips { get; set; } = "Aguardando análise";
        public string RecyclingInfo { get; set; } = "Aguardando análise";
        public string SustainabilityImpact { get; set; } = "Aguardando análise";

        public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pendente";
    }
}