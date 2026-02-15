/**
 * Efemérides del Real Betis Balompié
 *
 * Datos históricos con comentarios estilo La Hora Chanante:
 * dramáticos, absurdos, irreverentes y siempre béticos.
 *
 * Formato: clave "MM-DD" → array de eventos para ese día.
 */

export interface Efemeride {
  /** Año del evento */
  year: number;
  /** Título corto del evento */
  title: string;
  /** Descripción chanante del evento */
  description: string;
  /** Categoría temática */
  category: "titulo" | "gol" | "fichaje" | "fundacion" | "anecdota" | "europa";
}

/**
 * Fallbacks chanantes para días sin efemérides registradas.
 * Se elige uno aleatoriamente.
 */
export const EFEMERIDES_FALLBACKS: Efemeride[] = [
  {
    year: 0,
    title: "Día de reflexión bética",
    description:
      "No consta ninguna efeméride oficial para hoy, pero seguro que algún bético en algún lugar del mundo está llorando de emoción recordando aquel gol de Oliveira. O simplemente llorando. Somos del Betis, lo normal.",
    category: "anecdota",
  },
  {
    year: 0,
    title: "El Betis descansó (el Betis nunca descansa)",
    description:
      "La historia no registra nada bético para hoy. Imposible. Probablemente se perdió el documento en alguna mudanza del Villamarín. O se lo comió una cabra. En cualquier caso, hoy es un buen día para ser del Betis. Como todos.",
    category: "anecdota",
  },
  {
    year: 0,
    title: "Jornada de manque pierda",
    description:
      "No hay efeméride para hoy, pero eso no significa que no pasara nada. Significa que el cronista oficial estaba en el bar celebrando algo. O ahogando penas. Con el Betis nunca se sabe, pero siempre se siente.",
    category: "anecdota",
  },
];

/** Mapa de efemérides indexado por "MM-DD" */
export const EFEMERIDES: Record<string, Efemeride[]> = {
  // === ENERO ===
  "01-01": [
    {
      year: 2023,
      title: "Año nuevo, vida bética",
      description:
        "Empezamos el año como campeones de Copa. Mientras el resto de España se recuperaba de las uvas, los béticos seguíamos celebrando. Llevábamos desde abril. No pensábamos parar.",
      category: "titulo",
    },
  ],
  "01-12": [
    {
      year: 1993,
      title: "Nace Dani Ceballos",
      description:
        "En Utrera nace un niño que de mayor haría cosas ilegales con un balón. Bueno, legales pero que deberían ser ilegales por lo bonitas. Canterano, campeón, leyenda. En ese orden.",
      category: "anecdota",
    },
  ],
  "01-18": [
    {
      year: 2019,
      title: "Lo Celso la lía en el Camp Nou",
      description:
        "Giovani Lo Celso decide que el Camp Nou es su jardín particular y marca un golazo que deja a Piqué buscando su dignidad por el área. Noche mágica en Barcelona, cosa que no se dice todos los días si eres del Betis.",
      category: "gol",
    },
  ],

  // === FEBRERO ===
  "02-10": [
    {
      year: 2007,
      title: "Betis 3-2 Celta en el Villamarín",
      description:
        "Remontada de las que quitan años de vida. El Villamarín rugía tanto que se oyó en Triana. Dicen que un señor de Nervión se quejó del ruido. Se le invitó amablemente a mudarse.",
      category: "gol",
    },
  ],
  "02-15": [
    {
      year: 1941,
      title: "Un día cualquiera en el Betis de posguerra",
      description:
        "El Betis seguía existiendo contra todo pronóstico. Como siempre. La historia del Betis es básicamente un ejercicio de supervivencia con toques de arte. Como cocinar con lo que hay en la nevera pero que salga un plato estrella Michelin.",
      category: "anecdota",
    },
  ],
  "02-21": [
    {
      year: 2018,
      title: "Betis 3-5 Barcelona (sí, perdimos, pero...)",
      description:
        "Messi marca un hat-trick y el Villamarín le aplaude de pie. ¿Masoquismo? No. Señorío. El bético reconoce el arte aunque le duela. Luego fuimos a casa llorando, pero con clase. MUCHA clase.",
      category: "anecdota",
    },
  ],

  // === MARZO ===
  "03-12": [
    {
      year: 2022,
      title: "Fekir golazo contra la Real Sociedad",
      description:
        "Nabil Fekir decide que la física es una sugerencia y mete un gol desde fuera del área que aún está entrando. El portero rival todavía sigue mirando al cielo preguntándose qué ha pasado.",
      category: "gol",
    },
  ],
  "03-17": [
    {
      year: 1935,
      title: "El Betis campeón de Liga",
      description:
        "EL BETIS CAMPEÓN DE LIGA. Sí, de LIGA. Primera división. La buena. Con 15 plantilla y menos presupuesto que el catering del Madrid. Hazaña irrepetible. Literalmente, llevamos 90 años intentando repetirla.",
      category: "titulo",
    },
  ],

  // === ABRIL ===
  "04-08": [
    {
      year: 1928,
      title: "Se funda oficialmente la Liga española",
      description:
        "Nace la Liga y el Betis ya estaba ahí, fundador como el que más. Mientras otros equipos presumían de dinero, nosotros presumíamos de corazón. No ha cambiado mucho la cosa, la verdad.",
      category: "fundacion",
    },
  ],
  "04-23": [
    {
      year: 2005,
      title: "Betis en semifinales de Copa de la UEFA",
      description:
        "El Betis en semifinales europeas. SEMI-FI-NA-LES. Suena a ciencia ficción, pero pasó. Toda Sevilla verdecía. La otra mitad de Sevilla no se lo creía. Nosotros tampoco, pero ahí estábamos. GLORIOSO.",
      category: "europa",
    },
    {
      year: 2022,
      title: "BETIS CAMPEÓN DE COPA DEL REY",
      description:
        "Penaltis contra el Valencia. Cada penalti, un infarto. Cada gol, una resurrección. Claudio Bravo para el último y el universo entero se tiñe de verde. 17 AÑOS ESPERANDO. Se acabó. CAMPEONEEEES. Llora, ríe, abraza a un desconocido. Todo vale. TODO.",
      category: "titulo",
    },
  ],

  // === MAYO ===
  "05-12": [
    {
      year: 2019,
      title: "Joaquín hat-trick con 37 años",
      description:
        "Joaquín, con 37 primaveras a cuestas, le mete TRES goles al Athletic. El hombre que desafía al tiempo, a la lógica y a la ciencia. En Portoví hay una estatua suya. En nuestros corazones también.",
      category: "gol",
    },
  ],
  "05-28": [
    {
      year: 2005,
      title: "Betis gana la Copa del Rey en el Calderón",
      description:
        "Gol de Dani en el minuto 37. Betis 2-1 Osasuna. Madrid se tiñe de verde. Un bético cualquiera llora en la grada. Otro llora en su casa. Otro llora en el bar. Básicamente, toda Sevilla llorando de alegría. Menos la mitad, que lloraba de rabia.",
      category: "titulo",
    },
  ],

  // === JUNIO ===
  "06-01": [
    {
      year: 2015,
      title: "El Betis vuelve a Primera",
      description:
        "Ascenso a Primera División. Volvemos. Como el Ave Fénix pero en verdiblanco y con más arte. Segunda División fue un viaje formativo. Como un Erasmus pero con más sufrimiento y peores ciudades.",
      category: "anecdota",
    },
  ],
  "06-10": [
    {
      year: 2003,
      title: "El Betis ficha a Ricardo Oliveira",
      description:
        "Llega el brasileño que haría llorar a las defensas de media Europa. Oliveira: velocidad, potencia, gol. Y un caño al defensa del Sevilla que debería estar en el Museo del Prado.",
      category: "fichaje",
    },
  ],

  // === JULIO ===
  "07-01": [
    {
      year: 2020,
      title: "Fichaje de Nabil Fekir",
      description:
        "Fekir firma por el Betis y medio Liverpool llora. El mago francés elige Sevilla por el sol, las tapas y el proyecto deportivo. Bueno, sobre todo por el sol y las tapas, seamos honestos.",
      category: "fichaje",
    },
  ],
  "07-12": [
    {
      year: 1914,
      title: "Nace el Betis Foot-Ball Club",
      description:
        "Unos jóvenes de Sevilla deciden fundar un club de fútbol. Eligen el verde. Buena elección. Eligen Betis, por el río. Mejor elección aún. No sabían que estaban creando una religión. Con sus milagros, sus mártires y sus procesiones.",
      category: "fundacion",
    },
  ],

  // === AGOSTO ===
  "08-15": [
    {
      year: 2021,
      title: "Arranca la temporada de Pellegrini",
      description:
        "El Ingeniero empieza a construir algo grande. Nadie lo sabía todavía. Bueno, él sí. El hombre tiene un plan y una cara de póker que ya la quisiera el Casino de Montecarlo.",
      category: "anecdota",
    },
  ],

  // === SEPTIEMBRE ===
  "09-12": [
    {
      year: 1907,
      title: "Se funda el Sevilla Balompié",
      description:
        "Nace la semilla de lo que luego sería el REAL Betis Balompié. Estudiantes sevillanos con un balón y un sueño. El sueño sigue vivo 117 años después. Un poco maltrecho a veces, pero vivito y coleando.",
      category: "fundacion",
    },
  ],
  "09-17": [
    {
      year: 2022,
      title: "Betis 1-0 Ludogorets (Europa League)",
      description:
        "Victoria europea en el Villamarín con el himno sonando. Si no se te pone la piel de gallina con el himno del Betis a las 21:00 un jueves europeo, consulta a su médico. Puede que no tenga pulso.",
      category: "europa",
    },
  ],

  // === OCTUBRE ===
  "10-03": [
    {
      year: 2019,
      title: "Derbi Betis 1-2 Sevilla (pero jugamos mejor)",
      description:
        "Perdimos el derbi pero jugamos mejor. Frase que todo bético ha dicho al menos 47 veces en su vida. A veces es verdad. A veces es mecanismo de defensa. Hoy era verdad. Probablemente.",
      category: "anecdota",
    },
  ],
  "10-15": [
    {
      year: 2002,
      title: "Denilson dribla a medio equipo rival",
      description:
        "Denilson, el fichaje más caro del mundo en su momento, decide demostrar por qué. Se va de cinco rivales, se sienta en la pelota (metafóricamente) y el Villamarín pierde la cabeza. Momento brasileño puro.",
      category: "gol",
    },
  ],

  // === NOVIEMBRE ===
  "11-07": [
    {
      year: 2004,
      title: "Betis debuta en Champions League",
      description:
        "El Betis. En la Champions. LEAGUE. Con el himno ese y todo. Salimos al campo y durante un segundo pensamos: '¿Esto es real?'. Era real. Tan real como el sufrimiento posterior. Pero ESE MOMENTO. Ese momento fue eterno.",
      category: "europa",
    },
  ],
  "11-20": [
    {
      year: 1997,
      title: "Llega Denilson al Betis",
      description:
        "El fichaje más caro del mundo aterriza en Sevilla. DENILSON. En el BETIS. El mundo flipaba. Nosotros flipábamos. Denilson probablemente también flipaba viendo el vestuario. Pero oye, historia del fútbol mundial.",
      category: "fichaje",
    },
  ],

  // === DICIEMBRE ===
  "12-09": [
    {
      year: 2021,
      title: "Betis golea al Valencia 4-1",
      description:
        "Pellegrini-ball en estado puro. Cuatro goles al Valencia con un fútbol que debería ser patrimonio de la humanidad. La UNESCO fue informada pero no contestó. Su pérdida.",
      category: "gol",
    },
  ],
  "12-14": [
    {
      year: 2003,
      title: "Betis gana al Kaiserslautern en UEFA",
      description:
        "Victoria en Alemania. El Betis gana en Alemania. Suena raro, ¿verdad? Pero pasó. Los alemanes no entendían nada. Normal, es difícil entender al Betis. Hasta para nosotros.",
      category: "europa",
    },
  ],
  "12-22": [
    {
      year: 2002,
      title: "Derbi Betis 2-0 Sevilla en Villamarín",
      description:
        "Derbi nuestro. 2-0. Feliz Navidad. Mejor regalo imposible. Los villancicos sonaban mejor ese año. Todo sabía mejor. El turrón, el polvorón, las lágrimas del vecino sevillista. Todo.",
      category: "anecdota",
    },
  ],

  // Extra dates to cover more of the calendar
  "01-28": [
    {
      year: 2017,
      title: "Joaquín cumple 600 partidos oficiales",
      description:
        "Seiscientos partidos. SEISCIENTOS. Este hombre tiene más partidos que la mayoría de futbolistas tiene excusas. Joaquín no es un jugador, es un fenómeno meteorológico. Como el Niño, pero de Portoví.",
      category: "anecdota",
    },
  ],
  "02-05": [
    {
      year: 2023,
      title: "Betis en Europa desafiando las estadísticas",
      description:
        "Otro jueves europeo. Otro viaje imposible. Otro bético pidiendo el día libre en el trabajo 'por motivos familiares'. Técnicamente cierto: el Betis ES familia.",
      category: "europa",
    },
  ],
  "03-05": [
    {
      year: 2000,
      title: "Finidi George ilumina el Villamarín",
      description:
        "El nigeriano hace una jugada que viola varias leyes de la física y alguna ordenanza municipal. Finidi vino del Ajax trayendo fútbol total y se encontró con fútbol total... mente loco. Encajó perfecto.",
      category: "gol",
    },
  ],
  "04-15": [
    {
      year: 2023,
      title: "Betis celebra el aniversario de la Copa 2022",
      description:
        "Casi un año de la Copa. ¿Hemos parado de celebrar? No. ¿Pensamos parar? Tampoco. El bético tiene una capacidad de celebración continua que asombra a científicos de todo el mundo.",
      category: "titulo",
    },
  ],
  "05-01": [
    {
      year: 2004,
      title: "El Betis cierra plaza Champions",
      description:
        "Cuartos en Liga. Clasificados para la Champions League. ¿El Betis? ¿En la Champions? Pellízquenme. No, espera, no me pellizquen que es verdad y no quiero despertarme.",
      category: "europa",
    },
  ],
  "06-25": [
    {
      year: 2018,
      title: "Quique Setién firma con el Betis",
      description:
        "Llega el hombre que juega al fútbol como si fuera ajedrez. Posesión, toque, posesión, toque. A veces hasta metíamos gol. Revolucionario. Setién convirtió el Betis en una experiencia filosófica con balón.",
      category: "fichaje",
    },
  ],
  "07-25": [
    {
      year: 2019,
      title: "Borja Iglesias ficha por el Betis",
      description:
        "El Panda llega a Heliópolis. Un delantero que celebra los goles como si le sorprendieran a él mismo. Pura humildad goleadora. El panda más querido de Sevilla, y mira que el zoo está cerca.",
      category: "fichaje",
    },
  ],
  "08-01": [
    {
      year: 2017,
      title: "Empieza la pretemporada",
      description:
        "Comienza la ilusión anual del bético. 'Este año sí'. Frase que se repite desde 1935. A veces sale bien (2005, 2022). A veces no tanto (el resto). Pero la ilusión es INNEGOCIABLE.",
      category: "anecdota",
    },
  ],
  "09-01": [
    {
      year: 2020,
      title: "Cierre de mercado de fichajes",
      description:
        "Se cierra el mercado y el bético comprueba nerviosamente si han vendido a alguien importante. Ritual anual. Como mirar debajo de la cama de niño, pero con traspasos millonarios y más miedo.",
      category: "fichaje",
    },
  ],
  "10-28": [
    {
      year: 2011,
      title: "Beñat Etxebarría marca de falta directa",
      description:
        "Beñat y las faltas. Una historia de amor. El balón subía, bajaba, giraba y entraba. El portero aplaudía (por dentro). La física lloraba. Beñat sonreía. Magia pura en el pie izquierdo de un vasco que se hizo bético de corazón.",
      category: "gol",
    },
  ],
  "11-15": [
    {
      year: 2014,
      title: "Jorge Molina golea en Segunda",
      description:
        "Jorge Molina no entiende de categorías. Mete goles en Primera, en Segunda, probablemente los metería en una pachanga de veteranos. El hombre es una máquina de marcar con patas. Leyenda infravalorada.",
      category: "gol",
    },
  ],
  "12-01": [
    {
      year: 2005,
      title: "Betis sobrevive en Champions",
      description:
        "Fase de grupos de Champions. El Betis sufre, pero está ahí. ESTÁ AHÍ. En la élite europea. Con los grandes. Sufriendo como siempre, sí, pero con Champions League de fondo. El sufrimiento premium.",
      category: "europa",
    },
  ],
};

/**
 * Obtiene las efemérides para una fecha concreta.
 * @param date - Fecha para buscar (por defecto, hoy)
 * @returns Array de efemérides para ese día, o un fallback chanante
 */
export function getEfemeridesForDate(date: Date = new Date()): Efemeride[] {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${month}-${day}`;

  const events = EFEMERIDES[key];
  if (events && events.length > 0) {
    return events;
  }

  // Fallback: pick a "random" one based on the day of year for consistency
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const fallbackIndex = dayOfYear % EFEMERIDES_FALLBACKS.length;
  return [EFEMERIDES_FALLBACKS[fallbackIndex]];
}

/**
 * Emoji para cada categoría de efeméride
 */
export function getCategoryEmoji(category: Efemeride["category"]): string {
  const emojis: Record<Efemeride["category"], string> = {
    titulo: "🏆",
    gol: "⚽",
    fichaje: "✍️",
    fundacion: "🏛️",
    anecdota: "📖",
    europa: "🌍",
  };
  return emojis[category];
}

/**
 * Etiqueta para cada categoría
 */
export function getCategoryLabel(category: Efemeride["category"]): string {
  const labels: Record<Efemeride["category"], string> = {
    titulo: "Título",
    gol: "Golazo",
    fichaje: "Fichaje",
    fundacion: "Fundación",
    anecdota: "Bético",
    europa: "Europa",
  };
  return labels[category];
}
