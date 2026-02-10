export type PlayerEra =
  | "clasicos"
  | "era-dorada"
  | "corazon-verdiblanco"
  | "nuevo-betis";

export interface Player {
  id: string;
  name: string;
  position: string;
  years: string;
  era: PlayerEra;
  description: string;
  highlight: string;
  videoSearchQuery: string;
  quote?: string;
  stats?: string;
}

export const ERA_ORDER: PlayerEra[] = [
  "clasicos",
  "era-dorada",
  "corazon-verdiblanco",
  "nuevo-betis",
];

export const ERA_CONFIG: Record<
  PlayerEra,
  { title: string; subtitle: string; years: string }
> = {
  clasicos: {
    title: "Clásicos del Villamarín",
    subtitle: "Los pioneros que forjaron la leyenda del Betis",
    years: "1970–1986",
  },
  "era-dorada": {
    title: "La Era Dorada",
    subtitle: "Brasileños, Champions y Copa del Rey",
    years: "1997–2008",
  },
  "corazon-verdiblanco": {
    title: "Corazón Verdiblanco",
    subtitle: "Guerreros que nunca dejaron de luchar",
    years: "2008–2018",
  },
  "nuevo-betis": {
    title: "El Nuevo Betis",
    subtitle: "La generación que devolvió la gloria",
    years: "2015–2024",
  },
};

export const LEYENDAS: Player[] = [
  // ── CLÁSICOS DEL VILLAMARÍN ──────────────────────────────────────────
  {
    id: "julio-cardenosa",
    name: "Julio Cardeñosa",
    position: "Centrocampista",
    years: "1971–1981",
    era: "clasicos",
    description:
      "El maestro del centro del campo. Cardeñosa poseía una elegancia y visión de juego únicas. Su famoso fallo ante Brasil en el Mundial del 78 no empañó una carrera extraordinaria con el Betis.",
    highlight: "Ídolo eterno del Villamarín",
    videoSearchQuery: "julio+cardenosa+betis+mejores+momentos",
    quote: "El Villamarín fue mi vida entera",
    stats: "+300 partidos con el Betis",
  },
  {
    id: "rafael-gordillo",
    name: "Rafael Gordillo",
    position: "Lateral izquierdo",
    years: "1974–1985",
    era: "clasicos",
    description:
      "Leyenda del fútbol español formado en la cantera bética. Gordillo fue el mejor lateral izquierdo de su generación. Su entrega y calidad en la banda izquierda marcaron una época dorada.",
    highlight: "75 internacionalidades con España",
    videoSearchQuery: "rafael+gordillo+betis+espana+mejores+momentos",
    quote: "Lo que soy se lo debo al Betis",
    stats: "Copa del Rey 1977 · 75 veces internacional",
  },
  {
    id: "hipolito-rincon",
    name: "Hipólito Rincón",
    position: "Delantero",
    years: "1978–1986",
    era: "clasicos",
    description:
      "Uno de los goleadores más queridos de la historia del Betis. Hipólito Rincón era puro instinto dentro del área, un delantero que vivía para el gol y que formó una dupla letal con Cardeñosa. Su entrega y carácter lo convirtieron en ídolo de la grada.",
    highlight: "Goleador de referencia en los 80",
    videoSearchQuery: "hipolito+rincon+betis+goles+mejores+momentos",
    stats: "+100 goles con el Betis",
  },

  // ── LA ERA DORADA ────────────────────────────────────────────────────
  {
    id: "denilson",
    name: "Denilson",
    position: "Extremo izquierdo",
    years: "1998–2000",
    era: "era-dorada",
    description:
      "El brasileño más caro del mundo llegó al Betis y dejó destellos de magia pura. Su fichaje puso al Betis en el mapa mundial y sus regates imposibles siguen en la memoria colectiva.",
    highlight: "Fichaje récord mundial en 1998",
    videoSearchQuery: "denilson+betis+regates+goles+mejores+momentos",
    stats: "Récord mundial: 5.000 millones de pesetas",
  },
  {
    id: "oliveira",
    name: "Oliveira",
    position: "Mediapunta",
    years: "1997–2002",
    era: "era-dorada",
    description:
      "El brasileño que enamoró al Villamarín con su fútbol elegante. Oliveira combinaba técnica depurada con gol y fue uno de los jugadores más queridos de finales de los 90.",
    highlight: "Referente de la época dorada brasileña",
    videoSearchQuery: "oliveira+betis+goles+mejores+momentos",
    quote: "El Betis me dio los mejores años de mi carrera",
    stats: "+100 partidos como verdiblanco",
  },
  {
    id: "ricardo",
    name: "Ricardo",
    position: "Mediapunta",
    years: "1998–2004",
    era: "era-dorada",
    description:
      "Otro de los grandes brasileños que vistieron la verdiblanca. Ricardo aportó clase y creatividad al mediocampo bético durante seis temporadas memorables.",
    highlight: "Clave en la clasificación para Champions",
    videoSearchQuery: "ricardo+oliveira+betis+goles+jugadas",
    stats: "52 goles en 6 temporadas",
  },
  {
    id: "assuncao",
    name: "Assunção",
    position: "Centrocampista",
    years: "2001–2005",
    era: "era-dorada",
    description:
      "El cerebro del mediocampo del Betis de Champions. Assunção era pura calidad con el balón en los pies, combinando pases milimétricos con una llegada goleadora desde segunda línea.",
    highlight: "Protagonista en la Copa del Rey 2005",
    videoSearchQuery: "assuncao+betis+goles+jugadas+champions",
    quote: "El Betis tiene algo especial que te atrapa",
    stats: "Champions League + Copa del Rey 2005",
  },
  {
    id: "alfonso-perez",
    name: "Alfonso Pérez",
    position: "Delantero",
    years: "2002–2005",
    era: "era-dorada",
    description:
      "Goleador fundamental en una de las mejores épocas del Betis. Alfonso fue pieza clave del equipo que jugó la Champions League y conquistó la Copa del Rey en 2005.",
    highlight: "Campeón de la Copa del Rey 2005",
    videoSearchQuery: "alfonso+perez+betis+goles+copa+del+rey+2005",
    stats: "Goleador en Champions y Copa del Rey",
  },
  {
    id: "nono",
    name: "Nono",
    position: "Centrocampista",
    years: "2001–2008",
    era: "era-dorada",
    description:
      "El capitán que levantó la Copa del Rey en 2005. Nono representaba los valores del Betis como nadie: lucha, entrega y pasión. Líder en el vestuario y en el campo, fue el alma del equipo más exitoso del siglo XXI.",
    highlight: "Capitán en la Copa del Rey 2005",
    videoSearchQuery: "nono+betis+copa+del+rey+2005+capitan",
    quote: "Levantar esa Copa es lo mejor que me ha pasado",
    stats: "7 temporadas de entrega total",
  },
  {
    id: "capi",
    name: "Capi",
    position: "Mediapunta",
    years: "2003–2008",
    era: "era-dorada",
    description:
      "Un jugador de talento desbordante que brilló en el Betis de la Copa del Rey y la Champions. Capi aportaba creatividad, gol y desequilibrio. Favorito de la afición por su fútbol alegre y desprejuiciado.",
    highlight: "Brilló en Champions League y Copa del Rey",
    videoSearchQuery: "capi+betis+goles+mejores+momentos+champions",
    stats: "Magia y gol en la era dorada",
  },
  {
    id: "finidi-george",
    name: "Finidi George",
    position: "Extremo derecho",
    years: "1996–2002",
    era: "era-dorada",
    description:
      "El nigeriano que electrizaba al Villamarín con su velocidad y desborde. Finidi llegó del Ajax como campeón de Europa y aportó clase mundial a la banda derecha bética. Su sonrisa y su fútbol alegre lo hicieron favorito de la afición.",
    highlight: "Campeón de Europa con el Ajax antes de llegar al Betis",
    videoSearchQuery: "finidi+george+betis+goles+jugadas+mejores+momentos",
    stats: "6 temporadas de magia nigeriana",
  },
  {
    id: "dani",
    name: "Dani",
    position: "Centrocampista",
    years: "1999–2003",
    era: "era-dorada",
    description:
      "Daniel García Lara, conocido como Dani, fue un centrocampista con llegada y gol que brilló en el Betis de principios de siglo. Su potencia física y su capacidad para marcar goles desde segunda línea le hicieron imprescindible en el mediocampo verdiblanco.",
    highlight: "Goles decisivos en la era dorada",
    videoSearchQuery: "dani+garcia+lara+betis+goles+mejores+momentos",
    stats: "Potencia y gol desde el mediocampo",
  },

  // ── CORAZÓN VERDIBLANCO ──────────────────────────────────────────────
  {
    id: "ruben-castro",
    name: "Rubén Castro",
    position: "Delantero",
    years: "2010–2018",
    era: "corazon-verdiblanco",
    description:
      "Máximo goleador en la historia del Real Betis Balompié. Su instinto de gol y su capacidad para aparecer en los momentos clave le convirtieron en un referente absoluto del club.",
    highlight: "Máximo goleador histórico del club",
    videoSearchQuery: "ruben+castro+betis+todos+los+goles",
    stats: "183 goles — récord absoluto del club",
  },
  {
    id: "juanito-gutierrez",
    name: "Juanito Gutiérrez",
    position: "Defensa central",
    years: "2001–2011",
    era: "corazon-verdiblanco",
    description:
      "Diez temporadas defendiendo la camiseta verdiblanca con honor. Juanito fue el ejemplo perfecto de fidelidad al club. Vivió ascensos, descensos, Champions y Copa del Rey, siempre con el escudo por delante.",
    highlight: "Una década de fidelidad al Betis",
    videoSearchQuery: "juanito+gutierrez+betis+mejores+momentos",
    quote: "Solo he querido jugar en el Betis",
    stats: "+300 partidos · 10 temporadas",
  },
  {
    id: "benat-etxebarria",
    name: "Beñat Etxebarria",
    position: "Centrocampista",
    years: "2009–2014",
    era: "corazon-verdiblanco",
    description:
      "El vasco que enamoró al Villamarín con su zurda mágica. Beñat era el director de orquesta del mediocampo: faltas magistrales, pases imposibles y una visión de juego que hacía mejor a todos sus compañeros.",
    highlight: "Zurda de oro desde el centro del campo",
    videoSearchQuery: "benat+etxebarria+betis+goles+faltas",
    stats: "Faltas magistrales y ascenso a Primera",
  },

  // ── EL NUEVO BETIS ───────────────────────────────────────────────────
  {
    id: "joaquin-sanchez",
    name: "Joaquín Sánchez",
    position: "Extremo derecho",
    years: "2000–2006, 2015–2024",
    era: "nuevo-betis",
    description:
      "El eterno capitán. Joaquín es el jugador con más partidos en la historia del Betis. Su regate, su alegría y su amor por el club lo convierten en el máximo símbolo del beticismo.",
    highlight: "Más de 500 partidos con el Betis",
    videoSearchQuery: "joaquin+sanchez+betis+mejores+momentos+goles+regates",
    quote: "Viva er Betis manque pierda",
    stats: "+500 partidos — récord histórico del club",
  },
  {
    id: "nabil-fekir",
    name: "Nabil Fekir",
    position: "Mediapunta",
    years: "2019–2023",
    era: "nuevo-betis",
    description:
      "El francés que trajo magia europea al Betis. Fekir combinaba regate, visión y gol como pocos. Pieza fundamental en la conquista de la Copa del Rey 2022 y en los mejores momentos del Betis reciente.",
    highlight: "Campeón de la Copa del Rey 2022",
    videoSearchQuery: "fekir+betis+goles+jugadas+copa+del+rey+2022",
    stats: "Copa del Rey 2022 · magia francesa",
  },
  {
    id: "sergio-canales",
    name: "Sergio Canales",
    position: "Centrocampista",
    years: "2018–2024",
    era: "nuevo-betis",
    description:
      "El jugador que encontró su hogar en el Betis. Canales fue el corazón del equipo campeón de Copa. Su entrega, calidad y liderazgo le convirtieron en uno de los jugadores más queridos de la historia reciente del club.",
    highlight: "Alma del Betis campeón de Copa 2022",
    videoSearchQuery: "canales+betis+goles+copa+del+rey+2022+mejores+momentos",
    quote: "Este escudo se lleva en el corazón",
    stats: "6 temporadas · líder del Betis moderno",
  },
  {
    id: "borja-iglesias",
    name: "Borja Iglesias",
    position: "Delantero",
    years: "2019–2024",
    era: "nuevo-betis",
    description:
      "El Panda. Borja conquistó al beticismo con su carisma y sus goles. Un delantero que se entregaba al máximo en cada partido y que vivía el Betis como un aficionado más. Ídolo moderno del Villamarín.",
    highlight: "El Panda: ídolo del beticismo moderno",
    videoSearchQuery: "borja+iglesias+panda+betis+goles+mejores+momentos",
    quote: "El Villamarín te pone los pelos de punta",
    stats: "51 goles con la verdiblanca",
  },
  {
    id: "isco-alarcon",
    name: "Isco Alarcón",
    position: "Mediapunta",
    years: "2024–presente",
    era: "nuevo-betis",
    description:
      "El mago de Benalmádena llegó al Betis tras brillar en el Real Madrid y con la selección española. Isco aporta talento puro, control exquisito y una creatividad que ilusiona al Villamarín. Un fichaje de nivel mundial para el proyecto bético.",
    highlight: "Talento de nivel mundial para el Betis",
    videoSearchQuery: "isco+alarcon+betis+goles+jugadas+mejores+momentos",
    stats: "Campeón de Europa con España y el Real Madrid",
  },
  {
    id: "youssouf-sabaly",
    name: "Youssouf Sabaly",
    position: "Lateral derecho",
    years: "2018–2024",
    era: "nuevo-betis",
    description:
      "El senegalés se ha convertido en uno de los laterales más fiables de la historia reciente del Betis. Sabaly combina potencia física, velocidad en la banda y una entrega total en cada partido. Pieza fundamental en la conquista de la Copa del Rey 2022.",
    highlight: "Campeón de la Copa del Rey 2022",
    videoSearchQuery: "sabaly+betis+mejores+momentos+copa+del+rey",
    stats: "Copa del Rey 2022 · +150 partidos",
  },
];
