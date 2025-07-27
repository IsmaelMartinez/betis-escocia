#!/usr/bin/env tsx

/**
 * Script to update trivia questions and answers
 * Removes all existing trivia data and populates with new questions
 * 
 * Usage:
 * npm run update-trivia
 * or
 * npx tsx scripts/update-trivia-questions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface TriviaQuestion {
  questionText: string;
  category: 'betis' | 'scotland';
  difficulty: 'easy' | 'medium' | 'hard';
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
}

// All trivia questions with answers
const triviaQuestions: TriviaQuestion[] = [
  // Real Betis Questions (1-30)
  {
    questionText: "¿En qué estadio juega como local el Real Betis Balompié? / In which stadium does Real Betis play its home matches?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Camp Nou", isCorrect: false },
      { text: "Santiago Bernabéu", isCorrect: false },
      { text: "Benito Villamarín", isCorrect: true },
      { text: "Mestalla", isCorrect: false }
    ]
  },
  {
    questionText: "¿En qué ciudad está ubicado el club? / In which city is the club based?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Madrid", isCorrect: false },
      { text: "Valencia", isCorrect: false },
      { text: "Vigo", isCorrect: false },
      { text: "Sevilla", isCorrect: true }
    ]
  },
  {
    questionText: "Año de fundación oficial / Official founding year?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "1899", isCorrect: false },
      { text: "1907", isCorrect: true },
      { text: "1913", isCorrect: false },
      { text: "1920", isCorrect: false }
    ]
  },
  {
    questionText: "Apodo popular / Popular nickname?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Los Colchoneros", isCorrect: false },
      { text: "Los Nazaríes", isCorrect: false },
      { text: "Los Verdiblancos", isCorrect: true },
      { text: "Los Leones", isCorrect: false }
    ]
  },
  {
    questionText: "Colores tradicionales / Traditional colours?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Azul-blanco", isCorrect: false },
      { text: "Verde-blanco", isCorrect: true },
      { text: "Rojo-blanco", isCorrect: false },
      { text: "Amarillo-negro", isCorrect: false }
    ]
  },
  {
    questionText: "El lema \"¡Viva el Betis manque pierda!\" significa… / The motto means…",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "¡Viva el Betis aunque pierda! / Long live Betis even if they lose!", isCorrect: true },
      { text: "El Betis nunca pierde / Betis never loses", isCorrect: false },
      { text: "Solo vale ganar / Only winning matters", isCorrect: false },
      { text: "Corazón verde / Green heart", isCorrect: false }
    ]
  },
  {
    questionText: "Único título liguero: temporada / Only Liga title season?",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "1928-29", isCorrect: false },
      { text: "1934-35", isCorrect: true },
      { text: "1951-52", isCorrect: false },
      { text: "1977-78", isCorrect: false }
    ]
  },
  {
    questionText: "Última Copa del Rey ganada (año) / Most recent Copa win (year)?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "2019", isCorrect: false },
      { text: "2020", isCorrect: false },
      { text: "2021", isCorrect: false },
      { text: "2022", isCorrect: true }
    ]
  },
  {
    questionText: "Entrenador 2025-26 / Head-coach 2025-26?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Xavi Hernández", isCorrect: false },
      { text: "Manuel Pellegrini", isCorrect: true },
      { text: "Diego Alonso", isCorrect: false },
      { text: "Quique Setién", isCorrect: false }
    ]
  },
  {
    questionText: "Aforo aproximado del Benito Villamarín / Stadium capacity?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "48,000", isCorrect: false },
      { text: "55,000", isCorrect: false },
      { text: "≈ 60,720", isCorrect: true },
      { text: "75,000", isCorrect: false }
    ]
  },
  {
    questionText: "Rival en el \"Gran Derbi\" / Opponent in \"El Gran Derbi\"?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Málaga", isCorrect: false },
      { text: "Cádiz", isCorrect: false },
      { text: "Granada", isCorrect: false },
      { text: "Sevilla FC", isCorrect: true }
    ]
  },
  {
    questionText: "Centro de entrenamiento principal / Main training ground?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Valdebebas", isCorrect: false },
      { text: "La Masia", isCorrect: false },
      { text: "Tajonar", isCorrect: false },
      { text: "Ciudad Deportiva Luis del Sol", isCorrect: true }
    ]
  },
  {
    questionText: "Autor del penalti decisivo en 2022 / Scorer of decisive 2022 penalty?",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Borja Iglesias", isCorrect: false },
      { text: "Sergio Canales", isCorrect: false },
      { text: "Juan Miranda", isCorrect: true },
      { text: "Nabil Fekir", isCorrect: false }
    ]
  },
  {
    questionText: "Rival en la final de Copa 2022 / Cup-final opponent 2022?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Real Madrid", isCorrect: false },
      { text: "Barcelona", isCorrect: false },
      { text: "Valencia CF", isCorrect: true },
      { text: "Athletic Club", isCorrect: false }
    ]
  },
  {
    questionText: "Presidente del Betis en 2025 / Club president in 2025?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "José Castro", isCorrect: false },
      { text: "Florentino Pérez", isCorrect: false },
      { text: "Peter Lim", isCorrect: false },
      { text: "Ángel Haro", isCorrect: true }
    ]
  },
  {
    questionText: "Nombre del filial / Reserve-team name?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Betis Juvenil", isCorrect: false },
      { text: "Betis Atlético", isCorrect: false },
      { text: "Betis Deportivo", isCorrect: true },
      { text: "Betis C", isCorrect: false }
    ]
  },
  {
    questionText: "Apodo alternativo \"Los _________\" / Alternate nickname \"Los _________\"?",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Culés", isCorrect: false },
      { text: "Heliopolitanos", isCorrect: true },
      { text: "Nazaríes", isCorrect: false },
      { text: "Periquitos", isCorrect: false }
    ]
  },
  {
    questionText: "Jugador que marcó el primer gol en la final de Copa 2022 / First goal-scorer in 2022 final?",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Borja Iglesias", isCorrect: true },
      { text: "Germán Pezzella", isCorrect: false },
      { text: "Guido Rodríguez", isCorrect: false },
      { text: "Hugo Duro", isCorrect: false }
    ]
  },
  {
    questionText: "¿Qué club escocés inspiró los colores verdiblancos? / Which Scottish club inspired the green-and-white colours?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Rangers", isCorrect: false },
      { text: "Hearts", isCorrect: false },
      { text: "Aberdeen", isCorrect: false },
      { text: "Celtic FC", isCorrect: true }
    ]
  },
  {
    questionText: "¿En qué competición debutó el Betis en fase de grupos 2005-06? / Betis 2005-06 group-stage debut was in…",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Copa de la UEFA", isCorrect: false },
      { text: "Europa Conference", isCorrect: false },
      { text: "UEFA Champions League", isCorrect: true },
      { text: "Recopa", isCorrect: false }
    ]
  },
  {
    questionText: "El himno \"Soy del Betis, soy feliz\" se interpreta normalmente por… / Anthem \"Soy del Betis, soy feliz\" is usually sung by…",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Cantores de Híspalis", isCorrect: false },
      { text: "Los del Río", isCorrect: true },
      { text: "Estopa", isCorrect: false },
      { text: "Los Chichos", isCorrect: false }
    ]
  },
  {
    questionText: "¿Qué jugador emblemático se retiró en 2023 con 622 partidos en el club? / Which legend retired in 2023 with 622 Betis games?",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Rubén Castro", isCorrect: false },
      { text: "Joaquín Sánchez", isCorrect: true },
      { text: "Denilson", isCorrect: false },
      { text: "Dani Ceballos", isCorrect: false }
    ]
  },
  {
    questionText: "Real Betis ganó la Copa del Rey de 1977 en… / Betis won the 1977 Cup in…",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Vicente Calderón", isCorrect: false },
      { text: "Santiago Bernabéu", isCorrect: true },
      { text: "La Cartuja", isCorrect: false },
      { text: "Mestalla", isCorrect: false }
    ]
  },
  {
    questionText: "El aeropuerto más cercano al estadio es… / Nearest airport to the stadium:",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Málaga-Costa del Sol", isCorrect: false },
      { text: "Jerez", isCorrect: false },
      { text: "Granada", isCorrect: false },
      { text: "Sevilla-San Pablo", isCorrect: true }
    ]
  },
  {
    questionText: "¿Cuál es el símbolo que figura en la parte superior del escudo del Betis? / Which crown-topped symbol sits atop the Betis crest?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "León", isCorrect: false },
      { text: "Murciélago", isCorrect: false },
      { text: "Corona real (Royal crown)", isCorrect: true },
      { text: "Águila", isCorrect: false }
    ]
  },
  {
    questionText: "Betis Féminas compite en la… / Betis Féminas plays in…",
    category: "betis",
    difficulty: "easy",
    answers: [
      { text: "Liga F (Primera División femenina)", isCorrect: true },
      { text: "Serie A", isCorrect: false },
      { text: "Frauen-Bundesliga", isCorrect: false },
      { text: "NWSL", isCorrect: false }
    ]
  },
  {
    questionText: "¿En qué barrio sevillano se ubica el Benito Villamarín? / The stadium is in which Seville quarter?",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "Triana", isCorrect: false },
      { text: "Nervión", isCorrect: false },
      { text: "Heliópolis", isCorrect: true },
      { text: "Macarena", isCorrect: false }
    ]
  },
  {
    questionText: "Primer jugador bético en marcar en Champions (2005) fue… / First Betis scorer in UCL (2005)?",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Edu", isCorrect: false },
      { text: "Ricardo Oliveira", isCorrect: true },
      { text: "Capi", isCorrect: false },
      { text: "Juanito", isCorrect: false }
    ]
  },
  {
    questionText: "¿Cuál era el nombre original del estadio inaugurado en 1929? / Original 1929 stadium name?",
    category: "betis",
    difficulty: "hard",
    answers: [
      { text: "Estadio Heliópolis", isCorrect: false },
      { text: "Estadio de la Exposición", isCorrect: true },
      { text: "Estadio Sevilla 92", isCorrect: false },
      { text: "Estadio Andalucía", isCorrect: false }
    ]
  },
  {
    questionText: "Betis descendió por última vez (antes de 2025) en… / Betis last relegated (pre-2025) in season…",
    category: "betis",
    difficulty: "medium",
    answers: [
      { text: "2008-09", isCorrect: false },
      { text: "2013-14", isCorrect: true },
      { text: "2016-17", isCorrect: false },
      { text: "2018-19", isCorrect: false }
    ]
  },

  // Scotland Questions (31-55)
  {
    questionText: "Capital de Escocia / Capital of Scotland?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Glasgow", isCorrect: false },
      { text: "Aberdeen", isCorrect: false },
      { text: "Dundee", isCorrect: false },
      { text: "Edimburgo / Edinburgh", isCorrect: true }
    ]
  },
  {
    questionText: "Montaña más alta / Highest mountain?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Ben Macdui", isCorrect: false },
      { text: "Schiehallion", isCorrect: false },
      { text: "Ben Nevis", isCorrect: true },
      { text: "Cairn Gorm", isCorrect: false }
    ]
  },
  {
    questionText: "Altura aproximada de Ben Nevis / Approximate height (m)?",
    category: "scotland",
    difficulty: "hard",
    answers: [
      { text: "978", isCorrect: false },
      { text: "1,095", isCorrect: false },
      { text: "1,345", isCorrect: true },
      { text: "1,760", isCorrect: false }
    ]
  },
  {
    questionText: "Santo patrón / Patron saint?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "St George", isCorrect: false },
      { text: "St Andrew", isCorrect: true },
      { text: "St David", isCorrect: false },
      { text: "St Patrick", isCorrect: false }
    ]
  },
  {
    questionText: "Animal nacional / National animal?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "León", isCorrect: false },
      { text: "Ciervo", isCorrect: false },
      { text: "Unicornio / Unicorn", isCorrect: true },
      { text: "Dragón", isCorrect: false }
    ]
  },
  {
    questionText: "Nombre de la bandera / Scottish flag name?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Union Jack", isCorrect: false },
      { text: "Cross of St George", isCorrect: false },
      { text: "Dragon Banner", isCorrect: false },
      { text: "Saltire / St Andrew's Cross", isCorrect: true }
    ]
  },
  {
    questionText: "Flor nacional / National flower?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Rosa", isCorrect: false },
      { text: "Narciso", isCorrect: false },
      { text: "Cardo / Thistle", isCorrect: true },
      { text: "Lirio", isCorrect: false }
    ]
  },
  {
    questionText: "Lago famoso por un monstruo / Loch famous for a monster?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Lomond", isCorrect: false },
      { text: "Ness", isCorrect: true },
      { text: "Tay", isCorrect: false },
      { text: "Katrine", isCorrect: false }
    ]
  },
  {
    questionText: "¿En qué año se firmó el Acta de Unión? / Act of Union year?",
    category: "scotland",
    difficulty: "hard",
    answers: [
      { text: "1603", isCorrect: false },
      { text: "1688", isCorrect: false },
      { text: "1707", isCorrect: true },
      { text: "1801", isCorrect: false }
    ]
  },
  {
    questionText: "Instrumento nacional / National instrument?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Gaita irlandesa", isCorrect: false },
      { text: "Acordeón", isCorrect: false },
      { text: "Gaita escocesa / Great Highland bagpipe", isCorrect: true },
      { text: "Harpa", isCorrect: false }
    ]
  },
  {
    questionText: "Primer Ministro de Escocia en 2025 / First Minister in 2025?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Humza Yousaf", isCorrect: false },
      { text: "Nicola Sturgeon", isCorrect: false },
      { text: "Kate Forbes", isCorrect: false },
      { text: "John Swinney", isCorrect: true }
    ]
  },
  {
    questionText: "Moneda oficial / Official currency?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Euro", isCorrect: false },
      { text: "Scottish dollar", isCorrect: false },
      { text: "Libra esterlina / Pound sterling", isCorrect: true },
      { text: "Krona", isCorrect: false }
    ]
  },
  {
    questionText: "Universidad más antigua (1413) / Oldest university (1413)?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Glasgow", isCorrect: false },
      { text: "Edinburgh", isCorrect: false },
      { text: "Aberdeen", isCorrect: false },
      { text: "St Andrews", isCorrect: true }
    ]
  },
  {
    questionText: "Ciudad reconocida como \"cuna del golf\" / \"Home of golf\"?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Troon", isCorrect: false },
      { text: "St Andrews", isCorrect: true },
      { text: "Nairn", isCorrect: false },
      { text: "Carnoustie", isCorrect: false }
    ]
  },
  {
    questionText: "Poeta nacional (\"Auld Lang Syne\") / National poet?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Sir Walter Scott", isCorrect: false },
      { text: "Robert Louis Stevenson", isCorrect: false },
      { text: "Robert Burns", isCorrect: true },
      { text: "Hugh MacDiarmid", isCorrect: false }
    ]
  },
  {
    questionText: "Plato tradicional de asaduras y avena / Traditional offal dish?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Cullen skink", isCorrect: false },
      { text: "Cranachan", isCorrect: false },
      { text: "Haggis", isCorrect: true },
      { text: "Bannocks", isCorrect: false }
    ]
  },
  {
    questionText: "Bebida espirituosa protegida por ley (mín. 3 años) / Spirit matured min. 3 yrs?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Vodka", isCorrect: false },
      { text: "Gin", isCorrect: false },
      { text: "Scotch whisky", isCorrect: true },
      { text: "Brandy", isCorrect: false }
    ]
  },
  {
    questionText: "Festival de artes más grande del mundo (agosto) / World's largest arts festival?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Celtic Connections", isCorrect: false },
      { text: "TRNSMT", isCorrect: false },
      { text: "Edinburgh Fringe", isCorrect: true },
      { text: "Hogmanay", isCorrect: false }
    ]
  },
  {
    questionText: "¿Qué roca volcánica alberga un castillo icónico en Edimburgo? / Iconic Edinburgh castle sits on which volcanic rock?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Arthur's Seat", isCorrect: false },
      { text: "Castle Rock", isCorrect: true },
      { text: "Calton Hill", isCorrect: false },
      { text: "Blackford Hill", isCorrect: false }
    ]
  },
  {
    questionText: "Flor de cardo aparece en la Orden de… / Thistle appears in the Order of…",
    category: "scotland",
    difficulty: "hard",
    answers: [
      { text: "Bath", isCorrect: false },
      { text: "Thistle", isCorrect: true },
      { text: "Garter", isCorrect: false },
      { text: "Calatrava", isCorrect: false }
    ]
  },
  {
    questionText: "¿Qué aeropuerto sirve a la mayoría de vuelos internacionales a Escocia? / Scotland's busiest international airport?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "Aberdeen", isCorrect: false },
      { text: "Glasgow-Prestwick", isCorrect: false },
      { text: "Edinburgh Airport", isCorrect: true },
      { text: "Inverness", isCorrect: false }
    ]
  },
  {
    questionText: "Instrumento inventado por John Logie Baird / Invention by J. L. Baird?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "Teléfono", isCorrect: false },
      { text: "Televisión mecánica", isCorrect: true },
      { text: "Radar", isCorrect: false },
      { text: "Motor a reacción", isCorrect: false }
    ]
  },
  {
    questionText: "Copa del Mundo: última participación de selección masculina / Scotland men's last World Cup finals appearance?",
    category: "scotland",
    difficulty: "medium",
    answers: [
      { text: "1990", isCorrect: false },
      { text: "1998 (Francia)", isCorrect: true },
      { text: "2006", isCorrect: false },
      { text: "2022", isCorrect: false }
    ]
  },
  {
    questionText: "Fecha del referéndum de independencia / Year of independence referendum?",
    category: "scotland",
    difficulty: "easy",
    answers: [
      { text: "2014", isCorrect: true },
      { text: "2016", isCorrect: false },
      { text: "2021", isCorrect: false },
      { text: "2023", isCorrect: false }
    ]
  },
  {
    questionText: "Isla famosa por whisky de turba (\"Islay\") es parte de… / Peaty-whisky Islay belongs to which archipelago?",
    category: "scotland",
    difficulty: "hard",
    answers: [
      { text: "Orcadas", isCorrect: false },
      { text: "Hébridas Interiores / Inner Hebrides", isCorrect: true },
      { text: "Shetland", isCorrect: false },
      { text: "Firth of Forth", isCorrect: false }
    ]
  }
];

async function updateTriviaQuestions() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('\nPlease check your .env.local file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Starting trivia questions update...');
  console.log(`📝 Processing ${triviaQuestions.length} questions`);

  try {
    // Step 1: Delete all existing trivia data
    console.log('\n🗑️  Clearing existing trivia data...');
    
    // Delete answers first (due to foreign key constraint)
    const { error: answersError } = await supabase
      .from('trivia_answers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (answersError) {
      console.error('❌ Error deleting existing answers:', answersError);
      process.exit(1);
    }

    // Delete questions
    const { error: questionsError } = await supabase
      .from('trivia_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (questionsError) {
      console.error('❌ Error deleting existing questions:', questionsError);
      process.exit(1);
    }

    console.log('✅ Existing trivia data cleared successfully');

    // Step 2: Insert new questions and answers
    console.log('\n📝 Inserting new trivia questions...');
    
    let insertedCount = 0;
    let betisCount = 0;
    let scotlandCount = 0;

    for (const question of triviaQuestions) {
      // Insert question
      const { data: questionData, error: questionError } = await supabase
        .from('trivia_questions')
        .insert({
          question_text: question.questionText,
          category: question.category,
          difficulty: question.difficulty
        })
        .select()
        .single();

      if (questionError) {
        console.error(`❌ Error inserting question: "${question.questionText.substring(0, 50)}..."`, questionError);
        continue;
      }

      // Insert answers for this question
      const answersToInsert = question.answers.map(answer => ({
        question_id: questionData.id,
        answer_text: answer.text,
        is_correct: answer.isCorrect
      }));

      const { error: answersInsertError } = await supabase
        .from('trivia_answers')
        .insert(answersToInsert);

      if (answersInsertError) {
        console.error(`❌ Error inserting answers for question: "${question.questionText.substring(0, 50)}..."`, answersInsertError);
        continue;
      }

      insertedCount++;
      if (question.category === 'betis') betisCount++;
      else scotlandCount++;

      // Progress indicator
      process.stdout.write(`\r   📊 Progress: ${insertedCount}/${triviaQuestions.length} questions inserted`);
    }

    console.log('\n\n✅ Trivia questions update completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total questions: ${insertedCount}`);
    console.log(`   Betis questions: ${betisCount}`);
    console.log(`   Scotland questions: ${scotlandCount}`);
    console.log(`   Total answers: ${insertedCount * 4}`);

    // Step 3: Verify the data
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: verifyQuestions, error: verifyError } = await supabase
      .from('trivia_questions')
      .select('id, category')
      .order('created_at');

    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
    } else {
      const verifyBetis = verifyQuestions.filter(q => q.category === 'betis').length;
      const verifyScotland = verifyQuestions.filter(q => q.category === 'scotland').length;
      
      console.log(`✅ Verification successful:`);
      console.log(`   Questions in database: ${verifyQuestions.length}`);
      console.log(`   Betis: ${verifyBetis}, Scotland: ${verifyScotland}`);
    }

    console.log('\n🎉 All done! The trivia questions have been successfully updated.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateTriviaQuestions().catch(console.error);
}

export { updateTriviaQuestions };
