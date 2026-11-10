<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <q-page class="te-pagina">
    <div class="sn-contenedor te-contenedor">
      <!-- Instrucciones -->
      <section v-if="!testCompleted && currentQuestion === 0 && !showResults" class="te-tarjeta">
        <q-icon name="quiz" class="te-icono-grande" />
        <h1 class="te-h1">{{ t('test.deNivel') }}</h1>
        <p class="te-entrada">{{ t('test.evaluaTuNivel') }}</p>

        <h2 class="te-h2">{{ t('test.instrucciones') }}</h2>
        <ul class="te-instrucciones">
          <li>
            <q-icon name="format_list_numbered" class="te-instrucciones__icono" />
            <span>{{ t('test.elTestConsta') }}</span>
          </li>
          <li>
            <q-icon name="radio_button_checked" class="te-instrucciones__icono" />
            <span>{{ t('test.cadaPreguntaTiene') }}</span>
          </li>
          <li>
            <q-icon name="insights" class="te-instrucciones__icono" />
            <span>{{ t('test.alCompletar') }} <strong>{{ t('test.esteTest') }}</strong></span>
          </li>
          <li>
            <q-icon name="schedule" class="te-instrucciones__icono" />
            <span>{{ t('test.elTestToma') }}</span>
          </li>
        </ul>

        <q-btn
          color="primary"
          unelevated
          no-caps
          size="lg"
          class="te-boton"
          icon-right="arrow_forward"
          :label="t('test.comenzarTest')"
          @click="currentQuestion = 1"
        />
      </section>

      <!-- Preguntas -->
      <section v-if="!testCompleted && currentQuestion > 0 && !showResults" class="te-tarjeta te-tarjeta--pregunta">
        <div class="te-progreso">
          <span class="te-progreso__texto">
            {{ t('test.pregunta') }} {{ currentQuestion }} {{ t('test.de') }} {{ testQuestions.length }}
          </span>
          <span class="te-nivel">{{ testQuestions[currentQuestion - 1]?.level }}</span>
        </div>
        <q-linear-progress
          :value="currentQuestion / testQuestions.length"
          color="primary"
          track-color="grey-3"
          size="8px"
          rounded
          class="q-mb-lg"
        />

        <h2 class="te-pregunta">{{ testQuestions[currentQuestion - 1]?.question }}</h2>

        <div class="te-opciones" role="radiogroup">
          <button
            v-for="(option, index) in testQuestions[currentQuestion - 1]?.options"
            :key="index"
            type="button"
            role="radio"
            :aria-checked="selectedAnswers[currentQuestion - 1] === index"
            class="te-opcion"
            :class="{ 'te-opcion--elegida': selectedAnswers[currentQuestion - 1] === index }"
            @click="selectAnswer(index)"
          >
            <span class="te-opcion__letra">{{ String.fromCharCode(65 + index) }}</span>
            <span>{{ option }}</span>
          </button>
        </div>

        <div class="te-acciones">
          <q-btn
            v-if="currentQuestion > 1"
            flat
            no-caps
            color="grey-8"
            icon="chevron_left"
            :label="t('test.anterior')"
            @click="previousQuestion"
          />
          <q-space />
          <q-btn
            v-if="currentQuestion < testQuestions.length"
            color="primary"
            unelevated
            no-caps
            class="te-boton"
            icon-right="chevron_right"
            :label="t('test.siguiente')"
            @click="nextQuestion"
          />
          <q-btn
            v-if="currentQuestion === testQuestions.length"
            color="primary"
            unelevated
            no-caps
            class="te-boton"
            icon-right="check"
            :label="t('test.finalizarTest')"
            @click="finishTest"
          />
        </div>
      </section>

      <!-- Resultado -->
      <section v-if="showResults" class="te-tarjeta">
        <q-icon name="verified" class="te-icono-grande te-icono-grande--ok" />
        <h1 class="te-h1">{{ t('test.testCompletado') }}</h1>

        <div class="te-resultado">
          <q-circular-progress
            :value="percentage"
            size="120px"
            :thickness="0.12"
            color="primary"
            track-color="grey-3"
            show-value
          >
            <span class="te-resultado__puntos">{{ levelCorrect }}/{{ levelTotal }}</span>
          </q-circular-progress>
          <div>
            <p class="te-resultado__etiqueta">{{ t('test.tuNivel') }}</p>
            <p class="te-resultado__nivel">{{ testLevel }}</p>
            <p class="te-resultado__porcentaje">{{ Math.round(percentage) }}{{ t('test.correcto') }}</p>
          </div>
        </div>

        <p class="te-descripcion">
          <span v-if="testLevel.includes('A1')">{{ t('test.accesoConocesLo') }}</span>
          <span v-else-if="testLevel.includes('A2')">{{ t('test.plataformaPuedes') }}</span>
          <span v-else-if="testLevel.includes('B1')">{{ t('test.umbralTienes') }}</span>
          <span v-else-if="testLevel.includes('B2')">{{ t('test.avanzadoPuedes') }}</span>
          <span v-else-if="testLevel.includes('C1')">{{ t('test.dominioTeExpresas') }}</span>
        </p>

        <div class="te-siguiente sn-nota">
          <p class="te-siguiente__titulo">{{ t('TestPagina.siguientePaso') }}</p>
          <p class="te-siguiente__texto">{{ t('TestPagina.siguienteTexto') }}</p>
          <div class="te-siguiente__botones">
            <q-btn
              color="primary"
              unelevated
              no-caps
              class="te-boton"
              to="/Reservas"
              :label="t('PaginaClases.reservarClase')"
            />
            <q-btn
              outline
              color="primary"
              no-caps
              class="te-boton"
              to="/Clases"
              :label="t('indexEncuentraTusClases')"
            />
          </div>
        </div>

        <q-btn
          flat
          no-caps
          color="grey-8"
          icon="refresh"
          class="q-mt-md"
          :label="t('test.repetirTest')"
          @click="restartTest"
        />
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';
const { t } = useI18n();

const pageTitle = 'Test de nivel de español online | SpanishNook';
const pageDescription =
  'Haz el test de nivel gratuito de SpanishNook (A1-C1) y obtén tu resultado al instante con recomendaciones de siguiente paso.';
const pageUrl = 'https://www.spanishnook.com/TestNivel';
const pageImage = 'https://www.spanishnook.com/img/Logo_rectangular_320.png';

useMeta(() => ({
  title: pageTitle,
  meta: {
    description: {
      name: 'description',
      content: pageDescription,
    },
    keywords: {
      name: 'keywords',
      content:
        'test de nivel español, examen nivel español online, prueba A1 A2 B1 B2 C1, evaluar nivel español',
    },
    ogTitle: {
      property: 'og:title',
      content: pageTitle,
    },
    ogDescription: {
      property: 'og:description',
      content: pageDescription,
    },
    ogImage: {
      property: 'og:image',
      content: pageImage,
    },
    ogUrl: {
      property: 'og:url',
      content: pageUrl,
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    twitterCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    twitterTitle: {
      name: 'twitter:title',
      content: pageTitle,
    },
    twitterDescription: {
      name: 'twitter:description',
      content: pageDescription,
    },
    twitterImage: {
      name: 'twitter:image',
      content: pageImage,
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
  link: {
    canonical: {
      rel: 'canonical',
      href: pageUrl,
    },
  },
}));
//import { useQuasar } from 'quasar';

//const $q = useQuasar();
// Test de nivel variables
const currentQuestion = ref(0);
const selectedAnswers = ref<number[]>([]);
const testCompleted = ref(false);
const testScore = ref(0);
const testLevel = ref('');
const showResults = ref(false);
const percentage = ref(0);
// Nuevos refs para mostrar el rendimiento específico del nivel alcanzado
const levelCorrect = ref(0);
const levelTotal = ref(0);

//const step = ref(1);
const testQuestions = computed(() => [
  {
    question: '1 ¿Cómo se escribe 2976 en español?',
    options: [
      'mil dos novecentos setenta y seis',
      'dos mil novecientos sesenta y seis',
      'dos mil novecientos setenta y seis',
    ],
    correct: 2,
    level: 'A1',
  },
  {
    question: '2 ¿Cuál es la forma correcta del verbo SER (yo)?',
    options: ['soy', 'eres', 'es'],
    correct: 0,
    level: 'A1',
  },
  {
    question: '3 El profesor tiene muchos ___ en su estuche.',
    options: ['lápiz', 'lápices', 'lápizs'],
    correct: 1,
    level: 'A1',
  },
  {
    question: "4 ¿Cuál es el femenino de: 'el gato / ___'?",
    options: ['el gata', 'la gata', 'las gatas'],
    correct: 1,
    level: 'A1',
  },
  {
    question: '5 Nosotros siempre ___ a las 7 de la mañana.',
    options: ['despertamos nos', 'despiertamos', 'nos despertamos'],
    correct: 2,
    level: 'A1',
  },
  {
    question: '6 Estoy nervioso. Hoy (yo) ___ un examen difícil.',
    options: ['estoy', 'tiene', 'tengo'],
    correct: 2,
    level: 'A1',
  },
  {
    question: '7 Hoy ___ (comer, nosotros) una ensalada muy rica.',
    options: ['comemos', 'hemos comido', 'comerábamos'],
    correct: 1,
    level: 'A2',
  },
  {
    question: '8 ¿Qué tal? ¿___ (ir, vosotros) al concierto ayer?',
    options: ['fuisteis', 'fuiste', 'iban'],
    correct: 0,
    level: 'A2',
  },
  {
    question: '9 Acuérdate de comprar los huevos y de ____ (poner) en la nevera.',
    options: ['poner', 'ponerlos', 'ponelo'],
    correct: 1,
    level: 'A2',
  },
  {
    question: '10 Mañana voy ___ Valencia ___ tren.',
    options: ['a/en', 'en/en', 'para/a'],
    correct: 0,
    level: 'A2',
  },
  {
    question: '11 Para comprar un buen collar debes ir a una ___.',
    options: ['droguería', 'joyería', 'charcutería'],
    correct: 1,
    level: 'A2',
  },
  {
    question: '12 Para mí, este es ___ restaurante de la ciudad.',
    options: ['el mejor', 'lo mejor', 'el más bueno'],
    correct: 0,
    level: 'A2',
  },
  {
    question: '13 Por favor chicos, ___ las manos antes de comer.',
    options: ['lavais', 'lavad', 'lavaos'],
    correct: 2,
    level: 'B1',
  },
  {
    question: '14 ¡Ojalá todos ___ el examen de lengua!',
    options: ['aprobar', 'aprobemos', 'aprobamos'],
    correct: 1,
    level: 'B1',
  },
  {
    question: '15 Espero que ___ un buen trabajo pronto.',
    options: ['conseguimos', 'conseguir', 'consigamos'],
    correct: 2,
    level: 'B1',
  },
  {
    question: '16 Hoy llueve mucho ___ no saldremos a pasear.',
    options: ['así que', 'porque', 'como'],
    correct: 0,
    level: 'B1',
  },
  {
    question: '17 ¿Cuál de estas expresiones usarías para dar una opinión?',
    options: ['Me parece que...', 'Hay que...', 'Tengo que...'],
    correct: 0,
    level: 'B1',
  },
  {
    question: '18 Cuando Carla llegó al trabajo, la reunión ya ___.',
    options: ['empezó', 'ha empezado', 'había empezado'],
    correct: 2,
    level: 'B1',
  },
  {
    question: '19 No encuentro el móvil, ___ en casa.',
    options: ['me lo habré dejado', 'me lo habría dejado', 'me lo olvidaré'],
    correct: 0,
    level: 'B2',
  },
  {
    question: '20 Aunque el viaje ___ peligroso, creo que valdría la pena.',
    options: ['es', 'ha sido', 'fuese'],
    correct: 2,
    level: 'B2',
  },
  {
    question: '21 ¿Cuál de estas frases utiliza “realizar” correctamente?',
    options: [
      'Mañana voy a realizar un café para mis amigos.',
      'Al final logró realizar su sueño e irse al extranjero.',
      'No pude realizar a tu hermano porque había mucha gente.',
    ],
    correct: 1,
    level: 'B2',
  },
  {
    question: '22 ¿Cuál de las siguientes frases está formulada correctamente?',
    options: [
      'Aunque estaba cansado, pero terminó el trabajo a tiempo.',
      'Mañana voy a haber terminado el informe antes de la reunión.',
      'Si hubiera sabido la respuesta, la habría dicho sin dudar.',
    ],
    correct: 2,
    level: 'B2',
  },
  {
    question: '23 Mi abuelo tiene 90 años pero está fenomenal, ___.',
    options: ['está como una cabra', 'está como una vaca', 'está como un roble'],
    correct: 2,
    level: 'C1',
  },
  {
    question: '24 Me pareció increíble que ___ aquel traje para la fiesta.',
    options: ['se ponga', 'se hubiera puesto', 'se haya puesto'],
    correct: 1,
    level: 'C1',
  },
  {
    question: '25 Lucas siempre dice que la profesora es guapa y lista. ¡___!',
    options: ['es un pelota,', 'es un pringao', 'es un maceta'],
    correct: 0,
    level: 'C1',
  },
]);

// Definir el tipo para los niveles
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

type LevelScore = {
  correct: number;
  total: number;
};

type LevelScores = {
  [key in Level]: LevelScore;
};

type NivelDescription = {
  [key in Level]: string;
};

// Añadir estas funciones de evaluación
const evaluateTestByLevel = (): string => {
  const levelScores: LevelScores = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
  };

  // Contar preguntas totales y correctas por nivel
  testQuestions.value.forEach((question, index) => {
    const level = question.level as Level;
    levelScores[level].total++;
    if (selectedAnswers.value[index] !== undefined) {
      if (selectedAnswers.value[index] === question.correct) {
        levelScores[level].correct++;
      }
    }
  });

  // De A1 hacia arriba: tu nivel es el más alto que apruebas (≥ 60 %) sin haber
  // suspendido uno anterior. Antes se miraba de C1 hacia abajo y quien acertaba
  // por suerte las de C1 salía C1 aunque fallara las de A1.
  const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  let assignedLevel: Level = 'A1';

  for (const level of levels) {
    const { correct, total } = levelScores[level];
    if (total === 0) continue;
    if ((correct / total) * 100 >= 60) {
      assignedLevel = level;
    } else {
      break;
    }
  }

  // El círculo muestra los aciertos de todo el test
  levelCorrect.value = Object.values(levelScores).reduce((s, l) => s + l.correct, 0);
  levelTotal.value = testQuestions.value.length;
  percentage.value = levelTotal.value > 0 ? (levelCorrect.value / levelTotal.value) * 100 : 0;

  const nivelDescriptions: NivelDescription = {
    C1: t('test.nivelC1'),
    B2: t('test.nivelB2'),
    B1: t('test.nivelB1'),
    A2: t('test.nivelA2'),
    A1: t('test.nivelA1'),
  };

  return `${assignedLevel} - ${nivelDescriptions[assignedLevel]}`;
};

// Modificar la función finishTest
const finishTest = () => {
  let score = 0;
  // Recorremos respuestas y sumamos correctas únicamente
  selectedAnswers.value.forEach((answer, index) => {
    if (
      answer !== undefined &&
      testQuestions.value[index] &&
      answer === testQuestions.value[index].correct
    ) {
      score++;
    }
  });

  testScore.value = score;
  // Calcular nivel (esta función actualizará percentage, levelCorrect y levelTotal sobre el total del nivel alcanzado)
  testLevel.value = evaluateTestByLevel();

  testCompleted.value = true;
  showResults.value = true;
};

const restartTest = () => {
  currentQuestion.value = 0;
  selectedAnswers.value = [];
  testCompleted.value = false;
  testScore.value = 0;
  testLevel.value = '';
  showResults.value = false;
  percentage.value = 0;
  levelCorrect.value = 0;
  levelTotal.value = 0;
};

function selectAnswer(answerIndex: number) {
  selectedAnswers.value[currentQuestion.value - 1] = answerIndex;
}

function nextQuestion() {
  if (currentQuestion.value < testQuestions.value.length) {
    currentQuestion.value++;
  } else {
    finishTest();
  }
}
const previousQuestion = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value--;
  }
};
// Show results
//showResults.value = true;
// Set test score and level
// testScore.value = score;
// testLevel.value = getTestLevel(score);
</script>

<style scoped>
.te-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
}
.te-contenedor {
  max-width: 760px;
  padding-block: clamp(24px, 5vw, 56px);
}
.te-tarjeta {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
  padding: clamp(22px, 5vw, 40px);
  text-align: center;
}
.te-tarjeta--pregunta {
  text-align: left;
}
.te-icono-grande {
  font-size: 34px;
  color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
  border-radius: 50%;
  padding: 14px;
  margin-bottom: 12px;
}
.te-icono-grande--ok {
  color: var(--sn-oliva);
  background: #eef5e3;
}
.te-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  color: var(--sn-burdeos);
  margin: 0 0 10px;
}
.te-entrada {
  font-size: var(--sn-t-entrada);
  color: var(--sn-tinta-suave);
  margin: 0 0 28px;
}
.te-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  margin: 0 0 12px;
  text-align: left;
}
.te-instrucciones {
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: grid;
  gap: 12px;
  text-align: left;
}
.te-instrucciones li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  line-height: 1.55;
}
.te-instrucciones__icono {
  flex: none;
  font-size: 22px;
  color: var(--sn-burdeos);
  margin-top: 1px;
}
.te-boton {
  border-radius: var(--sn-r-boton);
  font-weight: 700;
  padding-inline: 22px;
}

/* Preguntas */
.te-progreso {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.te-progreso__texto {
  color: var(--sn-tinta-suave);
  font-weight: 600;
}
.te-nivel {
  padding: 2px 10px;
  border-radius: var(--sn-r-boton);
  background: var(--sn-burdeos-tenue);
  color: var(--sn-burdeos);
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-peq);
}
.te-pregunta {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 20px;
}
.te-opciones {
  display: grid;
  gap: 10px;
  margin-bottom: 24px;
}
.te-opcion {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  background: var(--sn-hoja);
  border: 2px solid var(--sn-borde);
  border-radius: 12px;
  color: var(--sn-tinta);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}
.te-opcion:hover {
  border-color: var(--sn-burdeos);
}
.te-opcion--elegida {
  border-color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
}
.te-opcion__letra {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--sn-papel);
  border: 1px solid var(--sn-borde);
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
}
.te-opcion--elegida .te-opcion__letra {
  background: var(--sn-burdeos);
  border-color: var(--sn-burdeos);
  color: #fff;
}
.te-acciones {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Resultado */
.te-resultado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px 32px;
  margin: 16px 0;
}
.te-resultado__puntos {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sn-tinta);
}
.te-resultado__etiqueta {
  margin: 0;
  color: var(--sn-tinta-suave);
  font-weight: 600;
}
.te-resultado__nivel {
  margin: 0;
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  color: var(--sn-burdeos);
  line-height: 1.1;
}
.te-resultado__porcentaje {
  margin: 4px 0 0;
  color: var(--sn-tinta-suave);
}
.te-descripcion {
  max-width: 56ch;
  margin: 0 auto 24px;
  line-height: 1.6;
  text-align: left;
}
.te-siguiente {
  padding: 20px;
  text-align: center;
}
.te-siguiente__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  margin: 0 0 4px;
}
.te-siguiente__texto {
  margin: 0 0 16px;
  color: var(--sn-tinta-suave);
}
.te-siguiente__botones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
</style>
