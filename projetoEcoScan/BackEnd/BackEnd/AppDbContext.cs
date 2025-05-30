using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace BackEnd.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<MaterialRecyclingGuide> MaterialRecyclingGuides { get; set; }
        public DbSet<Suggestion> Suggestions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Barcode);
            });

            modelBuilder.Entity<MaterialRecyclingGuide>(entity =>
            {
                entity.HasKey(e => e.MaterialNameKey);
            });

            modelBuilder.Entity<Suggestion>(entity =>
            {
                entity.HasIndex(e => e.Barcode);
            });

            modelBuilder.Entity<MaterialRecyclingGuide>().HasData(
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "papel",
                    DisplayMaterialName = "Papel",
                    DisposalTips = "Descarte jornais, revistas, folhas de caderno e caixas de papel limpas e secas. Evite amassar em bola. Remova contaminantes como clipes grandes ou fitas adesivas.",
                    RecyclingInfo = "Não são recicláveis: papéis higiênicos usados, papel carbono, fotografias, papéis plastificados ou aqueles muito sujos com gordura ou restos de alimentos (estes vão para o lixo comum).",
                    SustainabilityImpact = "Reciclar papel salva árvores, reduz o consumo de água e energia, e diminui a quantidade de resíduos em aterros."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "papelao",
                    DisplayMaterialName = "Papelão",
                    DisposalTips = "Desmonte caixas para reduzir volume. Certifique-se de que estejam limpas, livres de gordura ou umidade excessiva. Embalagens longa vida (Tetra Pak) podem ser recicladas se sua cidade tiver coleta específica.",
                    RecyclingInfo = "Não são recicláveis: Papelão muito engordurado (como o fundo de caixas de pizza sujas) ou molhado (estes vão para o lixo comum).",
                    SustainabilityImpact = "A reciclagem de papelão conserva recursos naturais, economiza energia e reduz o lixo em aterros."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "plastico",
                    DisplayMaterialName = "Plásticos",
                    DisposalTips = "Lave, seque e, se possível, amasse embalagens como garrafas PET, embalagens de produtos de limpeza/higiene e potes de alimentos. Verifique o símbolo de reciclabilidade.",
                    RecyclingInfo = "Geralmente não são recicláveis (verifique na sua cidade): isopor, embalagens metalizadas (ex: salgadinhos), adesivos e plásticos termorrígidos. Estes devem ir para o lixo comum para não contaminar o processo.",
                    SustainabilityImpact = "Reciclar plástico economiza recursos naturais (petróleo), energia e reduz o volume de lixo nos aterros."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "metal",
                    DisplayMaterialName = "Metais",
                    DisposalTips = "Latas de alumínio e aço (bebidas, alimentos), tampas metálicas e papel alumínio devem estar limpos. Latas preferencialmente amassadas.",
                    RecyclingInfo = "Não devem ser misturados aos recicláveis comuns: esponjas de aço, latas de tinta ou produtos químicos. Pilhas e baterias exigem descarte especial em pontos de coleta específicos.",
                    SustainabilityImpact = "Reciclar metais, especialmente alumínio, economiza uma quantidade significativa de energia e reduz a necessidade de mineração."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "vidro",
                    DisplayMaterialName = "Vidro",
                    DisposalTips = "Garrafas, potes e frascos devem ser descartados limpos. Cacos de vidro precisam ser cuidadosamente embalados em jornal ou caixa de papelão resistente e devidamente sinalizados com 'CUIDADO: VIDRO QUEBRADO'.",
                    RecyclingInfo = "Não são recicláveis: espelhos, vidros temperados (Pyrex, box de banheiro), lâmpadas (requerem descarte especial), cerâmicas ou porcelanas. Estes devem ir para o lixo comum ou pontos de coleta específicos.",
                    SustainabilityImpact = "O vidro é 100% reciclável e pode ser reciclado infinitas vezes, economizando energia e matéria-prima."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "en:plastic",
                    DisplayMaterialName = "Plástico (API)",
                    DisposalTips = "Lave, seque e, se possível, amasse embalagens como garrafas PET, embalagens de produtos de limpeza/higiene e potes de alimentos. Verifique o símbolo de reciclabilidade.",
                    RecyclingInfo = "Geralmente não são recicláveis (verifique na sua cidade): isopor, embalagens metalizadas (ex: salgadinhos), adesivos e plásticos termorrígidos. Estes devem ir para o lixo comum para não contaminar o processo.",
                    SustainabilityImpact = "Reciclar plástico economiza recursos naturais (petróleo), energia e reduz o volume de lixo nos aterros."
                },
                 new MaterialRecyclingGuide
                {
                    MaterialNameKey = "en:aluminium",
                    DisplayMaterialName = "Alumínio (API)",
                    DisposalTips = "Latas de alumínio e aço (bebidas, alimentos), tampas metálicas e papel alumínio devem estar limpos. Latas preferencialmente amassadas.",
                    RecyclingInfo = "Não devem ser misturados aos recicláveis comuns: esponjas de aço, latas de tinta ou produtos químicos. Pilhas e baterias exigem descarte especial em pontos de coleta específicos.",
                    SustainabilityImpact = "Reciclar metais, especialmente alumínio, economiza uma quantidade significativa de energia e reduz a necessidade de mineração."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "en:glass",
                    DisplayMaterialName = "Vidro (API)",
                    DisposalTips = "Garrafas, potes e frascos devem ser descartados limpos. Cacos de vidro precisam ser cuidadosamente embalados em jornal ou caixa de papelão resistente e devidamente sinalizados com 'CUIDADO: VIDRO QUEBRADO'.",
                    RecyclingInfo = "Não são recicláveis: espelhos, vidros temperados (Pyrex, box de banheiro), lâmpadas (requerem descarte especial), cerâmicas ou porcelanas. Estes devem ir para o lixo comum ou pontos de coleta específicos.",
                    SustainabilityImpact = "O vidro é 100% reciclável e pode ser reciclado infinitas vezes, economizando energia e matéria-prima."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "en:paper",
                    DisplayMaterialName = "Papel (API)",
                    DisposalTips = "Descarte jornais, revistas, folhas de caderno e caixas de papel limpas e secas. Evite amassar em bola. Remova contaminantes como clipes grandes ou fitas adesivas.",
                    RecyclingInfo = "Não são recicláveis: papéis higiênicos usados, papel carbono, fotografias, papéis plastificados ou aqueles muito sujos com gordura ou restos de alimentos (estes vão para o lixo comum).",
                    SustainabilityImpact = "Reciclar papel salva árvores, reduz o consumo de água e energia, e diminui a quantidade de resíduos em aterros."
                },
                new MaterialRecyclingGuide
                {
                    MaterialNameKey = "en:cardboard",
                    DisplayMaterialName = "Papelão (API)",
                    DisposalTips = "Desmonte caixas para reduzir volume. Certifique-se de que estejam limpas, livres de gordura ou umidade excessiva. Embalagens longa vida (Tetra Pak) podem ser recicladas se sua cidade tiver coleta específica.",
                    RecyclingInfo = "Não são recicláveis: Papelão muito engordurado (como o fundo de caixas de pizza sujas) ou molhado (estes vão para o lixo comum).",
                    SustainabilityImpact = "A reciclagem de papelão conserva recursos naturais, economiza energia e reduz o lixo em aterros."
                }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Barcode = "7891000315507",
                    ProductName = "Refrigerante em Lata",
                    Material = "Alumínio",
                    DisposalTips = "Lave e amasse a lata. Deposite no cesto amarelo.",
                    RecyclingInfo = "O alumínio é 100% reciclável. Reciclar economiza 95% da energia.",
                    SustainabilityImpact = "Reduz a extração de bauxita e o consumo de energia.",
                    DateAdded = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                },
                new Product
                {
                    Barcode = "7891991010769",
                    ProductName = "Água Mineral Garrafa PET",
                    Material = "Plástico PET",
                    DisposalTips = "Esvazie, lave e amasse a garrafa. Separe a tampa. Deposite no cesto vermelho.",
                    RecyclingInfo = "PET é reciclável. A tampa (PP/PEAD) também. O rótulo pode precisar ser removido.",
                    SustainabilityImpact = "Reduz extração de petróleo e volume em aterros.",
                    DateAdded = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                },
                new Product
                {
                    Barcode = "7896005800057",
                    ProductName = "Leite Longa Vida Caixa",
                    Material = "Embalagem Cartonada (Papelão, Plástico, Alumínio)",
                    DisposalTips = "Esvazie e amasse levemente. Algumas cidades coletam separadamente.",
                    RecyclingInfo = "A reciclagem de embalagens longa vida é possível, mas depende da infraestrutura local.",
                    SustainabilityImpact = "Quando reciclada, contribui para a economia de recursos.",
                    DateAdded = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                },
                new Product
                {
                    Barcode = "7891149101017",
                    ProductName = "Cerveja Garrafa de Vidro",
                    Material = "Vidro",
                    DisposalTips = "Lave a garrafa. Deposite no cesto verde. Cuidado com cacos.",
                    RecyclingInfo = "Vidro é 100% reciclável.",
                    SustainabilityImpact = "Economia de energia e matéria-prima.",
                    DateAdded = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                },
                new Product
                {
                    Barcode = "1234567890000",
                    ProductName = "Caderno Espiral",
                    Material = "Papel e Metal (espiral)",
                    DisposalTips = "Remova a espiral metálica se possível (descarte com metais). As folhas de papel limpas vão para o cesto azul.",
                    RecyclingInfo = "Folhas de papel são recicláveis. A espiral metálica também.",
                    SustainabilityImpact = "Contribui para a preservação de árvores.",
                    DateAdded = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                }
            );
        }
    }
}