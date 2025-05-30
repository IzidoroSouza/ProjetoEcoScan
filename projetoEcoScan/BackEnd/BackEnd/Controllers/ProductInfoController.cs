using BackEnd.Data;
using BackEnd.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization; // Para JsonPropertyName
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic; // Para List

namespace BackEnd.Controllers
{
    // --- Estruturas para desserializar a resposta da API OpenFoodFacts ---
    public class OpenFoodFactsPackagingDetail
    {
        [JsonPropertyName("material")]
        public string? Material { get; set; } // Ex: "en:plastic"

        [JsonPropertyName("shape")]
        public string? Shape { get; set; } // Ex: "pt:Squeeze"
    }

    public class OpenFoodFactsProductDetail
    {
        [JsonPropertyName("product_name")]
        public string? ProductName { get; set; }

        [JsonPropertyName("product_name_pt")]
        public string? ProductNamePt { get; set; }

        [JsonPropertyName("packaging_tags")]
        public List<string>? PackagingTags { get; set; }

        [JsonPropertyName("packaging")]
        public string? Packaging { get; set; }

        [JsonPropertyName("packagings")]
        public List<OpenFoodFactsPackagingDetail>? Packagings { get; set; }
    }

    public class OpenFoodFactsApiResponse
    {
        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("status_verbose")]
        public string? StatusVerbose { get; set; }

        [JsonPropertyName("product")]
        public OpenFoodFactsProductDetail? Product { get; set; }
    }

    // --- DTO para a resposta do seu backend ao frontend ---
    public class EcoProductInfoResponse
    {
        public string Barcode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Material { get; set; } = string.Empty;
        public string? DisposalTips { get; set; }
        public string? RecyclingInfo { get; set; }
        public string? SustainabilityImpact { get; set; }
        public string DataSource { get; set; } = string.Empty;
        public bool SuggestionNeeded { get; set; } = false;
    }

    [ApiController]
    [Route("api/productinfo")]
    public class ProductInfoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public ProductInfoController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<ActionResult<EcoProductInfoResponse>> GetProductInfoByBarcode([FromQuery] string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
            {
                return BadRequest("Barcode cannot be empty.");
            }

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("EcoScanApp/1.0 (seu.email@example.com)");
            var apiUrl = $"https://world.openfoodfacts.org/api/v2/product/{barcode}.json?fields=code,product_name,product_name_pt,packaging_tags,packaging,packagings,status_verbose";

            OpenFoodFactsApiResponse? apiResponse = null;
            try
            {
                var httpResponse = await httpClient.GetAsync(apiUrl);
                if (httpResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = await httpResponse.Content.ReadAsStringAsync();
                    apiResponse = JsonSerializer.Deserialize<OpenFoodFactsApiResponse>(jsonResponse);
                }
                else
                {
                    Console.WriteLine($"OpenFoodFacts API error for barcode {barcode}: {httpResponse.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling OpenFoodFacts API for barcode {barcode}: {ex.Message}");
            }

            if (apiResponse != null && apiResponse.StatusVerbose == "product found" && apiResponse.Product != null)
            {
                var productName = !string.IsNullOrWhiteSpace(apiResponse.Product.ProductNamePt) ? apiResponse.Product.ProductNamePt : apiResponse.Product.ProductName;
                productName ??= "Nome não fornecido pela API";

                string identifiedMaterialKey = "unknown";
                string displayMaterial = "Desconhecido (API)";

                if (apiResponse.Product.Packagings != null && apiResponse.Product.Packagings.Any())
                {
                    var firstPackaging = apiResponse.Product.Packagings.FirstOrDefault(p => !string.IsNullOrWhiteSpace(p.Material));
                    if (firstPackaging != null)
                    {
                        identifiedMaterialKey = firstPackaging.Material!; // Ex: "en:plastic"
                        displayMaterial = identifiedMaterialKey.Contains(':') ? identifiedMaterialKey.Split(':')[1] : identifiedMaterialKey;
                        if(!string.IsNullOrEmpty(displayMaterial))
                            displayMaterial = char.ToUpper(displayMaterial[0]) + displayMaterial.Substring(1);

                        if (!string.IsNullOrWhiteSpace(firstPackaging.Shape))
                        {
                            var shapeClean = firstPackaging.Shape.Contains(':') ? firstPackaging.Shape.Split(':')[1] : firstPackaging.Shape;
                             if(!string.IsNullOrEmpty(shapeClean))
                                shapeClean = char.ToUpper(shapeClean[0]) + shapeClean.Substring(1);
                            displayMaterial += $" ({shapeClean})";
                        }
                    }
                }
                else if (apiResponse.Product.PackagingTags != null && apiResponse.Product.PackagingTags.Any())
                {
                    identifiedMaterialKey = apiResponse.Product.PackagingTags
                        .FirstOrDefault(tag => tag.StartsWith("en:") || tag.StartsWith("pt:")) ?? apiResponse.Product.PackagingTags.First();
                    displayMaterial = identifiedMaterialKey.Contains(':') ? identifiedMaterialKey.Split(':')[1] : identifiedMaterialKey;
                     if(!string.IsNullOrEmpty(displayMaterial))
                        displayMaterial = char.ToUpper(displayMaterial[0]) + displayMaterial.Substring(1);
                }
                else if (!string.IsNullOrWhiteSpace(apiResponse.Product.Packaging))
                {
                    displayMaterial = apiResponse.Product.Packaging;
                    if (displayMaterial.ToLower().Contains("plástico") || displayMaterial.ToLower().Contains("plastic")) identifiedMaterialKey = "en:plastic";
                    else if (displayMaterial.ToLower().Contains("vidro") || displayMaterial.ToLower().Contains("glass")) identifiedMaterialKey = "en:glass";
                    else if (displayMaterial.ToLower().Contains("alumínio") || displayMaterial.ToLower().Contains("aluminium")) identifiedMaterialKey = "en:aluminium";
                    else if (displayMaterial.ToLower().Contains("papelão") || displayMaterial.ToLower().Contains("cardboard")) identifiedMaterialKey = "en:cardboard";
                    else if (displayMaterial.ToLower().Contains("papel") || displayMaterial.ToLower().Contains("paper")) identifiedMaterialKey = "en:paper";
                }

                var materialGuide = await _context.MaterialRecyclingGuides
                                        .FirstOrDefaultAsync(g => g.MaterialNameKey.ToLower() == identifiedMaterialKey.ToLower());

                if (materialGuide != null)
                {
                    return Ok(new EcoProductInfoResponse
                    {
                        Barcode = apiResponse.Code ?? barcode,
                        ProductName = productName,
                        Material = materialGuide.DisplayMaterialName,
                        DisposalTips = materialGuide.DisposalTips,
                        RecyclingInfo = materialGuide.RecyclingInfo,
                        SustainabilityImpact = materialGuide.SustainabilityImpact,
                        DataSource = "API_DB_Guide",
                        SuggestionNeeded = false
                    });
                }
                else
                {
                    return Ok(new EcoProductInfoResponse
                    {
                        Barcode = apiResponse.Code ?? barcode,
                        ProductName = productName,
                        Material = displayMaterial,
                        DisposalTips = "Guia de descarte não encontrado para este material.",
                        RecyclingInfo = "Guia de reciclagem não encontrado para este material.",
                        SustainabilityImpact = "Guia de sustentabilidade não encontrado para este material.",
                        DataSource = "API_No_Guide_For_Material",
                        SuggestionNeeded = true
                    });
                }
            }

            var dbProduct = await _context.Products.FindAsync(barcode);
            if (dbProduct != null)
            {
                return Ok(new EcoProductInfoResponse
                {
                    Barcode = dbProduct.Barcode,
                    ProductName = dbProduct.ProductName,
                    Material = dbProduct.Material,
                    DisposalTips = dbProduct.DisposalTips,
                    RecyclingInfo = dbProduct.RecyclingInfo,
                    SustainabilityImpact = dbProduct.SustainabilityImpact,
                    DataSource = "DB_Product",
                    SuggestionNeeded = false
                });
            }

            return Ok(new EcoProductInfoResponse
            {
                Barcode = barcode,
                ProductName = (apiResponse?.Product?.ProductNamePt ?? apiResponse?.Product?.ProductName) ?? "Produto não encontrado",
                Material = "Material não identificado",
                DisposalTips = null,
                RecyclingInfo = null,
                SustainabilityImpact = null,
                DataSource = "Not_Found_Everywhere",
                SuggestionNeeded = true
            });
        }
    }
}