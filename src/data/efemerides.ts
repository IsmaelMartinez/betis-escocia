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
  category: "titulo" | "gol" | "fichaje" | "fundacion" | "anecdota" | "europa" | "escocia";
}

/**
 * Fallbacks mensuales temáticos sobre Escocia para días sin efemérides registradas.
 * Se elige según el mes (índice 0-11).
 */
export const EFEMERIDES_FALLBACKS: Efemeride[] = [
  {
    year: 0,
    title: "Enero escocés: mes de Hogmanay y whisky caliente",
    description:
      "Enero en Escocia empieza con resaca de Hogmanay y la promesa de días más largos. El bético en Edimburgo sobrevive al frío con recuerdos del Villamarín y la esperanza del mercado de invierno. Si Escocia inventó el whisky para combatir este frío, el bético inventó el 'manque pierda' para combatir todo lo demás.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Febrero en Escocia: frío, poesía y valentía",
    description:
      "Febrero en Edimburgo es oscuro, frío y ventoso. Perfecto para reflexionar sobre la vida, el fútbol y por qué uno eligió ser del Betis. Los escoceses tienen un dicho: 'What's fur ye'll no go by ye' (lo que es para ti no te pasará de largo). Muy bético. Muy sabio.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Marzo escocés: despierta la primavera (más o menos)",
    description:
      "En Escocia, marzo significa que los días se alargan y el viento solo te tira al suelo el 80% de las veces. Los narcisos aparecen en los parques de Edimburgo como señal de esperanza. Como cuando el Betis encadena dos victorias seguidas: inesperado pero bienvenido.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Abril en Escocia: los castillos despiertan",
    description:
      "Abril trae algo parecido al buen tiempo a Escocia. Los turistas empiezan a llegar, los castillos se llenan y Arthur's Seat se llena de valientes. El bético en Edimburgo sale del hibernaje invernal y empieza a planificar dónde ver los partidos de final de temporada.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Mayo escocés: luz eterna y fin de liga",
    description:
      "En mayo, Edimburgo tiene casi 17 horas de luz. El sol no se pone hasta las 21:30. Perfecto para ver los últimos partidos de la temporada con luz natural. Los escoceses salen a pasear como si acabaran de descubrir que existe el sol. Porque básicamente es así.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Junio en Escocia: solsticio y noches blancas",
    description:
      "El solsticio de verano convierte Edimburgo en una ciudad que casi no duerme. Amanece a las 4:30 y oscurece a las 22:00. Los escoceses aprovechan cada rayo de sol como si fuera el último. Porque probablemente lo es hasta septiembre.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Julio escocés: Highland Games y pretemporada",
    description:
      "Julio en Escocia es tiempo de Highland Games, lanzamiento de tronco y gaita a todo volumen. Mientras el Betis hace pretemporada, los escoceses compiten en deportes que requieren llevar falda y lanzar objetos pesados. Cada cultura tiene sus cosas.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Agosto en Edimburgo: la ciudad se transforma",
    description:
      "Agosto es EL mes de Edimburgo. El Festival Fringe llena cada rincón de teatro, comedia y arte callejero. La ciudad triplica su población. Encontrar mesa en un pub es más difícil que encontrar entradas para un Betis-Sevilla. Y eso ya es decir.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Septiembre escocés: otoño y fase de grupos",
    description:
      "Septiembre en Escocia huele a hojas mojadas y empieza la cuenta atrás hacia el invierno. Las Highlands se tiñen de naranja y rojo. El bético en Edimburgo vuelve a la rutina con la liga en marcha y la esperanza intacta. Como cada septiembre desde 1907.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Octubre en Escocia: oscurece pero no nos rendimos",
    description:
      "El cambio de hora golpea fuerte en Escocia. A las 16:30 ya es de noche. Los escoceses no se quejan: encienden la chimenea, sirven un dram de whisky y siguen adelante. El bético en Edimburgo hace lo mismo pero con aceitunas y retransmisiones de LaLiga.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Noviembre escocés: St Andrew's se acerca",
    description:
      "Noviembre en Escocia es frío, húmedo y ventoso. O sea, noviembre normal. Pero se acerca St Andrew's Day y con él la celebración de todo lo escocés. El bético en Edimburgo ya es medio escocés a estas alturas: se queja del tiempo pero no se iría a ningún lado.",
    category: "escocia",
  },
  {
    year: 0,
    title: "Diciembre: Edimburgo se ilumina",
    description:
      "El mercadillo navideño de Edimburgo transforma la ciudad en un cuento de Dickens con luces, noria y el castillo de fondo. Hogmanay se acerca y los escoceses preparan la fiesta más grande del año. El bético brinda con cava... o con Irn-Bru. Aquí ya todo vale.",
    category: "escocia",
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

  // =====================
  // === ESCOCIA ===
  // =====================

  // === ENERO (Escocia) ===
  "01-14": [
    {
      year: 1872,
      title: "Muere Greyfriars Bobby",
      description:
        "El perrito más fiel de Edimburgo pasa a mejor vida tras 14 años vigilando la tumba de su dueño. Si un Skye Terrier puede ser así de leal, imagina un bético. Nosotros llevamos desde 1907 sin movernos del lado de nuestro equipo. Bobby nos entiende.",
      category: "escocia",
    },
  ],
  "01-19": [
    {
      year: 1736,
      title: "Nace James Watt en Greenock",
      description:
        "Nace el hombre que perfeccionó la máquina de vapor y arrancó la Revolución Industrial. Sin Watt no hay trenes, no hay fábricas, no hay modernidad. Escocia inventó el futuro, básicamente. Y el Betis lo adoptó con su estilo propio.",
      category: "escocia",
    },
  ],
  "01-25": [
    {
      year: 1759,
      title: "Nace Robert Burns en Alloway",
      description:
        "Nace el poeta nacional de Escocia. Cada 25 de enero, los escoceses cenan haggis, recitan poesía y brindan con whisky. Burns Night es como una Feria de Abril pero con más lana y menos sevillanas. Igual de intensa.",
      category: "escocia",
    },
  ],

  // === FEBRERO (Escocia) ===
  "02-08": [
    {
      year: 1587,
      title: "Ejecución de María Estuardo",
      description:
        "Mary Queen of Scots es ejecutada en el castillo de Fotheringhay. Reina de Escocia, reina de Francia, prisionera de Inglaterra. Una vida más dramática que una temporada del Betis en los 2000. Y eso es decir mucho.",
      category: "escocia",
    },
  ],

  // === MARZO (Escocia) ===
  "03-03": [
    {
      year: 1847,
      title: "Nace Alexander Graham Bell en Edimburgo",
      description:
        "En la capital escocesa nace el inventor del teléfono. Sin Bell, no podríamos llamar a casa para decir 'HEMOS GANADO' o 'hemos perdido otra vez'. Edimburgo: ciudad de inventores, poetas y ahora también de béticos.",
      category: "escocia",
    },
  ],
  "03-04": [
    {
      year: 1890,
      title: "Se inaugura el Forth Bridge",
      description:
        "Se abre al tráfico el puente ferroviario más icónico del mundo. 54.000 toneladas de acero cruzando el Firth of Forth. Una obra maestra de ingeniería victoriana que todavía funciona perfectamente. Como Joaquín, pero en puente.",
      category: "escocia",
    },
  ],
  "03-13": [
    {
      year: 1873,
      title: "Se funda la Scottish Football Association",
      description:
        "Nace la SFA, la segunda federación de fútbol más antigua del mundo. Escocia no solo inventó el golf, el whisky y la penicilina. También ayudó a inventar el fútbol moderno. Algo tenían que hacer con tanta lluvia.",
      category: "escocia",
    },
  ],
  "03-24": [
    {
      year: 1603,
      title: "Jacobo VI une las coronas de Escocia e Inglaterra",
      description:
        "Jacobo VI de Escocia se convierte en Jacobo I de Inglaterra tras la muerte de Isabel I. Un escocés en el trono inglés. Es como si un bético dirigiera el Sevilla FC. Técnicamente posible, humanamente impensable.",
      category: "escocia",
    },
  ],

  // === ABRIL (Escocia) ===
  "04-06": [
    {
      year: 1320,
      title: "Declaración de Arbroath",
      description:
        "Los nobles escoceses envían una carta al Papa declarando la independencia de Escocia. 'No es por la gloria ni por las riquezas, sino por la libertad'. Básicamente, el primer 'manque pierda' de la historia. Con latín y sellos de cera.",
      category: "escocia",
    },
  ],
  "04-16": [
    {
      year: 1746,
      title: "Batalla de Culloden",
      description:
        "La última batalla campal en suelo británico. Los jacobitas caen derrotados en 40 minutos. El fin de una era para las Highlands. Triste, heroico, inevitable. Como perder un derbi en el minuto 93. Pero con espadas.",
      category: "escocia",
    },
  ],

  // === MAYO (Escocia) ===
  "05-22": [
    {
      year: 1859,
      title: "Nace Arthur Conan Doyle en Edimburgo",
      description:
        "Nace en Edimburgo el creador de Sherlock Holmes. El detective más famoso del mundo es producto de la mente de un escocés. 'Elemental, querido Watson' nunca lo dijo Holmes, pero sí lo dice todo bético cuando le preguntan por qué sufre: es elemental.",
      category: "escocia",
    },
  ],

  // === JUNIO (Escocia) ===
  "06-05": [
    {
      year: 1723,
      title: "Nace Adam Smith en Kirkcaldy",
      description:
        "El padre de la economía moderna nace en un pueblo de Fife. Su libro 'La riqueza de las naciones' cambió el mundo. Si Smith viera el mercado de fichajes actual, probablemente escribiría un segundo tomo. Titulado 'La locura de las naciones'.",
      category: "escocia",
    },
  ],
  "06-11": [
    {
      year: 1978,
      title: "Golazo de Archie Gemmill vs Países Bajos",
      description:
        "Mundial de Argentina. Escocia 3-2 Países Bajos. Gemmill recoge el balón, se va de tres holandeses y la clava. Uno de los goles más bonitos de la historia de los Mundiales. Escocia perdió la clasificación igualmente. Muy bético todo.",
      category: "escocia",
    },
  ],
  "06-24": [
    {
      year: 1314,
      title: "Batalla de Bannockburn",
      description:
        "Robert the Bruce derrota al ejército inglés de Eduardo II en la batalla más importante de la historia escocesa. Independencia asegurada. Braveheart pero de verdad. Y sin Mel Gibson, que eso siempre es una mejora.",
      category: "escocia",
    },
  ],

  // === JULIO (Escocia) ===
  "07-05": [
    {
      year: 1996,
      title: "Nace la oveja Dolly en Edimburgo",
      description:
        "En el Instituto Roslin de Edimburgo nace el primer mamífero clonado de la historia. Dolly la oveja. Escocia clonó una oveja antes de que nadie supiera qué era clonar. Si pudieran clonar a Joaquín, el Betis lo habría pedido primero.",
      category: "escocia",
    },
  ],

  // === AGOSTO (Escocia) ===
  "08-13": [
    {
      year: 1947,
      title: "Primer Festival de Edimburgo",
      description:
        "Comienza el Edinburgh International Festival, que convertiría la ciudad en la capital mundial de las artes cada agosto. Teatro, música, comedia. Edimburgo en agosto es como Sevilla en Feria pero con impermeables y más Shakespeare.",
      category: "escocia",
    },
  ],
  "08-25": [
    {
      year: 1930,
      title: "Nace Sean Connery en Edimburgo",
      description:
        "En Fountainbridge, Edimburgo, nace Thomas Sean Connery. El mejor James Bond. El mejor escocés del cine. El hombre que demostró que se puede ser de Edimburgo y tener más estilo que toda una ciudad entera. Shaken, not shtirred.",
      category: "escocia",
    },
  ],

  // === SEPTIEMBRE (Escocia) ===
  "09-04": [
    {
      year: 1964,
      title: "Se inaugura el Forth Road Bridge",
      description:
        "Se abre el puente colgante sobre el Firth of Forth, complementando al puente ferroviario de 1890. Dos puentes icónicos uno al lado del otro. Escocia y sus puentes: conectando orillas desde siempre. Como el Betis conecta Sevilla con Edimburgo.",
      category: "escocia",
    },
  ],
  "09-09": [
    {
      year: 1513,
      title: "Batalla de Flodden",
      description:
        "La peor derrota militar de Escocia. El rey Jacobo IV muere junto a miles de escoceses enfrentándose a Inglaterra. Un desastre absoluto. Escocia perdió su rey, su ejército y su optimismo. Lo recuperaron todo. Son escoceses. Son casi béticos.",
      category: "escocia",
    },
  ],
  "09-18": [
    {
      year: 2014,
      title: "Referéndum de independencia de Escocia",
      description:
        "Escocia vota sobre su independencia del Reino Unido. 55% dice no, 45% dice sí. Un país dividido pero democrático. La noche más larga en Edimburgo desde... bueno, desde cualquier noche de invierno en Edimburgo, que aquí oscurece a las 15:30.",
      category: "escocia",
    },
  ],

  // === OCTUBRE (Escocia) ===
  "10-09": [
    {
      year: 2004,
      title: "Se inaugura el Parlamento escocés en Holyrood",
      description:
        "El edificio del Parlamento escocés abre sus puertas en Holyrood, Edimburgo. Diseñado por Enric Miralles, un catalán. Un catalán diseñando el símbolo de la democracia escocesa. La globalización tiene cosas bonitas.",
      category: "escocia",
    },
  ],
  "10-31": [
    {
      year: 0,
      title: "Samhain: Halloween nació en Escocia",
      description:
        "La fiesta de Halloween tiene raíces en el festival gaélico de Samhain, celebrado en Escocia e Irlanda. Robert Burns le dedicó un poema en 1785. Antes de que los americanos lo llenaran de caramelos, los escoceses ya se disfrazaban. Con más frío y más dignidad.",
      category: "escocia",
    },
  ],

  // === NOVIEMBRE (Escocia) ===
  "11-30": [
    {
      year: 1872,
      title: "St Andrew's Day y el primer partido internacional de fútbol",
      description:
        "Día nacional de Escocia, San Andrés. Y en 1872, Escocia e Inglaterra juegan el PRIMER partido internacional de fútbol de la historia en Glasgow. Empate 0-0. Así empezó todo. Sin VAR, sin césped artificial, sin excusas. Fútbol puro.",
      category: "escocia",
    },
  ],

  // === DICIEMBRE (Escocia) ===
  "12-06": [
    {
      year: 1768,
      title: "Primera edición de la Encyclopaedia Britannica en Edimburgo",
      description:
        "Se publica en Edimburgo la primera enciclopedia moderna. Todo el saber humano en tres volúmenes. Los escoceses no solo inventaron cosas: las documentaron, las explicaron y las vendieron. El marketing también se inventó aquí, probablemente.",
      category: "escocia",
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

  // Fallback: show Scotland-themed content for the current month
  return [EFEMERIDES_FALLBACKS[date.getMonth()]];
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
    escocia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
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
    escocia: "Escocia",
  };
  return labels[category];
}
