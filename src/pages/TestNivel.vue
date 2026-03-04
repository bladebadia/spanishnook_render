<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <q-no-ssr>
    <q-page class="row items-center justify-evenly">
      <!-- Pagina de instrucciones -->
      <div v-if="!testCompleted && currentQuestion === 0 && !showResults" class="col-12">
        <q-card flat bordered class="instruction-card">
          <q-card-section class="text-center q-pb-none q-mb-none">
            <div style="font-size: 3.5rem; margin-bottom: 0px">📝</div>
          </q-card-section>
          <q-card-section class="text-center q-pt-none">
            <h2 class="text-primary text-weight-bold q-mb-md" style="font-size: 3rem">
              {{ t('test.deNivel') }}
            </h2>
            <p class="text-h6 text-grey-7 q-mb-lg">{{ t('test.evaluaTuNivel') }}</p>

            <div class="text-left q-mb-lg">
              <p class="text-h5 text-weight-bold q-mb-md q-ml-lg">{{ t('test.instrucciones') }}</p>
              <ul class="text-body1 text-black">
                <li class="q-mb-sm">{{ t('test.elTestConsta') }}</li>
                <li class="q-mb-sm">
                  {{ t('test.cadaPreguntaTiene') }}
                </li>
                <li class="q-mb-sm">
                  {{ t('test.alCompletar') }} <strong>{{ t('test.esteTest') }}</strong>
                </li>
                <li class="q-mb-sm">{{ t('test.elTestToma') }}</li>
              </ul>
            </div>

            <q-btn
              size="lg"
              color="primary"
              :label="t('test.comenzarTest')"
              class="q-px-xl btn-comenzar-test"
              @click="currentQuestion = 1"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Questions Page -->
      <div v-if="!testCompleted && currentQuestion > 0 && !showResults">
        <div class="row justify-center">
          <div class="col-12 col-md-10">
            <q-card flat bordered class="question-card test-card-size fixed-test-card">
              <q-card-section class="test-card-content">
                <div class="test-card-progress">
                  <div class="row items-center q-mb-sm">
                    <div class="col">
                      <span class="text-body2 text-grey-6">
                        {{ t('test.pregunta') }} {{ currentQuestion }} {{ t('test.de') }}
                        {{ testQuestions.length }}
                      </span>
                    </div>
                    <div class="col-auto">
                      <q-chip
                        :label="testQuestions[currentQuestion - 1]?.level"
                        color="secondary"
                        text-color="white"
                        size="sm"
                      />
                    </div>
                  </div>
                  <q-linear-progress
                    :value="currentQuestion / testQuestions.length"
                    color="primary"
                    size="8px"
                    rounded
                  />
                </div>
                <div class="test-card-question">
                  <h3 class="text-h6 text-weight-bold pregunta-test">
                    {{ testQuestions[currentQuestion - 1]?.question }}
                  </h3>
                </div>
                <div class="test-card-options q-gutter-sm">
                  <q-btn
                    v-for="(option, index) in testQuestions[currentQuestion - 1]?.options"
                    :key="index"
                    :label="`${String.fromCharCode(65 + index)}. ${option}`"
                    :color="selectedAnswers[currentQuestion - 1] === index ? 'primary' : 'grey-3'"
                    :text-color="
                      selectedAnswers[currentQuestion - 1] === index ? 'white' : 'grey-8'
                    "
                    class="full-width text-left q-pa-md opcion-test"
                    no-caps
                    @click="selectAnswer(index)"
                  />
                </div>
                <div class="test-card-actions row justify-between">
                  <q-btn
                    v-if="currentQuestion > 1"
                    :label="t('test.anterior')"
                    icon="chevron_left"
                    color="grey-6"
                    flat
                    @click="previousQuestion"
                  />
                  <q-space />
                  <q-btn
                    v-if="currentQuestion < testQuestions.length"
                    :label="t('test.siguiente')"
                    icon-right="chevron_right"
                    color="primary"
                    class="btn-siguiente"
                    @click="nextQuestion"
                  />
                  <q-btn
                    v-if="currentQuestion === testQuestions.length"
                    :label="t('test.finalizarTest')"
                    icon-right="check"
                    color="positive"
                    class="btn-finalizar"
                    @click="finishTest"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Results Page -->
      <div class="row items-center full-width" v-if="showResults">
        <div class="column full-width items-center">
          <q-card flat bordered class="results-card test-card-size fixed-test-card">
            <q-card-section class="text-center">
              <div style="font-size: 2.5rem; margin-bottom: 1.5rem; margin-top: 1rem">✅</div>
              <p class="text-h3 text-primary text-weight-bold q-mb-xl">
                {{ t('test.testCompletado') }}
              </p>

              <div class="row justify-center items-center q-mb-lg">
                <div class="col-12 col-sm-6 text-center">
                  <q-circular-progress
                    :value="percentage"
                    size="120px"
                    :thickness="0.1"
                    color="primary"
                    track-color="grey-3"
                    class="q-ma-md"
                  >
                    <div class="text-h4 text-weight-bold">{{ levelCorrect }}/{{ levelTotal }}</div>
                  </q-circular-progress>
                  <div class="text-body1 text-grey-7">
                    {{ Math.round(percentage) }}{{ t('test.correcto') }}
                  </div>
                </div>

                <div class="col-12 col-sm-6 text-center">
                  <div class="text-h5 text-weight-bold text-primary q-mb-sm">
                    {{ t('test.tuNivel') }}
                  </div>
                  <q-chip
                    :label="testLevel"
                    color="yellow-2"
                    text-color="black"
                    size="xl"
                    class="q-pa-md chip-nivel"
                  />
                  <div class="text-body2 text-black q-mt-sm descripcion-nivel">
                    <span v-if="testLevel.includes('A1')">
                      {{ t('test.accesoConocesLo') }}
                    </span>
                    <span v-else-if="testLevel.includes('A2')">
                      {{ t('test.plataformaPuedes') }}
                    </span>
                    <span v-else-if="testLevel.includes('B1')">
                      {{ t('test.umbralTienes') }}
                    </span>
                    <span v-else-if="testLevel.includes('B2')">
                      {{ t('test.avanzadoPuedes') }}
                    </span>
                    <span v-else-if="testLevel.includes('C1')">
                      {{ t('test.dominioTeExpresas') }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="q-gutter-md">
                <q-btn
                  :label="t('test.repetirTest')"
                  icon="refresh"
                  color="secondary"
                  @click="restartTest"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-no-ssr>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';
const { t } = useI18n();

const pageTitle = 'Test de nivel de español online | SpanishNook';
const pageDescription =
  'Haz el test de nivel gratuito de SpanishNook (A1-C1) y obtén tu resultado al instante con recomendaciones de siguiente paso.';
const pageUrl = 'https://spanishnook.com/TestNivel';
const pageImage = 'https://spanishnook.com/img/Home/banner_1920.webp';

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
      content:
        'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png',
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
      content: 'noindex,nofollow',
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

  // Evaluar nivel por nivel, empezando por el más alto
  const levels: Level[] = ['C1', 'B2', 'B1', 'A2', 'A1'];
  let assignedLevel: Level = 'A1';

  for (const level of levels) {
    // Solo evaluar si hay respuestas en este nivel
    if (levelScores[level].total > 0) {
      const percentageForLevel = (levelScores[level].correct / levelScores[level].total) * 100;

      // Verificar si hay suficientes preguntas respondidas (al menos 60% del total de preguntas del nivel)
      const answeredQuestionsPercentage =
        (selectedAnswers.value.filter(
          (answer, index) => answer !== undefined && testQuestions.value[index]?.level === level,
        ).length /
          levelScores[level].total) *
        100;

      // Solo asignar nivel si:
      // 1. Se respondió al menos el 60% de las preguntas del nivel
      // 2. Se obtuvo al menos 60% de respuestas correctas
      if (answeredQuestionsPercentage >= 60 && percentageForLevel >= 60) {
        assignedLevel = level;
        break;
      }
    }
  }

  // Asignar métricas sobre el total de preguntas existentes del nivel finalmente asignado
  levelCorrect.value = levelScores[assignedLevel].correct;
  levelTotal.value = levelScores[assignedLevel].total;
  percentage.value = levelTotal.value > 0 ? (levelCorrect.value / levelTotal.value) * 100 : 0;

  const nivelDescriptions: NivelDescription = {
    C1: 'Dominio',
    B2: 'Avanzado',
    B1: 'Intermedio',
    A2: 'Plataforma',
    A1: 'Acceso',
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
.instruction-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.question-card {
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.results-card {
  width: 60%;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Estilos para los botones de respuesta */
.q-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Animaciones para transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .instruction-card,
  .question-card {
    margin: 10px;
  }
  .results-card {
    margin: 10px;
    width: 80%;
  }

  .text-h3 {
    font-size: 1.8rem;
  }

  .text-h4 {
    font-size: 1.5rem;
  }

  .text-h5 {
    font-size: 1.3rem;
  }
}

/* Botón comenzar test en negrita */
:deep(.btn-comenzar-test .q-btn__content) {
  font-weight: bold;
}

/* Pregunta del test más pequeña */
.pregunta-test {
  font-size: 1.25rem;
}

/* Opciones del test en negrita */
:deep(.opcion-test .q-btn__content) {
  font-weight: bold;
}

/* Botón siguiente y finalizar en negrita */
:deep(.btn-siguiente .q-btn__content),
:deep(.btn-finalizar .q-btn__content) {
  font-weight: bold;
}

/* Chip del nivel en negrita */
:deep(.chip-nivel .q-chip__content) {
  font-weight: bold;
}

/* Descripción del nivel en negro y justificado */
.descripcion-nivel {
  text-align: justify;
}

/* Unificar tamaño de tarjetas del test de nivel */
.test-card-size.fixed-test-card {
  width: 600px;
  height: 600px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  overflow: hidden;
  padding: 24px 16px;
}
/* Unificar tamaño de tarjetas del test de nivel y fijar posiciones internas */
.test-card-size.fixed-test-card {
  min-width: 340px;
  max-width: 500px;
  height: 520px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  overflow: hidden;
  padding: 24px 16px;
}
.test-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.test-card-progress {
  flex: 0 0 auto;
  margin-bottom: 12px;
}
.test-card-question {
  flex: 0 0 auto;
  margin-bottom: 12px;
}
.test-card-options {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  overflow-y: auto;
}
.test-card-actions {
  flex: 0 0 auto;
  margin-top: auto;
}
</style>
