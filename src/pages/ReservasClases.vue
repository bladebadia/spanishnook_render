<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h2 class="text-h4 text-primary text-weight-bold q-mb-xl text-center">
          {{ t('reservasClases.reservaTuClase') }}
        </h2>
      </div>

      <div class="col-12 col-md-5">
        <div v-if="user" class="q-mb-lg">
          <SaldoWallet
            :saldo-normal="saldoNormal"
            :saldo-conversacion="saldoConversacion"
            :loading="cargandoSaldo"
          />
        </div>

        <div
          v-if="carrito && carrito.length > 0"
          class="q-mb-lg bg-yellow-2 q-pa-md rounded-borders shadow-2"
        >
          <h5 class="carrito-titulo">🛒 {{ t('reservasClases.carritoDeReservas') }}</h5>
          <q-list separator>
            <q-item v-for="(reserva, index) in carrito" :key="index">
              <q-item-section>
                <q-item-label class="fecha-hora-carrito">
                  {{ formatFechaSeguro(reserva.fecha) }}
                </q-item-label>

                <q-item-label>
                  <span class="text-weight-bold text-primary" style="font-size: 1.1em">
                    {{ formatoRangoSeguro(reserva.fecha, reserva.hora) }}
                  </span>
                  <span class="text-caption text-grey-8 q-ml-xs"> (🇪🇸 {{ reserva.hora }}) </span>
                </q-item-label>

                <q-item-label caption>
                  {{
                    reserva.tipo === 'normal'
                      ? t('reservasClases.claseNormal')
                      : t('reservasClases.conversacion')
                  }}
                  ({{ reserva.tipo === 'normal' ? '32€' : '27€' }})
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  color="negative"
                  icon="delete"
                  @click="quitarDelCarrito(index)"
                  size="sm"
                  round
                  flat
                />
              </q-item-section>
            </q-item>
            <div class="q-mt-md text-center">
              <q-btn
                color="primary"
                class="btn-ir-carrito"
                :label="t('reservasClases.botonIrAlCarrito')"
                to="/CarritoCompra"
              />
            </div>
          </q-list>
        </div>

        <div class="q-mt-lg">
          <h5 class="reservas-titulo">{{ t('reservasClases.misReservasConfirmadas') }}</h5>

          <q-list
            bordered
            separator
            v-if="misReservasFuturas && misReservasFuturas.length > 0"
            class="rounded-borders bg-white"
          >
            <q-item v-for="reserva in misReservasFuturas" :key="reserva.id" class="q-py-md">
              <q-item-section avatar>
                <q-avatar :size="avatarSize" square>
                  <img :src="getIconoPersonalizado(reserva.tipo)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ formatFechaSeguro(reserva.fecha) }}
                </q-item-label>

                <q-item-label>
                  <span class="text-weight-bold text-primary" style="font-size: 1.1em">
                    {{ formatoRangoSeguro(reserva.fecha, reserva.hora) }}
                  </span>
                  <span class="text-caption text-grey-8 q-ml-xs">
                    (🇪🇸 {{ reserva.hora ? reserva.hora.slice(0, 5) : '--:--' }})
                  </span>
                </q-item-label>

                <q-item-label caption class="text-grey-8 q-mt-xs">
                  {{
                    reserva.tipo === 'normal'
                      ? t('reservasClases.claseNormal')
                      : t('reservasClases.conversacion')
                  }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge color="positive" outline label="Reservada" />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-grey q-mt-sm q-pa-md text-center border-dashed">
            {{ t('reservasClases.noTienesReservas') }}
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="q-mb-md">
          <q-card class="q-pa-md shadow-1 rounded-borders">
            <q-card-section class="q-pa-sm">
              <div class="text-h5 text-bold text-center q-mb-md">
                {{ t('reservasClases.tipoDeClase') }}
              </div>
              <q-option-group
                v-model="tipoClase"
                :options="opcionesTipoClase"
                color="primary"
                inline
                class="justify-center"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="q-mb-xl">
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
            landscape
            class="custom-calendar shadow-1 rounded-borders"
            today-btn
            mask="YYYY-MM-DD"
            color="primary"
            text-color="white"
            first-day-of-week="1"
          />
        </div>

        <div v-if="fechaSeleccionada" class="q-mt-lg">
          <h5 class="horarios-titulo">
            {{ t('reservasClases.horariosDisponiblesPara') }}
            <span class="fecha-seleccionada">{{ formatFechaSeguro(fechaSeleccionada) }}</span>
          </h5>

          <div
            v-if="horariosDisponiblesFiltrados && horariosDisponiblesFiltrados.length > 0"
            class="row q-gutter-sm q-mt-md justify-center"
          >
            <q-btn
              v-for="hora in horariosDisponiblesFiltrados"
              :key="hora"
              :color="estaEnCarrito(hora) ? 'orange' : 'primary'"
              @click="agregarAlCarrito(hora)"
              outline
              class="time-btn"
              style="min-width: 100px"
            >
              <span class="text-weight-bold" style="font-size: 1.1em">
                {{ formatoHoraInicioSegura(fechaSeleccionada, hora) }}
              </span>
            </q-btn>
          </div>

          <div v-else class="text-grey q-mt-md text-center">
            <q-icon name="event_busy" /> {{ t('reservasClases.noHayHuecosLibres') }}
          </div>
        </div>
      </div>
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
import { useQuasar } from 'quasar';

import '../css/pages/ClasesIndividuales.css';
import '../css/pages/EstilosGenerales.css';

// --- Inicialización ---
const $q = useQuasar();
const { t } = useI18n();
const { user } = useAuth();

// --- Estados Locales ---
const cargando = ref(true);
const saldoNormal = ref(0);
const saldoConversacion = ref(0);
const cargandoSaldo = ref(false);

const BUCKET_URL = 'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/';

// --- Composable Principal ---
const {
  fechaSeleccionada,
  misReservasFuturas,
  carrito,
  tipoClase,
  opcionesTipoClase,
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

const formatFechaSeguro = (fechaStr: string | undefined | null) => {
  if (!fechaStr) return '...';
  try {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;

    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(fecha);
  } catch (e) {
    console.warn(e);
    return fechaStr;
  }
};

const formatoRangoSeguro = (fechaStr: string | undefined, horaStr: string | undefined) => {
  if (!fechaStr || !horaStr) return '...';

  try {
    // 1. Parsear hora Madrid
    const partes = horaStr.split(':');
    if (partes.length < 2) return horaStr;
    const h = Number(partes[0]);
    const m = Number(partes[1]);
    if (isNaN(h) || isNaN(m)) return horaStr;

    // 2. Calcular Offset con Madrid
    const now = new Date();
    const strMadrid = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const dateMadrid = new Date(strMadrid);
    const diff = now.getTime() - dateMadrid.getTime();

    // 3. Crear fecha base (con la hora de Madrid)
    // Usamos fechaStr para tener el día correcto
    const baseDate = new Date(fechaStr);
    baseDate.setHours(h, m, 0, 0);

    // 4. Aplicar diferencia para obtener hora local
    const localStart = new Date(baseDate.getTime() + diff);

    // 5. Calcular fin (60 minutos para clases individuales)
    const localEnd = new Date(localStart.getTime() + 60 * 60000);

    // 6. Formatear HH:MM
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return `${fmt(localStart)} - ${fmt(localEnd)}`;
  } catch (e) {
    console.warn(e);
    return horaStr;
  }
};

const formatoHoraInicioSegura = (fechaStr: string | undefined, horaStr: string | undefined) => {
  if (!fechaStr || !horaStr) return '--:--';
  try {
    // 1. Parsear
    const partes = horaStr.split(':');
    if (partes.length < 2) return horaStr;
    const h = Number(partes[0]);
    const m = Number(partes[1]);
    if (isNaN(h) || isNaN(m)) return horaStr;

    // 2. Offset Madrid
    const now = new Date();
    const strMadrid = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const dateMadrid = new Date(strMadrid);
    const diff = now.getTime() - dateMadrid.getTime();

    // 3. Base
    const baseDate = new Date(fechaStr);
    baseDate.setHours(h, m, 0, 0);

    // 4. Local
    const localStart = new Date(baseDate.getTime() + diff);

    return localStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    console.warn(e);
    return horaStr.slice(0, 5);
  }
};

// --- Métodos Auxiliares ---
const getIconoPersonalizado = (tipo: string | undefined) => {
  if (tipo === 'conversacion') return `${BUCKET_URL}iconoconv.svg`;
  return `${BUCKET_URL}iconoindiv.svg`;
};

const avatarSize = computed(() => {
  if ($q.screen.lt.sm) return '60px';
  if ($q.screen.lt.md) return '80px';
  return '100px';
});

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
    await inicializar();
    if (user.value) {
      await cargarSaldoUsuario();
    }
  } catch (e) {
    console.error('Error inicializando la página:', e);
    $q.notify({
      type: 'negative',
      message: 'Error cargando datos de la página',
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
.border-dashed {
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.carrito-titulo {
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.fecha-hora-carrito {
  font-weight: bold;
}

:deep(.btn-ir-carrito .q-btn__content) {
  font-weight: bold;
}

.reservas-titulo {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  margin-bottom: 1rem;
}

.horarios-titulo {
  font-size: 1.1rem;
  margin: 0;
  margin-bottom: 0.5rem;
  text-align: center;
}

.fecha-seleccionada {
  font-weight: bold;
  color: #851319;
}

.time-btn {
  transition: transform 0.1s;
}
.time-btn:active {
  transform: scale(0.95);
}

:deep(.q-option-group) {
  text-align: center;
}

:deep(.q-option-group .q-radio__label) {
  font-weight: bold;
  color: #851319;
}
</style>
