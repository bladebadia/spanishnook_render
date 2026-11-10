<template>
  <q-page class="rc-pagina">
    <div v-if="cargando" class="flex flex-center q-my-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <section v-else-if="!curso" class="sn-contenedor rc-vacio">
      <q-icon name="error_outline" size="56px" class="rc-vacio__icono" />
      <h1 class="rc-h2">{{ t('reservasCursos.cursoNo') }}</h1>
      <q-btn
        color="primary"
        unelevated
        no-caps
        class="q-mt-md"
        :to="rutaClases"
        :label="t('reservasCursos.volverCursos')"
      />
    </section>

    <div v-else class="sn-contenedor">
      <router-link :to="rutaClases" class="rc-volver">
        <q-icon name="arrow_back" size="18px" /> {{ t('reservasCursos.volverCursos') }}
      </router-link>

      <div v-if="pagoOk" class="rc-aviso" role="status">
        <q-icon name="check_circle" size="22px" />
        <div>
          {{ t('reservasCursos.pagoRecibido') }}
          <div v-if="pagoPendiente" class="rc-aviso__detalle">
            {{ t('reservasCursos.pagoProcesando') }}
          </div>
        </div>
      </div>

      <div class="rc-rejilla">
        <!-- Información del curso -->
        <article class="rc-info" :class="selloCategoria">
          <div class="rc-etiquetas">
            <span class="rc-etiqueta rc-etiqueta--sello">{{ textoCategoria }}</span>
            <span class="rc-etiqueta">{{ textoFormato }}</span>
            <span v-if="curso.nivel" class="rc-etiqueta">{{ curso.nivel }}</span>
          </div>

          <h1 class="rc-h1">{{ textoCurso(curso, 'nombre_curso', locale) }}</h1>

          <p class="rc-estado">
            <span class="rc-estado__punto" :class="`rc-estado__punto--${claseEstado}`" />
            {{ textoEstado }}
            <span v-if="plazasLibres !== null && !cursoTerminado" class="rc-estado__plazas">
              · {{ t('reservasCursos.plazasLibres', plazasLibres) }}
            </span>
          </p>

          <p v-if="textoCurso(curso, 'descripcion', locale)" class="rc-descripcion">
            {{ textoCurso(curso, 'descripcion', locale) }}
          </p>

          <dl class="rc-datos">
            <div v-if="esCerrado" class="rc-dato">
              <dt><q-icon name="event_available" /> {{ t('reservasCursos.fechasCerradas') }}</dt>
              <dd>
                {{ fechasTexto }}
                <span class="rc-dato__extra">
                  <template v-if="sesionesCurso.length > 0">
                    {{ t('reservasCursos.numSesiones', sesionesCurso.length) }} ·
                  </template>
                  {{ t('reservasCursos.duracionSesion', { min: duracionCurso }) }}
                </span>
              </dd>
            </div>
            <div v-else-if="curso.fecha_inicio" class="rc-dato">
              <dt><q-icon name="event_available" /> {{ t('reservasCursos.inicio') }}</dt>
              <dd>{{ fechaInicioTexto }}</dd>
            </div>

            <div class="rc-dato">
              <dt><q-icon name="event" /> {{ t('reservasCursos.dias') }}</dt>
              <dd>
                {{
                  curso.dias_semana.map(traducirDia).join(', ') || t('reservasCursos.porDefinir')
                }}
              </dd>
            </div>

            <div class="rc-dato">
              <dt><q-icon name="schedule" /> {{ t('reservasCursos.horarioCorto') }}</dt>
              <dd v-if="curso.horarios_curso.length > 0">
                {{ convertirHorarioLocal(curso.horarios_curso[0]) }}
                <span class="rc-dato__extra">
                  {{ zonaHorariaUsuario }} · {{ t('reservasCursos.horaMadrid') }}:
                  {{ curso.horarios_curso[0] }}
                </span>
              </dd>
              <dd v-else>{{ t('reservasCursos.porDefinir') }}</dd>
            </div>
          </dl>
        </article>

        <!-- Reserva -->
        <aside class="rc-reserva">
          <h2 class="rc-h2">
            {{ esCursoActivo ? t('reservasCursos.inscripcion') : t('reservasCursos.reservaTu') }}
          </h2>

          <!-- Curso cerrado: ya inscrito -->
          <div v-if="esCerrado && estaInscrito" class="rc-bloque">
            <p class="rc-ok"><q-icon name="check_circle" /> {{ t('reservasCursos.yaInscrito') }}</p>
            <p class="rc-texto">{{ t('reservasCursos.yaInscritoTexto') }}</p>
            <q-btn
              color="primary"
              unelevated
              no-caps
              class="rc-boton"
              icon="account_circle"
              :label="t('reservasCursos.irArea')"
              to="/AreaPersonal"
            />
          </div>

          <!-- Curso cerrado: terminado -->
          <div v-else-if="esCerrado && cursoTerminado" class="rc-bloque">
            <p class="rc-texto">{{ t('reservasCursos.cursoTerminado') }}</p>
            <q-btn
              outline
              color="primary"
              no-caps
              class="rc-boton"
              :to="rutaClases"
              :label="t('reservasCursos.volverCursos')"
            />
          </div>

          <!-- Curso cerrado: inscripción abierta -->
          <div v-else-if="esCerrado && esCursoActivo && !cursoLleno" class="rc-bloque">
            <p class="rc-precio">
              {{ precioTotalTexto }}
              <span class="rc-precio__nota">{{ t('reservasCursos.pagoUnico') }}</span>
            </p>
            <p v-if="plazasLibres !== null" class="rc-texto">
              <q-icon name="group" /> {{ t('reservasCursos.plazasLibres', plazasLibres) }}
            </p>
            <q-btn
              color="primary"
              unelevated
              no-caps
              size="lg"
              icon="credit_card"
              class="rc-boton"
              :label="
                autenticado
                  ? t('reservasCursos.inscribirme')
                  : t('reservasCursos.iniciarSesionInscribirte')
              "
              :loading="procesandoInscripcion"
              @click="inscribirse"
            />
            <p class="rc-pie">{{ t('reservasCursos.pago') }}</p>
          </div>

          <!-- Suscripción: ya suscrito -->
          <div v-else-if="estaSuscrito" class="rc-bloque">
            <p class="rc-ok"><q-icon name="check_circle" /> {{ t('reservasCursos.yaEres') }}</p>
            <p class="rc-texto">{{ t('reservasCursos.ahoraTienes') }}</p>
            <q-btn
              color="primary"
              unelevated
              no-caps
              class="rc-boton"
              icon="account_circle"
              :label="t('reservasCursos.irArea')"
              to="/AreaPersonal"
            />
          </div>

          <!-- Suscripción: abierta -->
          <div v-else-if="esCursoActivo && !cursoLleno" class="rc-bloque">
            <p class="rc-precio">
              {{ curso.precio_curso }} €<span class="rc-precio__mes">{{
                t('reservasCursos.mes')
              }}</span>
            </p>
            <template v-if="autenticado">
              <q-btn
                color="primary"
                unelevated
                no-caps
                size="lg"
                icon="credit_card"
                class="rc-boton"
                :label="t('reservasCursos.suscribirte')"
                :loading="procesando"
                @click="iniciarSuscripcion"
              />
              <p class="rc-pie">{{ t('reservasCursos.pago') }}</p>
            </template>
            <q-btn
              v-else
              outline
              color="primary"
              no-caps
              class="rc-boton"
              :to="rutaLogin"
              :label="t('reservasCursos.iniciarSesion')"
            />
          </div>

          <!-- Lista de espera -->
          <div v-else class="rc-bloque">
            <p v-if="cursoLleno && esCursoActivo" class="rc-texto rc-texto--fuerte">
              {{ t('reservasCursos.cursoCompleto') }}
            </p>
            <p v-else class="rc-texto rc-texto--fuerte">{{ t('reservasCursos.elCurso') }}</p>

            <template v-if="autenticado">
              <template v-if="!yaEnListaEspera">
                <p class="rc-texto">{{ t('reservasCursos.apuntate') }}</p>
                <q-checkbox
                  v-model="aceptaCondiciones"
                  :label="t('reservasCursos.acepto')"
                  dense
                  class="rc-check"
                />
                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  icon="event_available"
                  class="rc-boton"
                  :disable="!aceptaCondiciones"
                  :loading="reservando"
                  :label="t('reservasCursos.unirme')"
                  @click="confirmarReservaAutenticado"
                />
              </template>
              <p v-else class="rc-ok rc-ok--espera">
                <q-icon name="watch_later" /> {{ t('reservasCursos.yaEstas') }}
              </p>
            </template>

            <template v-else>
              <template v-if="!yaEnListaEspera">
                <p class="rc-texto">{{ t('reservasCursos.apuntateA') }}</p>
                <q-input
                  v-model="formGuest.nombre"
                  :label="t('reservasCursos.tuNombre')"
                  outlined
                  dense
                  class="q-mb-sm"
                />
                <q-input
                  v-model="formGuest.email"
                  :label="t('reservasCursos.tuEmail')"
                  type="email"
                  outlined
                  dense
                  class="q-mb-sm"
                />
                <q-checkbox
                  v-model="aceptaCondicionesGuest"
                  :label="t('reservasCursos.aceptarTerminos')"
                  dense
                  class="rc-check"
                />
                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  class="rc-boton"
                  :disable="!formGuestValido || reservando"
                  :loading="reservando"
                  :label="t('reservasCursos.avisadme')"
                  @click="confirmarReservaGuest"
                />
              </template>
              <p v-else class="rc-ok rc-ok--espera">
                <q-icon name="watch_later" /> {{ t('reservasCursos.tuEmailYa') }}
              </p>
              <q-btn
                flat
                color="primary"
                no-caps
                class="q-mt-sm"
                :label="t('reservasCursos.iniciar')"
                :to="rutaLogin"
              />
            </template>
          </div>
        </aside>
      </div>
    </div>

    <q-dialog v-model="dialogConfirm" persistent>
      <q-card>
        <q-card-section>{{ t('reservasCursos.unirse') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('reservasCursos.no')" v-close-popup />
          <q-btn color="primary" :label="t('reservasCursos.si')" @click="reservarAutenticado" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGuestConfirm" persistent>
      <q-card>
        <q-card-section>{{
          t('reservasCursos.confirmarEmail', { email: formGuest.email })
        }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('reservasCursos.no')" v-close-popup />
          <q-btn color="primary" :label="t('reservasCursos.si')" @click="reservarGuest" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useSuscripciones } from 'src/composables/useSuscripciones';
import { useI18n } from 'vue-i18n';
import { textoCurso, type TextosEn } from 'src/utils/textoCurso';
import {
  fechasDelCurso,
  formatFechaCalendario,
  hoyMadridISO,
  proximaFechaDiaSemana,
  rangoHoraLocal,
  zonaUsuario,
} from 'src/utils/zonaHoraria';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { procesando, handleSubscribe } = useSuscripciones();
const { locale, t } = useI18n();

useMeta(() => ({
  title: 'Cursos Grupales de Español | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Reserva cursos grupales de español online en grupos reducidos de máximo 6 personas. Aprende con profesores nativos en SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'cursos grupales español online, clases en grupo español, grupos reducidos español, curso español A1 A2 B1 B2 C1, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Cursos Grupales de Español | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Cursos grupales de español online en grupos reducidos de máximo 6 personas con profesores nativos.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/ReservasCursos',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

// Se rellena en cliente: en el servidor (UTC) provocaba un desajuste al hidratar
const zonaHorariaUsuario = ref('');

interface Curso {
  id: number;
  nombre_curso: string;
  descripcion?: string | null;
  nivel?: string | null;
  categoria?: 'conversacion' | 'general' | null;
  estado_curso: string;
  max_estudiantes?: number;
  dias_semana: string[];
  horarios_curso: string[];
  stripe_price_id?: string;
  precio_curso?: string | number;
  tipo_curso?: 'suscripcion' | 'cerrado';
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  precio_total_centimos?: number | null;
  duracion_minutos?: number | null;
  textos_en?: TextosEn | null;
}

const curso = ref<Curso | null>(null);
const cargando = ref(true);
const reservando = ref(false);
const user = ref<User | null>(null);
const ocupacionActual = ref(0);

const autenticado = computed(() => !!user.value);
const rutaClases = '/Clases';
const rutaLogin = '/Acceder';
const esCursoActivo = computed(() => curso.value?.estado_curso === 'Activo');

// --- CURSO DE FECHAS CERRADAS (pago único) ---
const esCerrado = computed(() => curso.value?.tipo_curso === 'cerrado');
const duracionCurso = computed(() => curso.value?.duracion_minutos || 90);
const cursoTerminado = computed(
  () => esCerrado.value && !!curso.value?.fecha_fin && curso.value.fecha_fin < hoyMadridISO(),
);
const sesionesCurso = computed(() =>
  esCerrado.value
    ? fechasDelCurso(
        curso.value?.fecha_inicio ?? '',
        curso.value?.fecha_fin ?? '',
        curso.value?.dias_semana ?? [],
      )
    : [],
);
const fechaInicioTexto = computed(() =>
  curso.value?.fecha_inicio ? formatFechaCalendario(curso.value.fecha_inicio, locale.value) : '',
);
const fechaFinTexto = computed(() =>
  curso.value?.fecha_fin ? formatFechaCalendario(curso.value.fecha_fin, locale.value) : '',
);
const fechasTexto = computed(() =>
  t('reservasCursos.desdeHasta', { inicio: fechaInicioTexto.value, fin: fechaFinTexto.value }),
);
const precioTotalTexto = computed(() => {
  const centimos = curso.value?.precio_total_centimos;
  if (centimos == null) return '';
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(
    centimos / 100,
  );
});
const plazasLibres = computed<number | null>(() => {
  const max = curso.value?.max_estudiantes;
  if (!max) return null;
  return Math.max(max - ocupacionActual.value, 0);
});

const estaInscrito = ref(false);
const procesandoInscripcion = ref(false);
const pagoOk = computed(() => route.query.pago === 'ok');
const pagoPendiente = ref(false);

const cursoLleno = computed(() => {
  if (!curso.value) return false;
  const max = curso.value.max_estudiantes || 100;
  return ocupacionActual.value >= max;
});

const textoEstado = computed(() => {
  if (cursoTerminado.value) return t('reservasCursos.finalizado');
  // Si está activo pero se llenó, lo marcamos como Completo
  if (cursoLleno.value && esCursoActivo.value) return t('reservasCursos.completo');

  switch (curso.value?.estado_curso) {
    case 'Activo':
      return t('reservasCursos.activo');
    case 'Completo':
      return t('reservasCursos.completo');
    case 'Lista de espera':
      return t('reservasCursos.espera');
    default:
      return curso.value?.estado_curso || t('reservasCursos.activo');
  }
});

// Color del sello y etiquetas (como en las tarjetas de /Clases)
const selloCategoria = computed(() =>
  curso.value?.categoria === 'general' ? 'sn-sello-general' : 'sn-sello-conversacion',
);
const textoCategoria = computed(() =>
  curso.value?.categoria === 'general'
    ? t('PaginaClases.tipoGeneral')
    : t('PaginaClases.tipoConversacion'),
);
const textoFormato = computed(() =>
  esCerrado.value ? t('PaginaClases.etiquetaPagoUnico') : t('PaginaClases.etiquetaMensual'),
);
const claseEstado = computed(() => {
  if (cursoTerminado.value) return 'fin';
  if (cursoLleno.value || curso.value?.estado_curso === 'Completo') return 'lleno';
  return esCursoActivo.value ? 'abierto' : 'espera';
});

const aceptaCondiciones = ref(false);
const aceptaCondicionesGuest = ref(false);
const dialogConfirm = ref(false);
const dialogGuestConfirm = ref(false);
const formGuest = ref({ nombre: '', email: '' });
const estaSuscrito = ref(false);
const formGuestValido = computed(
  () => !!formGuest.value.nombre && !!formGuest.value.email && aceptaCondicionesGuest.value,
);

// La lista de espera ya no es pública: se pregunta al servidor (con sesión, por tu id)
const yaEnListaEspera = ref(false);
const comprobarListaEspera = async (email?: string) => {
  if (!curso.value) return;
  if (!user.value && !email) {
    yaEnListaEspera.value = false;
    return;
  }
  const { data } = await supabase.rpc('en_lista_espera', {
    p_course_id: curso.value.id,
    p_email: email ?? null,
  });
  yaEnListaEspera.value = data === true;
};

// --- TRADUCCIÓN DÍAS ---
const diasSemanaMap: Record<string, Record<string, string>> = {
  lunes: { 'es-ES': 'Lunes', 'en-US': 'Monday' },
  martes: { 'es-ES': 'Martes', 'en-US': 'Tuesday' },
  miercoles: { 'es-ES': 'Miércoles', 'en-US': 'Wednesday' },
  miércoles: { 'es-ES': 'Miércoles', 'en-US': 'Wednesday' },
  jueves: { 'es-ES': 'Jueves', 'en-US': 'Thursday' },
  viernes: { 'es-ES': 'Viernes', 'en-US': 'Friday' },
  sabado: { 'es-ES': 'Sábado', 'en-US': 'Saturday' },
  sábado: { 'es-ES': 'Sábado', 'en-US': 'Saturday' },
  domingo: { 'es-ES': 'Domingo', 'en-US': 'Sunday' },
};

const traducirDia = (dia: string) => {
  if (!dia) return '';
  const key = dia.toLowerCase();
  const traducciones = diasSemanaMap[key];
  return traducciones?.[locale.value] ?? traducciones?.['es-ES'] ?? dia;
};

// --- FUNCIÓN DE HORA CORREGIDA (SOLUCIONADO EL ERROR TS) ---
// Ahora acepta 'string | undefined' explícitamente.
const convertirHorarioLocal = (horaMadridStr: string | undefined) => {
  if (!horaMadridStr) return '...';
  // Se usa la próxima fecha real del curso para aplicar el horario de verano correcto
  // En los cursos cerrados, la primera sesión del curso
  const fechaRef =
    sesionesCurso.value[0] ??
    proximaFechaDiaSemana(curso.value?.dias_semana?.[0] ?? '') ??
    hoyMadridISO();
  return rangoHoraLocal(fechaRef, horaMadridStr, duracionCurso.value);
};

// --- CARGAS DE DATOS ---
const cargarUsuario = async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
};

const cargarCurso = async () => {
  cargando.value = true;
  try {
    const idNum = Number(route.params.id || route.query.id);
    if (isNaN(idNum)) throw new Error('ID no válido');

    const { data, error } = await supabase
      .from('cursos_grupales')
      .select(
        'id, nombre_curso, descripcion, estado_curso, max_estudiantes, dias_semana, horarios_curso, stripe_price_id, precio_curso, tipo_curso, fecha_inicio, fecha_fin, precio_total_centimos, duracion_minutos, nivel, categoria, textos_en',
      )
      .eq('id', idNum)
      .maybeSingle();
    if (error) throw error;

    if (data) {
      curso.value = {
        ...data,
        dias_semana: Array.isArray(data.dias_semana) ? data.dias_semana : [],
        horarios_curso: Array.isArray(data.horarios_curso) ? data.horarios_curso : [],
      } as Curso;
      const { data: countData } = await supabase.rpc('get_curso_ocupacion', {
        curso_id_param: idNum,
      });
      ocupacionActual.value = countData || 0;
    }
  } catch {
    curso.value = null;
  } finally {
    cargando.value = false;
  }
};

const iniciarSuscripcion = async () => {
  if (!curso.value?.stripe_price_id)
    return $q.notify({ type: 'negative', message: t('reservasCursos.errorConfiguracion') });

  if (ocupacionActual.value >= (curso.value.max_estudiantes || 100)) {
    return $q.notify({ type: 'negative', message: t('reservasCursos.plazasAgotadas') });
  }
  await handleSubscribe(curso.value.stripe_price_id, curso.value.id.toString());
};

const comprobarSuscripcion = async () => {
  if (!user.value || !curso.value?.id) return;
  const { data } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', user.value.id)
    .eq('course_id', curso.value.id)
    .in('estado', ['active', 'trialing'])
    .maybeSingle();
  if (data) estaSuscrito.value = true;
};

// --- INSCRIPCIÓN A CURSO CERRADO ---
const comprobarInscripcion = async (): Promise<boolean> => {
  if (!user.value || !curso.value?.id) return false;
  const { data } = await supabase
    .from('inscripciones_curso')
    .select('id')
    .eq('user_id', user.value.id)
    .eq('curso_id', curso.value.id)
    .eq('estado', 'pagada')
    .limit(1)
    .maybeSingle();
  estaInscrito.value = !!data;
  return estaInscrito.value;
};

// Al volver de Stripe el webhook puede tardar unos segundos en crear la inscripción
const esperarInscripcion = async (intentos = 5, esperaMs = 2000) => {
  for (let i = 0; i < intentos; i++) {
    if (await comprobarInscripcion()) {
      pagoPendiente.value = false;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, esperaMs));
  }
  pagoPendiente.value = !(await comprobarInscripcion());
};

const irALogin = () => router.push({ path: rutaLogin, query: { redirect: route.fullPath } });

const estadoHttp = (err: unknown): number | undefined => {
  const contexto = (err as { context?: unknown } | null)?.context;
  return typeof Response !== 'undefined' && contexto instanceof Response
    ? contexto.status
    : undefined;
};

const inscribirse = async () => {
  if (!curso.value) return;
  if (!user.value) {
    await irALogin();
    return;
  }
  procesandoInscripcion.value = true;
  let redirigiendo = false;
  try {
    const { data, error } = await supabase.functions.invoke('checkout-curso', {
      body: {
        cursoId: curso.value.id,
        idioma: locale.value.startsWith('en') ? 'en' : 'es',
      },
    });
    if (error) {
      const estado = estadoHttp(error);
      if (estado === 401) {
        await irALogin();
        return;
      }
      if (estado === 409) {
        if (!(await comprobarInscripcion())) {
          $q.notify({ type: 'negative', message: t('reservasCursos.plazasAgotadas') });
        }
        return;
      }
      throw error;
    }
    const url = (data as { url?: string } | null)?.url;
    if (!url) throw new Error('Sin URL de pago');
    redirigiendo = true;
    window.location.href = url;
  } catch (err: unknown) {
    console.error('Error iniciando el pago del curso:', err);
    $q.notify({ type: 'negative', message: t('reservasCursos.errorCheckout') });
  } finally {
    // Si vamos a Stripe, el botón sigue cargando hasta que cambie la página
    if (!redirigiendo) procesandoInscripcion.value = false;
  }
};

// --- RESERVAS ---
const confirmarReservaGuest = () => {
  if (!formGuestValido.value)
    return $q.notify({ type: 'warning', message: t('reservasCursos.rellenaCampos') });
  dialogGuestConfirm.value = true;
};

const reservarGuest = async () => {
  if (!curso.value || !formGuest.value.email) return;
  dialogGuestConfirm.value = false;
  reservando.value = true;
  try {
    const { error } = await supabase.rpc('add_to_waitlist', {
      p_course_id: curso.value.id,
      p_email_or_id: formGuest.value.email,
    });
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('reservasCursos.añadido') });
    await comprobarListaEspera(formGuest.value.email);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('errorDesconocido');
    $q.notify({ type: 'negative', message: t('reservasCursos.errorRegistrar', { mensaje: msg }) });
  } finally {
    reservando.value = false;
  }
};

const confirmarReservaAutenticado = () => {
  if (!aceptaCondiciones.value)
    return $q.notify({ type: 'warning', message: t('reservasCursos.aceptaCondiciones') });
  dialogConfirm.value = true;
};

const reservarAutenticado = async () => {
  if (!curso.value || !user.value) return;
  dialogConfirm.value = false;
  reservando.value = true;
  try {
    const { error } = await supabase.rpc('add_to_waitlist', {
      p_course_id: curso.value.id,
      p_email_or_id: user.value.id,
    });
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('reservasCursos.anadido') });
    await comprobarListaEspera();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('errorDesconocido');
    $q.notify({ type: 'negative', message: t('reservasCursos.errorRegistrar', { mensaje: msg }) });
  } finally {
    reservando.value = false;
  }
};

onMounted(async () => {
  zonaHorariaUsuario.value = zonaUsuario();
  await cargarUsuario();
  await cargarCurso();
  if (!autenticado.value) return;
  await comprobarListaEspera();
  if (esCerrado.value) {
    if (pagoOk.value) await esperarInscripcion();
    else await comprobarInscripcion();
  } else {
    await comprobarSuscripcion();
  }
});
</script>

<style scoped>
.rc-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
  padding-block: clamp(20px, 4vw, 40px) var(--sn-seccion);
}
.rc-volver {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 20px;
}
.rc-aviso {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  margin-bottom: 20px;
  border-radius: var(--sn-r-tarjeta);
  background: #eef5e4;
  color: var(--sn-oliva);
  font-weight: 600;
}
.rc-aviso__detalle {
  font-weight: 400;
  font-size: var(--sn-t-peq);
  margin-top: 4px;
}
.rc-rejilla {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}
@media (min-width: 900px) {
  .rc-rejilla {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 40px;
  }
  .rc-reserva {
    position: sticky;
    top: 120px;
  }
}

/* Información */
.rc-info {
  border-top: 6px solid var(--sn-sello);
  padding-top: 20px;
}
.rc-etiquetas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.rc-etiqueta {
  padding: 3px 12px;
  border-radius: var(--sn-r-boton);
  border: 1px solid var(--sn-borde);
  font-size: var(--sn-t-peq);
  font-weight: 700;
  color: var(--sn-tinta-suave);
}
.rc-etiqueta--sello {
  background: var(--sn-sello-tenue);
  border-color: transparent;
  color: var(--sn-sello);
}
.rc-h1 {
  font-size: var(--sn-t-h1);
  line-height: 1.1;
  margin: 0 0 12px;
  color: var(--sn-tinta);
}
.rc-h2 {
  font-size: var(--sn-t-h3);
  margin: 0 0 16px;
  color: var(--sn-tinta);
}
.rc-estado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0 0 20px;
  font-weight: 700;
}
.rc-estado__plazas {
  font-weight: 400;
  color: var(--sn-tinta-suave);
}
.rc-estado__punto {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--sn-tinta-suave);
}
.rc-estado__punto--abierto {
  background: var(--sn-oliva-vivo);
}
.rc-estado__punto--lleno {
  background: var(--sn-burdeos);
}
.rc-descripcion {
  white-space: pre-line;
  line-height: 1.65;
  max-width: var(--sn-prosa);
  margin: 0 0 24px;
}
.rc-datos {
  margin: 0;
  display: grid;
  gap: 14px;
  border-top: 1px solid var(--sn-borde);
  padding-top: 20px;
}
.rc-dato dt {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--sn-t-peq);
  font-weight: 700;
  color: var(--sn-tinta-suave);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rc-dato dd {
  margin: 4px 0 0;
  font-size: var(--sn-t-entrada);
  font-weight: 600;
}
.rc-dato__extra {
  display: block;
  font-size: var(--sn-t-peq);
  font-weight: 400;
  color: var(--sn-tinta-suave);
}

/* Reserva */
.rc-reserva {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
  padding: 24px;
}
.rc-bloque {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}
.rc-precio {
  margin: 0;
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  color: var(--sn-tinta);
}
.rc-precio__mes {
  font-size: var(--sn-t-cuerpo);
  color: var(--sn-tinta-suave);
}
.rc-precio__nota {
  display: block;
  font-family: var(--sn-fuente-texto);
  font-size: var(--sn-t-peq);
  font-weight: 400;
  color: var(--sn-tinta-suave);
}
.rc-texto {
  margin: 0;
  line-height: 1.55;
}
.rc-texto--fuerte {
  font-weight: 700;
}
.rc-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-weight: 700;
  color: var(--sn-oliva);
}
.rc-ok--espera {
  color: var(--sn-tinta);
}
.rc-boton {
  width: 100%;
}
.rc-pie {
  margin: 0;
  text-align: center;
  font-size: var(--sn-t-peq);
  color: var(--sn-tinta-suave);
}
.rc-vacio {
  text-align: center;
  padding-block: var(--sn-seccion);
}
.rc-vacio__icono {
  color: var(--sn-tinta-suave);
}
</style>
