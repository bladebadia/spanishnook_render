<template>
  <q-page class="rs-pagina">
    <section class="sn-contenedor rs-cabecera">
      <h1 class="rs-h1">{{ t('reservasClases.reservaTuClase') }}</h1>
      <p class="rs-entrada">{{ t('ReservasPagina.entrada') }}</p>
    </section>

    <div class="sn-contenedor rs-rejilla">
      <!-- Pasos: tipo, día y hora -->
      <div class="rs-pasos">
        <!-- 1. Tipo de clase -->
        <section class="rs-paso">
          <h2 class="rs-paso__titulo"><span class="rs-paso__num">1</span>{{ t('reservasClases.tipoDeClase') }}</h2>
          <div class="rs-tipos" role="radiogroup">
            <button
              v-for="tipo in tipos"
              :key="tipo.valor"
              type="button"
              role="radio"
              :aria-checked="tipoClase === tipo.valor"
              class="rs-tipo"
              :class="[tipo.sello, { 'rs-tipo--elegido': tipoClase === tipo.valor }]"
              @click="tipoClase = tipo.valor"
            >
              <span class="rs-tipo__radio" />
              <span class="rs-tipo__texto">
                <span class="rs-tipo__nombre">{{ tipo.nombre }}</span>
                <span class="rs-tipo__precio">{{ tipo.precio }}</span>
                <q-no-ssr>
                  <span v-if="user && tipo.creditos > 0" class="rs-tipo__creditos">
                    {{ t('ReservasPagina.creditos', { n: tipo.creditos }, tipo.creditos) }}
                  </span>
                </q-no-ssr>
              </span>
            </button>
          </div>
        </section>

        <!-- 2. Día -->
        <section class="rs-paso">
          <h2 class="rs-paso__titulo"><span class="rs-paso__num">2</span>{{ t('ReservasPagina.dia') }}</h2>
          <div v-if="cargando" class="text-center q-pa-xl">
            <q-spinner color="primary" size="3em" />
            <div class="text-grey q-mt-md">{{ t('reservasClases.cargandoDisponibilidad') }}</div>
          </div>
          <q-date
            v-else
            v-model="fechaSeleccionada"
            :options="opcionesFechasComputed"
            :min="fechaMinima"
            :max="fechaMaxima"
            :events="fechasConEventos"
            event-color="red-9"
            minimal
            class="rs-calendario"
            mask="YYYY-MM-DD"
            color="primary"
            first-day-of-week="1"
          />
        </section>

        <!-- 3. Hora -->
        <section class="rs-paso">
          <h2 class="rs-paso__titulo"><span class="rs-paso__num">3</span>{{ t('ReservasPagina.hora') }}</h2>
          <p v-if="!fechaSeleccionada" class="rs-ayuda">{{ t('ReservasPagina.eligeDia') }}</p>
          <template v-else>
            <p class="rs-ayuda">
              {{ formatFechaSeguro(fechaSeleccionada) }}
              <q-no-ssr>
                <span v-if="zonaHorariaUsuario"> · {{ t('ReservasPagina.tuZona', { zona: zonaHorariaUsuario }) }}</span>
              </q-no-ssr>
            </p>
            <q-no-ssr>
              <div v-if="horariosDisponiblesFiltrados && horariosDisponiblesFiltrados.length > 0" class="rs-horas">
                <button
                  v-for="hora in horariosDisponiblesFiltrados"
                  :key="hora"
                  type="button"
                  class="rs-hora"
                  :class="{ 'rs-hora--elegida': estaEnCarrito(hora) }"
                  @click="agregarAlCarrito(hora)"
                >
                  <q-icon v-if="estaEnCarrito(hora)" name="check" size="16px" />
                  {{ formatoHoraInicioSegura(fechaSeleccionada, hora) }}
                </button>
              </div>
              <p v-else class="rs-ayuda">
                <q-icon name="event_busy" /> {{ t('reservasClases.noHayHuecosLibres') }}
              </p>
            </q-no-ssr>
          </template>
        </section>
      </div>

      <!-- Lateral: carrito, créditos y próximas clases -->
      <aside class="rs-lateral">
        <q-no-ssr>
          <section class="rs-caja sn-nota">
            <h2 class="rs-caja__titulo">
              <q-icon name="shopping_cart" />
              {{ t('reservasClases.carritoDeReservas') }}
              <span v-if="carrito.length" class="rs-contador">{{ carrito.length }}</span>
            </h2>
            <p v-if="!carrito.length" class="rs-ayuda q-mb-none">{{ t('ReservasPagina.carritoVacio') }}</p>
            <ul v-else class="rs-lista">
              <li v-for="(reserva, index) in carrito" :key="index" class="rs-lista__item">
                <span
                  class="rs-marca"
                  :class="reserva.tipo === 'normal' ? 'sn-sello-general' : 'sn-sello-conversacion'"
                />
                <span class="rs-lista__texto">
                  <strong>{{ formatFechaClaseSegura(reserva.fecha, reserva.hora) }}</strong>
                  <span>
                    {{ formatoRangoSeguro(reserva.fecha, reserva.hora) }}
                    <span class="rs-madrid">(🇪🇸 {{ reserva.hora }})</span>
                  </span>
                  <span class="rs-madrid">
                    {{ reserva.tipo === 'normal' ? t('reservasClases.claseNormal') : t('reservasClases.conversacion') }}
                    · {{ reserva.tipo === 'normal' ? '32 €' : '27 €' }}
                  </span>
                </span>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  :aria-label="t('ReservasPagina.quitar')"
                  @click="quitarDelCarrito(index)"
                />
              </li>
            </ul>
            <q-btn
              v-if="carrito.length"
              color="primary"
              unelevated
              no-caps
              class="full-width q-mt-md"
              icon-right="arrow_forward"
              to="/CarritoCompra"
              :label="t('reservasClases.botonIrAlCarrito')"
            />
          </section>

          <div v-if="user" class="q-mt-md">
            <SaldoWallet
              :saldo-normal="saldoNormal"
              :saldo-conversacion="saldoConversacion"
              :loading="cargandoSaldo"
            />
          </div>

          <section v-if="misReservasFuturas && misReservasFuturas.length > 0" class="rs-caja q-mt-md">
            <h2 class="rs-caja__titulo">
              <q-icon name="event_available" />
              {{ t('reservasClases.misReservasConfirmadas') }}
            </h2>
            <ul class="rs-lista">
              <li v-for="reserva in misReservasFuturas" :key="reserva.id" class="rs-lista__item">
                <span
                  class="rs-marca"
                  :class="reserva.tipo === 'normal' ? 'sn-sello-general' : 'sn-sello-conversacion'"
                />
                <span class="rs-lista__texto">
                  <strong>{{ formatFechaClaseSegura(reserva.fecha, reserva.hora) }}</strong>
                  <span>
                    {{ formatoRangoSeguro(reserva.fecha, reserva.hora) }}
                    <span class="rs-madrid">(🇪🇸 {{ reserva.hora ? reserva.hora.slice(0, 5) : '--:--' }})</span>
                  </span>
                  <span class="rs-madrid">
                    {{ reserva.tipo === 'normal' ? t('reservasClases.claseNormal') : t('reservasClases.conversacion') }}
                  </span>
                </span>
              </li>
            </ul>
          </section>
        </q-no-ssr>
      </aside>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReservasClases } from 'src/composables/useReservasClases';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import SaldoWallet from 'components/SaldoWallet.vue';
import { useQuasar, useMeta } from 'quasar';
import {
  formatFechaCalendario,
  formatFechaClaseLocal,
  horaInicioLocal,
  rangoHoraLocal,
  zonaUsuario,
} from 'src/utils/zonaHoraria';

import '../css/pages/ClasesIndividuales.css';
import '../css/pages/EstilosGenerales.css';

// --- Inicialización ---
const $q = useQuasar();
const { t, locale } = useI18n();
const { user } = useAuth();

useMeta(() => ({
  title: 'Reservar Clases Individuales | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Reserva clases individuales de español online con profesores nativos. Clases particulares y de conversación con horarios flexibles en SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'reservar clase español, clases particulares español online, clases conversación español, horarios clases español, profesor nativo español, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Reservar Clases Individuales | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Reserva clases individuales y de conversación de español online con profesores nativos y horarios flexibles.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/Reservas',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

// --- Estados Locales ---
const cargando = ref(true);
const saldoNormal = ref(0);
const saldoConversacion = ref(0);
const cargandoSaldo = ref(false);

// SOLUCIÓN MISMATCH ZONA HORARIA: Inicializar vacío y llenar en cliente
const zonaHorariaUsuario = ref('');

// --- Composable Principal ---
const {
  fechaSeleccionada,
  misReservasFuturas,
  carrito,
  tipoClase,
  fechaMinima,
  fechaMaxima,
  fechasConEventos,
  horariosDisponiblesFiltrados,
  opcionesFechasComputed,
  estaEnCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  inicializar,
} = useReservasClases();

// --- FUNCIONES SEGURAS + ZONA HORARIA REAL ---

const formatFechaSeguro = (fechaStr: string | undefined | null) =>
  fechaStr ? formatFechaCalendario(fechaStr, locale.value) : '...';

// Fecha de la clase tal como la vive el alumno (puede ser otro día que en Madrid)
const formatFechaClaseSegura = (fechaStr: string | undefined, horaStr: string | undefined) =>
  fechaStr && horaStr ? formatFechaClaseLocal(fechaStr, horaStr, locale.value) : '...';

const formatoRangoSeguro = (fechaStr: string | undefined, horaStr: string | undefined) =>
  fechaStr && horaStr ? rangoHoraLocal(fechaStr, horaStr, 60) : '...';

const formatoHoraInicioSegura = (fechaStr: string | undefined, horaStr: string | undefined) =>
  fechaStr && horaStr ? horaInicioLocal(fechaStr, horaStr) : '--:--';

// Tarjetas del paso 1 (precio fijado en el servidor; aquí solo se muestra)
const tipos = computed(() => [
  {
    valor: 'normal' as const,
    nombre: t('reservasClases.claseNormal'),
    precio: '32 €',
    creditos: saldoNormal.value,
    sello: 'sn-sello-general',
  },
  {
    valor: 'conversacion' as const,
    nombre: t('reservasClases.claseConversacion'),
    precio: '27 €',
    creditos: saldoConversacion.value,
    sello: 'sn-sello-conversacion',
  },
]);

const cargarSaldoUsuario = async () => {
  if (!user.value?.id) return;

  cargandoSaldo.value = true;
  try {
    const { data, error } = await supabase
      .from('datos_usuarios')
      .select('saldo_normal, saldo_conversacion')
      .eq('user_id', user.value.id)
      .single();

    if (error) throw error;

    if (data) {
      saldoNormal.value = data.saldo_normal || 0;
      saldoConversacion.value = data.saldo_conversacion || 0;
    }
  } catch (e) {
    console.error('Error cargando saldo:', e);
  } finally {
    cargandoSaldo.value = false;
  }
};

// --- Ciclo de Vida ---
onMounted(async () => {
  try {
    cargando.value = true;

    // Obtenemos la zona horaria en el cliente para no pelear con el servidor
    zonaHorariaUsuario.value = zonaUsuario();

    await inicializar();
    if (user.value) {
      await cargarSaldoUsuario();
    }
  } catch (e) {
    console.error('Error inicializando la página:', e);
    $q.notify({
      type: 'negative',
      message: t('reservasClases.errorCargando'),
    });
  } finally {
    cargando.value = false;
  }
});

watch(
  () => user.value,
  async (nuevoUsuario) => {
    if (nuevoUsuario?.id) {
      await cargarSaldoUsuario();
    }
  },
);
</script>

<style scoped>
.rs-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
  padding-bottom: var(--sn-seccion);
}
.rs-cabecera {
  padding-block: clamp(28px, 5vw, 48px) 20px;
  text-align: center;
}
.rs-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 0 10px;
}
.rs-entrada {
  font-size: var(--sn-t-entrada);
  color: var(--sn-tinta-suave);
  margin: 0 auto;
  max-width: 56ch;
}

.rs-rejilla {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}
@media (min-width: 1000px) {
  .rs-rejilla {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 32px;
  }
  .rs-lateral {
    position: sticky;
    top: 120px;
  }
}

/* Pasos */
.rs-pasos {
  display: grid;
  gap: 16px;
}
.rs-paso {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
  padding: clamp(16px, 4vw, 24px);
}
.rs-paso__titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  margin: 0 0 16px;
}
.rs-paso__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sn-burdeos);
  color: #fff;
  font-size: 0.95rem;
}
.rs-ayuda {
  color: var(--sn-tinta-suave);
  margin: 0 0 12px;
}

/* 1. Tipo */
.rs-tipos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 560px) {
  .rs-tipos {
    grid-template-columns: 1fr 1fr;
  }
}
.rs-tipo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: var(--sn-hoja);
  border: 2px solid var(--sn-borde);
  border-radius: 12px;
  font: inherit;
  color: var(--sn-tinta);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}
.rs-tipo:hover {
  border-color: var(--sn-sello);
}
.rs-tipo--elegido {
  border-color: var(--sn-sello);
  background: var(--sn-sello-tenue);
}
.rs-tipo__radio {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border-radius: 50%;
  border: 2px solid var(--sn-sello);
  background: var(--sn-hoja);
}
.rs-tipo--elegido .rs-tipo__radio {
  box-shadow: inset 0 0 0 4px var(--sn-hoja);
  background: var(--sn-sello);
}
.rs-tipo__texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rs-tipo__nombre {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  color: var(--sn-sello);
}
.rs-tipo__precio {
  font-weight: 700;
}
.rs-tipo__creditos {
  font-size: var(--sn-t-peq);
  color: var(--sn-oliva);
  font-weight: 700;
}

/* 2. Calendario */
.rs-calendario {
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
  display: block;
  box-shadow: none;
  border: 1px solid var(--sn-borde);
}

/* 3. Horas */
.rs-horas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 10px;
}
.rs-hora {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 44px;
  border: 2px solid var(--sn-burdeos);
  border-radius: var(--sn-r-boton);
  background: var(--sn-hoja);
  color: var(--sn-burdeos);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.rs-hora:hover {
  background: var(--sn-burdeos-tenue);
}
.rs-hora--elegida {
  background: var(--sn-burdeos);
  color: #fff;
}

/* Lateral */
.rs-caja {
  padding: 18px 20px;
  border-radius: var(--sn-r-tarjeta);
}
.rs-caja:not(.sn-nota) {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
}
.rs-caja__titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  margin: 0 0 12px;
}
.rs-contador {
  margin-left: auto;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: var(--sn-r-boton);
  background: var(--sn-burdeos);
  color: #fff;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rs-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.rs-lista__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.rs-lista__item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.rs-marca {
  flex: none;
  align-self: stretch;
  width: 5px;
  border-radius: 3px;
  background: var(--sn-sello);
}
.rs-lista__texto {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}
.rs-madrid {
  font-size: var(--sn-t-peq);
  color: var(--sn-tinta-suave);
}
</style>
