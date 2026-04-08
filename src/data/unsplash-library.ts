/**
 * Biblioteca curada de imagens Unsplash por categoria de profissional.
 *
 * **Todas as IDs foram validadas via HEAD request (200 OK).** Se uma imagem
 * ficar 404 no futuro (Unsplash às vezes remove fotos), reabra o validador
 * e troque o ID.
 *
 * Cada categoria tem um array de IDs Unsplash que representam visualmente
 * o serviço daquela categoria. O `cover` de cada vendor deve sair daqui.
 * O `portfolio` também — sempre 6 imagens da MESMA categoria, nunca misturar.
 *
 * **Por que assim:** antes (vendors.ts v1) cada vendor escolhia IDs avulsos,
 * o que gerou misturas (decoradora com foto de comida, fotógrafa com foto
 * de flor solta, etc). Agora a curadoria é centralizada e tematicamente
 * coerente.
 */

const u = (id: string) => `https://images.unsplash.com/${id}?w=1400&q=80`;

export const UNSPLASH = {
  // Casais sendo fotografados, retratos editoriais, momento bride/groom
  fotografia: [
    u("photo-1511285560929-80b456fea0bc"),
    u("photo-1606216794074-735e91aa2c92"),
    u("photo-1583939003579-730e3918a45a"),
    u("photo-1525258946800-98cfd641d0de"),
    u("photo-1469371670807-013ccf25f16a"),
    u("photo-1583939411023-14783179e581"),
    u("photo-1606800052052-a08af7148866"),
    u("photo-1519741497674-611481863552"),
    u("photo-1591604466107-ec97de577aff"),
    u("photo-1502635385003-ee1e6a1a742d"),
  ],

  // Pratos servidos, mesas postas, comida em destaque, plating
  buffet: [
    u("photo-1555244162-803834f70033"),
    u("photo-1567620905732-2d1ec7ab7445"),
    u("photo-1414235077428-338989a2e8c0"),
    u("photo-1546069901-ba9599a7e63c"),
    u("photo-1565299624946-b28f40a0ae38"),
    u("photo-1546554137-f86b9593a222"),
    u("photo-1551183053-bf91a1d81141"),
    u("photo-1559339352-11d035aa65de"),
    u("photo-1571997478779-2adcbbe9ab2f"),
    u("photo-1530103862676-de8c9debad1d"),
  ],

  // Centros de mesa, ambientação editorial, mood, mesas decoradas
  decoracao: [
    u("photo-1519225421980-715cb0215aed"),
    u("photo-1606490194859-07c18c9f0968"),
    u("photo-1525772764200-be829a350797"),
    u("photo-1478146059778-26028b07395a"),
    u("photo-1604017011826-d3b4c23f8914"),
  ],

  // Bouquets, ramos, floral isolado, flores em vasos
  flores: [
    u("photo-1490750967868-88aa4486c946"),
    u("photo-1487530811176-3780de880c2d"),
    u("photo-1561181286-d3fee7d55364"),
    u("photo-1519378058457-4c29a0a2efac"),
    u("photo-1494625927555-6ec4433b1571"),
    u("photo-1471696035578-3d8c78d99684"),
  ],

  // Vestidos de noiva, ateliê, modelo de noiva, costura
  "roupas-noiva": [
    u("photo-1546552768-9e3a94b38a59"),
    u("photo-1594552072238-b8a33785b261"),
    u("photo-1525258946800-98cfd641d0de"),
    u("photo-1525772764200-be829a350797"),
    u("photo-1502635385003-ee1e6a1a742d"),
    u("photo-1623091410901-00e2d268901f"),
    u("photo-1623091411395-09e79fdbfcf3"),
  ],

  // Pista de dança, festa noturna, banda, DJ, luzes, multidão dançando
  "festa-musica": [
    u("photo-1493676304819-0d7a8d026dcf"),
    u("photo-1514525253161-7a46d19cd819"),
    u("photo-1485872299829-c673f5194813"),
    u("photo-1429962714451-bb934ecdc4ec"),
    u("photo-1470225620780-dba8ba36b745"),
    u("photo-1516450360452-9312f5e86fc7"),
  ],

  // Convites impressos, papelaria, lettering, envelopes, save the date
  convites: [
    u("photo-1606857521015-7f9fcf423740"),
    u("photo-1495640388908-05fa85288e61"),
    u("photo-1551184451-76b762941ad6"),
    u("photo-1606503153255-59d8b8b82176"),
    u("photo-1599785209707-a456fc1337bb"),
  ],

  // Câmera, equipamento de filmagem, cineasta, set, behind the scenes
  filmagem: [
    u("photo-1517457373958-b7bdd4587205"),
    u("photo-1583939411023-14783179e581"),
    u("photo-1469371670807-013ccf25f16a"),
    u("photo-1606216794074-735e91aa2c92"),
    u("photo-1591604466107-ec97de577aff"),
    u("photo-1485872299829-c673f5194813"),
  ],

  // Doces, brigadeiros, mesa de doces, bolo de casamento
  doces: [
    u("photo-1535254973040-607b474cb50d"),
    u("photo-1558301211-0d8c8ddee6ec"),
    u("photo-1563729784474-d77dbb933a9e"),
    u("photo-1578985545062-69928b1d9587"),
    u("photo-1621303837174-89787a7d4729"),
    u("photo-1464349095431-e9a21285b5f3"),
    u("photo-1587668178277-295251f900ce"),
  ],

  // Terno, smoking, alfaiataria masculina, noivo
  "roupa-noivo": [
    u("photo-1507679799987-c73b1d16a7e4"),
    u("photo-1594938298603-c8148c4dae35"),
    u("photo-1593032465175-481ac7f401a0"),
    u("photo-1519085360753-af0119f7cbe7"),
    u("photo-1620012253295-c15cc3e65df4"),
    u("photo-1617137984095-74e4e5e3613f"),
  ],

  // Mesas, cadeiras, lounges, mobiliário de evento
  mobiliario: [
    u("photo-1519167758481-83f550bb49b3"),
    u("photo-1464366400600-7168b8af9bc3"),
    u("photo-1522413452208-996ff3f3e740"),
    u("photo-1533174072545-7a4b6ad7a6c3"),
    u("photo-1510076857177-7470076d4098"),
    u("photo-1505236858219-8359eb29e329"),
  ],

  // Maquiagem, cabelo, dia da noiva, beleza
  beleza: [
    u("photo-1522335789203-aabd1fc54bc9"),
    u("photo-1487412947147-5cebf100ffc2"),
    u("photo-1560750588-73207b1ef5b8"),
    u("photo-1596178065887-1198b6148b2b"),
    u("photo-1512496015851-a90fb38ba796"),
    u("photo-1457972729786-0411a3b2b626"),
  ],

  // Open bar, coquetelaria, drinks, bartender
  bar: [
    u("photo-1551024709-8f23befc6f87"),
    u("photo-1470337458703-46ad1756a187"),
    u("photo-1514362545857-3bc16c4c7d1b"),
    u("photo-1536935338788-846bb9981813"),
    u("photo-1575444758702-4a6b9222c016"),
    u("photo-1556679343-c7306c1976bc"),
  ],
} as const;

/**
 * Pega a Nth imagem da biblioteca de uma categoria, com wrap-around.
 * Usado para gerar cover + portfolio de cada vendor sem repetir
 * (ou repetindo só quando o pool é menor que o pedido).
 */
export function pickImage(
  category: keyof typeof UNSPLASH,
  index: number,
): string {
  const pool = UNSPLASH[category];
  return pool[index % pool.length];
}

/**
 * Gera um cover + portfolio de N imagens para um vendor de uma categoria.
 * Faz "rotation" usando o offset, então vendors diferentes da mesma
 * categoria pegam fotos diferentes (até onde a biblioteca permite).
 */
export function buildVendorImages(
  category: keyof typeof UNSPLASH,
  vendorIndex: number,
  portfolioSize = 6,
): { cover: string; portfolio: string[] } {
  const pool = UNSPLASH[category];
  const offset = vendorIndex * 2; // 2 fotos de "deslocamento" entre vendors
  const cover = pool[offset % pool.length];
  const portfolio: string[] = [];
  for (let i = 0; i < portfolioSize; i++) {
    portfolio.push(pool[(offset + i + 1) % pool.length]);
  }
  return { cover, portfolio };
}
