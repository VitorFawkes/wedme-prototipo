import type {
  ServiceGroup,
  BringYourOwnOption,
  CategoryFAQ,
  ColorPalette,
  CategorySlug,
} from "@/types";

/**
 * Catálogo completo de serviços por categoria.
 *
 * Cada categoria tem:
 * - services: grupos de serviços com itens individuais e preços
 * - bring_your_own?: opção de trazer fornecedor externo (com infraestrutura)
 * - faq?: perguntas frequentes específicas da categoria
 * - color_palettes?: paletas de cores (só para decoração)
 */

// ============================================================
// Paletas de cores (usadas em decoração)
// ============================================================

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "primavera",
    name: "Primavera",
    colors: ["#F4C2C2", "#FFD1DC", "#FAE3D9", "#C9E4CA", "#FFF5BA"],
  },
  {
    id: "outono",
    name: "Outono",
    colors: ["#8B4513", "#CD853F", "#D2691E", "#BC8F8F", "#F5DEB3"],
  },
  {
    id: "verao",
    name: "Verão",
    colors: ["#FF6B6B", "#FFA07A", "#FFD700", "#98FB98", "#87CEEB"],
  },
  {
    id: "inverno",
    name: "Inverno",
    colors: ["#2F4F4F", "#708090", "#B0C4DE", "#E0E0E0", "#FFFAFA"],
  },
  {
    id: "romantico",
    name: "Romântico",
    colors: ["#DB7093", "#FFC0CB", "#FFE4E1", "#F0E68C", "#E6E6FA"],
  },
  {
    id: "rustico",
    name: "Rústico",
    colors: ["#8B7355", "#A0522D", "#D2B48C", "#F5F5DC", "#6B8E23"],
  },
];

// ============================================================
// Serviços por categoria
// ============================================================

type CategoryServices = {
  services: ServiceGroup[];
  bring_your_own?: BringYourOwnOption[];
  faq: CategoryFAQ[];
  color_palettes?: ColorPalette[];
};

export const CATEGORY_SERVICES: Record<CategorySlug, CategoryServices> = {
  // ──────────────────────────────────────────────
  // LOCAL (Venue)
  // ──────────────────────────────────────────────
  local: {
    services: [
      {
        id: "venue-rental",
        name: "Locação do espaço",
        description: "Aluguel do espaço para o evento",
        items: [
          { id: "venue-full-day", name: "Locação dia inteiro (12h)", price: 35000, category: "base" },
          { id: "venue-half-day", name: "Locação meio período (6h)", price: 20000, category: "base" },
          { id: "venue-ceremony", name: "Área de cerimônia exclusiva", price: 5000, category: "addon" },
          { id: "venue-reception", name: "Área de recepção coberta", price: 8000, category: "addon" },
          { id: "venue-suite", name: "Suíte getting ready (noiva)", price: 3000, category: "addon" },
          { id: "venue-suite-groom", name: "Suíte getting ready (noivo)", price: 2000, category: "addon" },
          { id: "venue-parking", name: "Estacionamento (50 vagas)", price: 3500, category: "addon" },
          { id: "venue-parking-valet", name: "Serviço de valet", price: 4500, category: "addon" },
          { id: "venue-generator", name: "Gerador de energia backup", price: 2500, category: "addon" },
          { id: "venue-security", name: "Equipe de segurança (4 profissionais)", price: 3000, category: "addon" },
        ],
        default_items: ["venue-full-day"],
      },
    ],
    faq: [
      { question: "Posso visitar o espaço antes de reservar?", answer: "Sim, agende uma visita pelo nosso time. Fazemos visitas guiadas de segunda a sábado." },
      { question: "Qual a capacidade máxima?", answer: "Depende do espaço escolhido. Nossos espaços variam de 50 a 500 convidados." },
      { question: "O espaço inclui cozinha para buffet?", answer: "Sim, todos os nossos espaços possuem cozinha industrial equipada para os fornecedores de buffet." },
    ],
  },

  // ──────────────────────────────────────────────
  // FOTOGRAFIA
  // ──────────────────────────────────────────────
  fotografia: {
    services: [
      {
        id: "photo-coverage",
        name: "Cobertura fotográfica",
        description: "Registro profissional do seu grande dia",
        items: [
          { id: "photo-4h", name: "Cobertura 4h (cerimônia)", price: 3000, category: "base" },
          { id: "photo-8h", name: "Cobertura 8h (cerimônia + festa)", price: 5500, category: "base" },
          { id: "photo-12h", name: "Cobertura 12h (dia completo)", price: 8000, category: "base" },
          { id: "photo-second", name: "Segundo fotógrafo", price: 2000, category: "addon" },
          { id: "photo-prewedding", name: "Ensaio pré-wedding (2h)", price: 1500, category: "addon" },
          { id: "photo-album", name: "Álbum premium 30x30cm", price: 2500, category: "addon" },
          { id: "photo-album-mini", name: "Mini álbum para pais (2 unid)", price: 1200, category: "addon" },
          { id: "photo-gallery", name: "Galeria digital online", price: 800, category: "addon" },
          { id: "photo-drone", name: "Fotos com drone", price: 1500, category: "addon" },
          { id: "photo-booth", name: "Photo booth (cabine de fotos)", price: 3000, category: "addon" },
        ],
        default_items: ["photo-8h", "photo-gallery"],
      },
    ],
    faq: [
      { question: "Quanto tempo demora para receber as fotos?", answer: "A galeria digital fica pronta em até 30 dias. O álbum impresso, em até 60 dias." },
      { question: "Posso escolher as fotos do álbum?", answer: "Sim! Você recebe a galeria completa e seleciona as fotos favoritas para o álbum." },
      { question: "O fotógrafo conhece o espaço?", answer: "Se o espaço for um dos parceiros Welucci, sim. Caso contrário, fazemos uma visita técnica prévia." },
    ],
  },

  // ──────────────────────────────────────────────
  // BUFFET / GASTRONOMIA
  // ──────────────────────────────────────────────
  buffet: {
    services: [
      {
        id: "menu-selection",
        name: "Cardápio",
        description: "Escolha o menu ideal para a sua celebração",
        items: [
          { id: "menu-silver", name: "Silver Menu (entrada + prato + sobremesa)", price: 180, category: "base", description: "Por pessoa. Inclui: salada caesar, filé ao molho madeira, petit gâteau" },
          { id: "menu-gold", name: "Gold Menu (2 entradas + 2 pratos + sobremesa)", price: 280, category: "base", description: "Por pessoa. Inclui: carpaccio, risoto de camarão, filé, tiramisù" },
          { id: "menu-premium", name: "Premium Menu (degustação 5 tempos)", price: 420, category: "base", description: "Por pessoa. Menu degustação exclusivo com harmonização de vinhos" },
          { id: "menu-kids", name: "Menu infantil", price: 90, category: "addon", description: "Por criança. Nuggets, mini hambúrguer, batata frita, suco" },
          { id: "menu-late-night", name: "Estação late-night", price: 45, category: "addon", description: "Por pessoa. Pizza, hambúrguer artesanal, crepe" },
          { id: "menu-welcome", name: "Welcome drink + finger food", price: 65, category: "addon", description: "Por pessoa. 3 tipos de canapés + espumante" },
        ],
        default_items: ["menu-gold"],
      },
    ],
    bring_your_own: [
      {
        id: "bring-chef",
        label: "Trazer chef/buffet de fora",
        infrastructure_items: [
          { id: "infra-kitchen", name: "Cozinha industrial equipada", price: 5000, category: "infrastructure" },
          { id: "infra-serving", name: "Louças e talheres (por pessoa)", price: 25, category: "infrastructure" },
          { id: "infra-tables-buffet", name: "Mesa de buffet (4 unid)", price: 1200, category: "infrastructure" },
          { id: "infra-staff-waiter", name: "Garçons (equipe de 6)", price: 3600, category: "infrastructure" },
        ],
      },
    ],
    faq: [
      { question: "Posso fazer degustação antes?", answer: "Sim! Oferecemos uma sessão de degustação para o casal até 60 dias antes do evento." },
      { question: "O cardápio pode ser personalizado?", answer: "Sim, podemos adaptar pratos para restrições alimentares e preferências especiais." },
      { question: "O preço é por pessoa?", answer: "Sim, os menus são cobrados por convidado. O preço final depende do número confirmado." },
    ],
  },

  // ──────────────────────────────────────────────
  // DECORAÇÃO
  // ──────────────────────────────────────────────
  decoracao: {
    services: [
      {
        id: "decor-main",
        name: "Decoração",
        description: "Transforme o espaço no cenário dos seus sonhos",
        items: [
          { id: "decor-full", name: "Pacote decoração completa", price: 15000, category: "base", description: "Cerimônia + recepção + lounge" },
          { id: "decor-ceremony-only", name: "Decoração cerimônia", price: 6000, category: "base", description: "Altar, corredor, cadeiras" },
          { id: "decor-arch", name: "Arco/altar de cerimônia", price: 3500, category: "addon" },
          { id: "decor-centerpieces", name: "Centros de mesa (por mesa)", price: 350, category: "addon" },
          { id: "decor-aisle", name: "Decoração do corredor", price: 2000, category: "addon" },
          { id: "decor-lounge", name: "Área lounge decorada", price: 4000, category: "addon" },
          { id: "decor-lighting", name: "Design de iluminação cênica", price: 5000, category: "addon" },
          { id: "decor-entrance", name: "Decoração da entrada/hall", price: 2500, category: "addon" },
        ],
        default_items: ["decor-full"],
      },
    ],
    bring_your_own: [
      {
        id: "bring-decorator",
        label: "Trazer decorador de fora",
        infrastructure_items: [
          { id: "infra-tables-round", name: "Mesas redondas (10 unid)", price: 2000, category: "infrastructure" },
          { id: "infra-chairs", name: "Cadeiras (100 unid)", price: 1500, category: "infrastructure" },
          { id: "infra-linens", name: "Toalhas e guardanapos", price: 1200, category: "infrastructure" },
          { id: "infra-lighting-rig", name: "Estrutura de iluminação", price: 3500, category: "infrastructure" },
          { id: "infra-arch-structure", name: "Estrutura para arco/altar", price: 1000, category: "infrastructure" },
        ],
      },
    ],
    color_palettes: COLOR_PALETTES,
    faq: [
      { question: "A decoração inclui flores?", answer: "Flores são uma categoria separada. A decoração inclui estrutura, tecidos, iluminação e objetos decorativos." },
      { question: "Posso escolher a paleta de cores?", answer: "Sim! Oferecemos paletas pré-definidas ou criamos uma paleta exclusiva para você." },
      { question: "O decorador visita o espaço antes?", answer: "Sim, fazemos uma visita técnica para planejar cada detalhe." },
    ],
  },

  // ──────────────────────────────────────────────
  // FLORES
  // ──────────────────────────────────────────────
  flores: {
    services: [
      {
        id: "flowers-main",
        name: "Arranjos florais",
        description: "Flores frescas para cada momento do dia",
        items: [
          { id: "flowers-bouquet", name: "Bouquet da noiva", price: 800, category: "base" },
          { id: "flowers-bouquet-toss", name: "Bouquet para jogada", price: 350, category: "addon" },
          { id: "flowers-bridesmaids", name: "Bouquets madrinhas (por unid)", price: 250, category: "addon" },
          { id: "flowers-boutonniere", name: "Lapelas (por unid)", price: 80, category: "addon" },
          { id: "flowers-ceremony", name: "Flores cerimônia (altar + corredor)", price: 3500, category: "addon" },
          { id: "flowers-reception", name: "Arranjos recepção (por mesa)", price: 300, category: "addon" },
          { id: "flowers-wall", name: "Parede/arco de flores", price: 5000, category: "addon" },
          { id: "flowers-cake-decor", name: "Flores para o bolo", price: 400, category: "addon" },
        ],
        default_items: ["flowers-bouquet"],
      },
    ],
    faq: [
      { question: "Quais flores estão disponíveis na época do meu casamento?", answer: "Dependemos da sazonalidade. Na consulta, apresentamos as opções disponíveis para a data." },
      { question: "As flores são naturais ou artificiais?", answer: "Trabalhamos com flores naturais frescas. Flores preservadas disponíveis sob consulta." },
    ],
  },

  // ──────────────────────────────────────────────
  // ROUPAS DE NOIVA
  // ──────────────────────────────────────────────
  "roupas-noiva": {
    services: [
      {
        id: "bride-outfit",
        name: "Look da noiva",
        description: "O vestido e acessórios para o grande dia",
        items: [
          { id: "bride-dress-rent", name: "Vestido (aluguel)", price: 5000, category: "base" },
          { id: "bride-dress-buy", name: "Vestido (compra)", price: 12000, category: "base" },
          { id: "bride-veil", name: "Véu", price: 1200, category: "addon" },
          { id: "bride-tiara", name: "Tiara/coroa", price: 800, category: "addon" },
          { id: "bride-jewelry", name: "Kit joias (brinco + colar)", price: 1500, category: "addon" },
          { id: "bride-shoes", name: "Sapato", price: 1000, category: "addon" },
          { id: "bride-alterations", name: "Ajustes e customização", price: 1500, category: "addon" },
          { id: "bride-second-dress", name: "Segundo vestido (festa)", price: 3000, category: "addon" },
        ],
        default_items: ["bride-dress-rent"],
      },
    ],
    faq: [
      { question: "Quanto tempo antes preciso escolher o vestido?", answer: "Recomendamos pelo menos 6 meses antes para compra e 3 meses para aluguel." },
      { question: "Posso experimentar vários vestidos?", answer: "Sim! Agende sua sessão de prova e experimente quantos desejar." },
    ],
  },

  // ──────────────────────────────────────────────
  // FESTA & MÚSICA
  // ──────────────────────────────────────────────
  "festa-musica": {
    services: [
      {
        id: "music-main",
        name: "Música e entretenimento",
        description: "A trilha sonora perfeita para cada momento",
        items: [
          { id: "music-dj", name: "DJ (6h de festa)", price: 4000, category: "base" },
          { id: "music-band", name: "Banda ao vivo (4h)", price: 12000, category: "base" },
          { id: "music-ceremony", name: "Músico para cerimônia (violino/piano)", price: 2500, category: "addon" },
          { id: "music-sax", name: "Saxofonista (recepção)", price: 2000, category: "addon" },
          { id: "music-sound", name: "Sistema de som profissional", price: 3500, category: "addon" },
          { id: "music-lighting", name: "Iluminação de pista", price: 2500, category: "addon" },
          { id: "music-dancefloor", name: "Pista de dança (montagem)", price: 3000, category: "addon" },
        ],
        default_items: ["music-dj"],
      },
    ],
    bring_your_own: [
      {
        id: "bring-band",
        label: "Trazer banda/DJ de fora",
        infrastructure_items: [
          { id: "infra-sound-system", name: "Sistema de som (PA + mesa)", price: 4000, category: "infrastructure" },
          { id: "infra-stage", name: "Palco/tablado (4x3m)", price: 3000, category: "infrastructure" },
          { id: "infra-lighting-party", name: "Iluminação de festa", price: 3000, category: "infrastructure" },
          { id: "infra-power", name: "Ponto de energia dedicado", price: 1500, category: "infrastructure" },
          { id: "infra-dancefloor", name: "Pista de dança", price: 3000, category: "infrastructure" },
        ],
      },
    ],
    faq: [
      { question: "A banda toca o repertório que eu quiser?", answer: "Sim, você envia uma playlist de referência e a banda prepara o repertório." },
      { question: "Posso ter DJ e banda?", answer: "Sim! Muitos casais combinam banda no início e DJ para o after." },
      { question: "E se eu quiser trazer minha própria banda?", answer: "Oferecemos toda a infraestrutura: som, palco, iluminação e energia." },
    ],
  },

  // ──────────────────────────────────────────────
  // CONVITES
  // ──────────────────────────────────────────────
  convites: {
    services: [
      {
        id: "invites-main",
        name: "Convites e papelaria",
        description: "O primeiro toque do casamento",
        items: [
          { id: "invite-digital", name: "Convite digital (design + envio)", price: 800, category: "base" },
          { id: "invite-printed", name: "Convite impresso (por unid)", price: 25, category: "base" },
          { id: "invite-rsvp", name: "Gestão de RSVPs online", price: 500, category: "addon" },
          { id: "invite-savedate", name: "Save the date digital", price: 400, category: "addon" },
          { id: "invite-menu-card", name: "Cardápio de mesa (por unid)", price: 15, category: "addon" },
          { id: "invite-program", name: "Programa da cerimônia (por unid)", price: 12, category: "addon" },
          { id: "invite-seating", name: "Mapa de assentos impresso", price: 600, category: "addon" },
          { id: "invite-thankyou", name: "Cartão de agradecimento (por unid)", price: 10, category: "addon" },
        ],
        default_items: ["invite-digital"],
      },
    ],
    faq: [
      { question: "Quanto tempo antes devo enviar os convites?", answer: "Recomendamos 3 meses antes para impressos e 2 meses para digitais." },
      { question: "Posso personalizar o design?", answer: "Sim! Criamos um design exclusivo alinhado com a identidade visual do seu casamento." },
    ],
  },

  // ──────────────────────────────────────────────
  // FILMAGEM
  // ──────────────────────────────────────────────
  filmagem: {
    services: [
      {
        id: "video-main",
        name: "Filmagem",
        description: "O filme que vocês vão assistir mil vezes",
        items: [
          { id: "video-4h", name: "Cobertura 4h", price: 3500, category: "base" },
          { id: "video-8h", name: "Cobertura 8h", price: 6000, category: "base" },
          { id: "video-12h", name: "Cobertura 12h (dia completo)", price: 9000, category: "base" },
          { id: "video-highlight", name: "Vídeo highlight (3-5min)", price: 2000, category: "addon" },
          { id: "video-ceremony-full", name: "Cerimônia completa editada", price: 1500, category: "addon" },
          { id: "video-drone", name: "Filmagem com drone", price: 2000, category: "addon" },
          { id: "video-sameday", name: "Same-day edit (exibido na festa)", price: 4000, category: "addon" },
          { id: "video-second", name: "Segundo cinegrafista", price: 2500, category: "addon" },
        ],
        default_items: ["video-8h", "video-highlight"],
      },
    ],
    faq: [
      { question: "Quanto tempo para receber o vídeo?", answer: "O highlight fica pronto em 30 dias. O filme completo, em até 90 dias." },
      { question: "Posso escolher a trilha sonora?", answer: "Sim, você pode sugerir músicas para a edição." },
    ],
  },

  // ──────────────────────────────────────────────
  // DOCES & BOLO
  // ──────────────────────────────────────────────
  doces: {
    services: [
      {
        id: "sweets-main",
        name: "Doces e bolo",
        description: "A doçura que completa a celebração",
        items: [
          { id: "cake-2tier", name: "Bolo 2 andares", price: 1500, category: "base" },
          { id: "cake-3tier", name: "Bolo 3 andares", price: 2500, category: "base" },
          { id: "cake-4tier", name: "Bolo 4 andares (cenográfico + real)", price: 4000, category: "base" },
          { id: "sweets-table", name: "Mesa de doces finos (200 unid)", price: 3000, category: "addon" },
          { id: "sweets-table-large", name: "Mesa de doces finos (400 unid)", price: 5500, category: "addon" },
          { id: "sweets-candy-bar", name: "Candy bar temático", price: 2000, category: "addon" },
          { id: "sweets-topper", name: "Topo de bolo personalizado", price: 350, category: "addon" },
          { id: "sweets-custom-flavor", name: "Sabores customizados (consulta)", price: 500, category: "addon" },
        ],
        default_items: ["cake-3tier"],
      },
    ],
    faq: [
      { question: "Posso fazer degustação de bolo?", answer: "Sim! Agende uma degustação com até 3 sabores." },
      { question: "Bolo cenográfico é uma boa opção?", answer: "Sim, para casamentos grandes é comum usar um bolo cenográfico e servir fatias de um bolo real na cozinha." },
    ],
  },

  // ──────────────────────────────────────────────
  // ROUPA DO NOIVO
  // ──────────────────────────────────────────────
  "roupa-noivo": {
    services: [
      {
        id: "groom-outfit",
        name: "Look do noivo",
        description: "O traje que marca o grande dia",
        items: [
          { id: "groom-suit-rent", name: "Terno (aluguel)", price: 1500, category: "base" },
          { id: "groom-suit-buy", name: "Terno sob medida (compra)", price: 5000, category: "base" },
          { id: "groom-shirt", name: "Camisa social", price: 400, category: "addon" },
          { id: "groom-shoes", name: "Sapato", price: 800, category: "addon" },
          { id: "groom-tie", name: "Gravata/gravata borboleta", price: 200, category: "addon" },
          { id: "groom-cufflinks", name: "Abotoaduras", price: 300, category: "addon" },
          { id: "groom-pocket-square", name: "Lenço de bolso", price: 100, category: "addon" },
          { id: "groom-suspenders", name: "Suspensórios", price: 250, category: "addon" },
        ],
        default_items: ["groom-suit-rent"],
      },
    ],
    faq: [
      { question: "Quanto tempo antes preciso provar?", answer: "Para compra sob medida, 4 meses antes. Para aluguel, 2 meses." },
      { question: "Posso combinar o terno com o vestido da noiva?", answer: "Sim! Nossos consultores ajudam a harmonizar os looks." },
    ],
  },

  // ──────────────────────────────────────────────
  // MOBILIÁRIO
  // ──────────────────────────────────────────────
  mobiliario: {
    services: [
      {
        id: "furniture-main",
        name: "Mobiliário",
        description: "O cenário que acolhe cada momento",
        items: [
          { id: "furn-tables-round", name: "Mesas redondas (10 unid)", price: 2000, category: "base" },
          { id: "furn-tables-rect", name: "Mesas retangulares (5 unid)", price: 1800, category: "base" },
          { id: "furn-chairs-classic", name: "Cadeiras clássicas (100 unid)", price: 1500, category: "addon" },
          { id: "furn-chairs-tiffany", name: "Cadeiras Tiffany (100 unid)", price: 2500, category: "addon" },
          { id: "furn-lounge", name: "Conjunto lounge (sofás + puffs)", price: 3500, category: "addon" },
          { id: "furn-bar-counter", name: "Balcão de bar", price: 2000, category: "addon" },
          { id: "furn-dancefloor", name: "Pista de dança LED", price: 5000, category: "addon" },
          { id: "furn-tent", name: "Tenda/cobertura (100m²)", price: 8000, category: "addon" },
          { id: "furn-tent-large", name: "Tenda/cobertura (200m²)", price: 14000, category: "addon" },
        ],
        default_items: ["furn-tables-round"],
      },
    ],
    faq: [
      { question: "Os móveis são entregues e montados?", answer: "Sim, a montagem e desmontagem estão incluídas no preço." },
      { question: "Posso misturar estilos de mesas?", answer: "Sim! Muitos casais combinam mesas redondas com uma mesa imperial para a mesa principal." },
    ],
  },

  // ──────────────────────────────────────────────
  // BELEZA
  // ──────────────────────────────────────────────
  beleza: {
    services: [
      {
        id: "beauty-main",
        name: "Beleza",
        description: "O brilho que vai acompanhar vocês o dia todo",
        items: [
          { id: "beauty-hair-bride", name: "Cabelo noiva", price: 600, category: "base" },
          { id: "beauty-makeup-bride", name: "Maquiagem noiva", price: 550, category: "base" },
          { id: "beauty-groom", name: "Grooming noivo", price: 250, category: "addon" },
          { id: "beauty-hair-bridesmaids", name: "Cabelo madrinhas (por pessoa)", price: 300, category: "addon" },
          { id: "beauty-makeup-bridesmaids", name: "Maquiagem madrinhas (por pessoa)", price: 280, category: "addon" },
          { id: "beauty-trial", name: "Sessão teste (prova de cabelo + make)", price: 450, category: "addon" },
          { id: "beauty-touchup", name: "Maquiador on-site (retoque durante festa)", price: 400, category: "addon" },
          { id: "beauty-nails", name: "Unhas (manicure + pedicure)", price: 200, category: "addon" },
          { id: "beauty-lashes", name: "Cílios postiços", price: 150, category: "addon" },
        ],
        default_items: ["beauty-hair-bride", "beauty-makeup-bride"],
      },
    ],
    faq: [
      { question: "A prova é obrigatória?", answer: "Não é obrigatória, mas recomendamos fortemente para garantir o resultado desejado." },
      { question: "A maquiadora fica durante toda a festa?", answer: "Com o serviço on-site, sim. Ela faz retoques durante toda a celebração." },
    ],
  },

  // ──────────────────────────────────────────────
  // BAR & DRINKS
  // ──────────────────────────────────────────────
  bar: {
    services: [
      {
        id: "bar-main",
        name: "Bar e bebidas",
        description: "O brinde que abre a festa",
        items: [
          { id: "bar-standard", name: "Open bar standard (por pessoa)", price: 120, category: "base", description: "Cerveja, vinho, vodka, whisky, refrigerantes, água" },
          { id: "bar-premium", name: "Open bar premium (por pessoa)", price: 200, category: "base", description: "Standard + gin, drinks autorais, espumante" },
          { id: "bar-signature", name: "Drinks signature (2 receitas exclusivas)", price: 1500, category: "addon" },
          { id: "bar-wine", name: "Serviço de vinho na mesa", price: 60, category: "addon", description: "Por pessoa. Vinho branco + tinto selecionados" },
          { id: "bar-nonalcoholic", name: "Estação de drinks sem álcool", price: 800, category: "addon" },
          { id: "bar-champagne-toast", name: "Brinde com champagne (por pessoa)", price: 45, category: "addon" },
          { id: "bar-bartenders", name: "Bartenders (equipe de 3)", price: 2400, category: "addon" },
        ],
        default_items: ["bar-standard"],
      },
    ],
    bring_your_own: [
      {
        id: "bring-drinks",
        label: "Trazer bebidas de fora",
        infrastructure_items: [
          { id: "infra-bartenders", name: "Bartenders (equipe de 3)", price: 2400, category: "infrastructure" },
          { id: "infra-glassware", name: "Copos e taças (por pessoa)", price: 15, category: "infrastructure" },
          { id: "infra-ice", name: "Gelo (100kg)", price: 300, category: "infrastructure" },
          { id: "infra-bar-structure", name: "Balcão de bar + back bar", price: 2000, category: "infrastructure" },
          { id: "infra-coolers", name: "Freezers e coolers", price: 800, category: "infrastructure" },
        ],
      },
    ],
    faq: [
      { question: "Posso trazer minhas próprias bebidas?", answer: "Sim! Oferecemos toda a infraestrutura: bartenders, copos, gelo e estrutura de bar." },
      { question: "Quanto álcool preciso por pessoa?", answer: "Em média, 1 dose a cada 30-40 minutos. Para 6h de festa, calcule cerca de 10 doses por pessoa." },
      { question: "Tem opção sem álcool?", answer: "Sim! Temos estação de drinks sem álcool com mocktails criativos." },
    ],
  },
};
