using System.ComponentModel.DataAnnotations;

namespace BackEnd.Models
{
    public class MaterialRecyclingGuide
    {
        [Key]
        public string MaterialNameKey { get; set; } = string.Empty;

        [Required]
        public string DisplayMaterialName { get; set; } = string.Empty;

        public string? DisposalTips { get; set; }
        public string? RecyclingInfo { get; set; }
        public string? SustainabilityImpact { get; set; }
    }
}