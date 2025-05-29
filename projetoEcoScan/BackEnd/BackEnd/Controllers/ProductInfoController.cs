// BackEnd/Controllers/ProductInfoController.cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace BackEnd.Controllers
{
    public class ProductInfo
    {
        public string? Barcode { get; set; } // Adicionado ?
        public string? ProductName { get; set; } // Adicionado ?
        public string? Material { get; set; } // Adicionado ?
        public string? DisposalTips { get; set; } // Adicionado ?
        public string? RecyclingInfo { get; set; } // Adicionado ?
        public string? SustainabilityImpact { get; set; } // Adicionado ?
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ProductInfoController : ControllerBase
    {
        // Simulação de um banco de dados em memória
        private static readonly List<ProductInfo> _products = new List<ProductInfo>
        {
            new ProductInfo
            {
                Barcode = "7891000315507", // Exemplo: Código de barras de uma Coca-Cola lata
                ProductName = "Refrigerante em Lata",
                Material = "Alumínio (lata), Tinta (rótulo)",
                DisposalTips = "Lave a lata antes de descartar para evitar odores e atrair vetores. Amasse a lata para reduzir o volume.",
                RecyclingInfo = "O alumínio é 100% reciclável e pode ser reciclado infinitas vezes. Separe para a coleta seletiva.",
                SustainabilityImpact = "Reciclar alumínio economiza cerca de 95% da energia necessária para produzir alumínio primário."
            },
            new ProductInfo
            {
                Barcode = "7891991010769", // Exemplo: Código de barras de uma Garrafa PET de Água
                ProductName = "Água Mineral em Garrafa PET",
                Material = "Plástico PET (garrafa), Plástico PP (tampa), Papel/Plástico (rótulo)",
                DisposalTips = "Esvazie completamente a garrafa. Amasse para reduzir volume. Se possível, separe a tampa e o rótulo, pois podem ter processos de reciclagem diferentes.",
                RecyclingInfo = "O PET é reciclável. Procure pontos de coleta seletiva. A tampa (geralmente PP ou PEAD) também é reciclável.",
                SustainabilityImpact = "A reciclagem de PET reduz a extração de petróleo e o volume em aterros sanitários."
            },
            new ProductInfo
            {
                Barcode = "1234567890123", // Código genérico para teste
                ProductName = "Produto de Papelão",
                Material = "Papelão ondulado",
                DisposalTips = "Desmonte a caixa para reduzir o volume. Mantenha seco e limpo.",
                RecyclingInfo = "O papelão é amplamente reciclável. Certifique-se de que não está contaminado com gordura ou umidade excessiva.",
                SustainabilityImpact = "Reciclar papelão salva árvores, água e energia."
            }
            // Adicione mais produtos aqui
        };

        [HttpGet] // Rota: /api/productinfo?barcode=CODIGO_AQUI
        public ActionResult<ProductInfo> GetProductInfoByBarcode([FromQuery] string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
            {
                return BadRequest("O código de barras não pode ser vazio.");
            }

            var product = _products.FirstOrDefault(p => p.Barcode == barcode);

            if (product == null)
            {
                // Para fins de teste, se não encontrar, retorna um produto genérico de "não encontrado"
                // Em uma aplicação real, você retornaria NotFound() ou uma mensagem específica.
                return Ok(new ProductInfo {
                    Barcode = barcode,
                    ProductName = "Produto não cadastrado",
                    Material = "Desconhecido",
                    DisposalTips = "Informações de descarte não disponíveis para este produto. Consulte o fabricante ou a embalagem.",
                    RecyclingInfo = "Verifique a simbologia de reciclagem na embalagem.",
                    SustainabilityImpact = "Consumir conscientemente é o primeiro passo."
                });
                // return NotFound($"Produto com código de barras '{barcode}' não encontrado.");
            }

            return Ok(product);
        }
    }
}