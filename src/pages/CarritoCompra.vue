<template>
  <q-page class="q-pa-lg">
    <div
      class="titulo-responsivo2 row items-center justify-between q-mb-md"
      style="font-size: 2.3rem; font-weight: 800"
    >
      🛒 {{ t('carrito.carritoDeReservas') }}

      <div style="min-width: 250px" v-if="usuarioLogueado">
        <SaldoWallet
          :saldo-normal="saldoNormal"
          :saldo-conversacion="saldoConversacion"
          :loading="cargandoSaldo"
        />

        <div class="q-mt-sm text-right">
          <q-checkbox
            v-model="usarCreditosGlobal"
            :label="t('carrito.utilizarCreditos')"
            color="green"
            dense
            class="checkbox-creditos"
            @update:model-value="recalcularAplicacionCreditos"
            :disable="saldoNormal === 0 && saldoConversacion === 0"
          />
        </div>
      </div>
    </div>

    <div v-if="carrito.length === 0" class="text-center q-mt-xl">
      <q-icon name="shopping_cart" size="100px" color="grey-4" />
      <p class="text-grey q-mt-md">{{ t('carrito.tuCarritoEstaVacio') }}</p>
      <q-btn color="primary" :label="t('carrito.reservarClases')" to="/Reservas" class="q-mt-md" />
    </div>

    <div v-else>
      <q-list bordered class="q-mb-lg separator">
        <q-item
          v-for="(reserva, index) in carrito"
          :key="index"
          class="q-py-md"
          :class="{ 'bg-negative-1': esReservaConflictiva(reserva) }"
        >
          <div class="row full-width items-center">
            <div class="col-auto q-pr-md">
              <q-avatar size="100px" square>
                <img :src="getIconoPersonalizado(reserva.tipo)" alt="Icono Clase" />
              </q-avatar>
            </div>

            <div class="col-grow">
              <div class="resumen-fecha" :class="{ 'text-white': esReservaConflictiva(reserva) }">
                <div>{{ formatFecha(reserva.fecha) }}</div>

                <div class="text-weight-bold" style="font-size: 1.3rem; line-height: 1.2">
                  {{ obtenerRangoLocalSeguro(reserva.fecha, reserva.hora) }}
                </div>

                <div
                  class="text-caption"
                  style="opacity: 0.8; font-weight: normal; font-size: 0.85rem"
                >
                  (🇪🇸 {{ formatHorarioMadrid(reserva.hora) }} Madrid)
                </div>
              </div>

              <div class="text-caption" :class="{ 'text-white': esReservaConflictiva(reserva) }">
                {{
                  reserva.tipo === 'normal'
                    ? t('carrito.claseNormal')
                    : t('carrito.claseConversacion')
                }}
                <span
                  v-if="esReservaConflictiva(reserva)"
                  class="text-white text-weight-bold q-ml-sm"
                >
                  ⚠️ {{ t('carrito.horaOcupada') }}
                </span>
              </div>
            </div>

            <div class="col-auto text-right flex items-center q-gutter-x-md">
              <div v-if="!esReservaConflictiva(reserva)">
                <div v-if="reserva.usarCredito" class="text-green text-weight-bold text-h6">
                  0€
                  <span class="text-caption text-grey strike-through">{{
                    reserva.tipo === 'normal' ? '32€' : '27€'
                  }}</span>
                  <q-badge color="green" floating transparent rounded>CREDIT</q-badge>
                </div>
                <div v-else class="text-h6 text-primary">
                  {{ reserva.tipo === 'normal' ? '32€' : '27€' }}
                </div>
              </div>

              <q-btn
                color="negative"
                icon="delete"
                @click="quitarDelCarrito(index)"
                flat
                round
                :class="{ 'text-white': esReservaConflictiva(reserva) }"
              />
            </div>
          </div>
        </q-item>
      </q-list>

      <div class="bg-yellow-2 q-pa-md rounded-borders q-mb-lg">
        <h6 class="resumen-titulo">{{ t('carrito.resumenDelPedido') }}</h6>
        <div class="row justify-between items-center">
          <span class="numero-reservas"
            >{{ carrito.length }} {{ t('carrito.reserva', { count: carrito.length }) }}</span
          >

          <div class="text-right">
            <div class="total-precio text-primary text-weight-bold">
              Total: {{ totalPagarDinero }}€
            </div>
            <div v-if="totalGastarCreditos > 0" class="text-caption text-green">
              ({{ t('carrito.seCanjearan') }} {{ totalGastarCreditos }}
              {{ t('carrito.credito', { count: totalGastarCreditos }) }})
            </div>
          </div>
        </div>

        <div v-if="reservasConflictivas.length > 0" class="text-negative q-mt-sm">
          ⚠️ {{ reservasConflictivas.length }}
          {{ t('carrito.reservaNoDisponible', { count: reservasConflictivas.length }) }}
        </div>
      </div>

      <div class="row q-gutter-md justify-end">
        <q-btn color="grey" :label="t('carrito.seguir')" to="/Reservas" outline />

        <q-btn
          color="primary"
          class="btn-confirmar"
          :label="
            totalPagarDinero === 0 ? t('carrito.canjear') : t('carrito.pagarYConfirmarReservas')
          "
          @click="confirmarReservasHibridas"
          :disable="!usuarioLogueado || reservasConflictivas.length > 0"
          :loading="confirmando"
          :icon="totalPagarDinero === 0 ? 'check_circle' : 'credit_card'"
        />
      </div>

      <q-banner v-if="!usuarioLogueado" class="bg-warning text-dark q-mt-md">
        ⚠️ {{ t('carrito.debesIniciarSesion') }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import SaldoWallet from 'components/SaldoWallet.vue';
import { useRouter } from 'vue-router';
// ELIMINADO: import { useHorarios } from 'src/composables/useHorarios';

const { t, locale } = useI18n();
const { user } = useAuth();
const $q = useQuasar();
const router = useRouter(); // 2. Inicializar

// --- 1. FUNCIÓN LOCAL SEGURA (Sustituye a useHorarios) ---
// Calcula hora local usuario = Hora Madrid + Offset Real. Duración 60 min.
const obtenerRangoLocalSeguro = (fechaStr: string, horaStr: string) => {
  if (!fechaStr || !horaStr) return '...';

  try {
    // 1. Validar y parsear hora (HH:MM)
    const partes = horaStr.split(':');
    if (partes.length < 2) return horaStr;

    const h = Number(partes[0]);
    const m = Number(partes[1]);

    if (isNaN(h) || isNaN(m)) return horaStr;

    // 2. Calcular diferencia horaria con Madrid
    const now = new Date();
    // Forzamos interpretación en Madrid para saber qué hora es allí
    const strEnMadrid = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const fechaEnMadrid = new Date(strEnMadrid);

    // Diferencia en ms (Local - Madrid)
    const diffMs = now.getTime() - fechaEnMadrid.getTime();

    // 3. Crear fecha base usando la fecha de la reserva y la hora seleccionada
    const fechaBase = new Date(fechaStr);
    fechaBase.setHours(h, m, 0, 0);

    // 4. Aplicar la diferencia para obtener la hora de inicio local
    const fechaLocalInicio = new Date(fechaBase.getTime() + diffMs);

    // 5. Calcular fin (+60 minutos para clases individuales)
    const fechaLocalFin = new Date(fechaLocalInicio.getTime() + 60 * 60000);

    // 6. Formatear
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return `${fmt(fechaLocalInicio)} - ${fmt(fechaLocalFin)}`;
  } catch (e) {
    console.warn('Error calculando rango local:', e);
    return horaStr;
  }
};

// --- FORMATO MADRID (Para referencia visual) ---
const formatHorarioMadrid = (horaInicio: string) => {
  if (!horaInicio) return '';
  const limpia = horaInicio.slice(0, 5);
  const partes = limpia.split(':');

  if (partes.length < 2) return limpia;

  const h = Number(partes[0]);
  const m = Number(partes[1]);

  if (isNaN(h) || isNaN(m)) return limpia;

  // Calculamos fin (+60 minutos matemáticamente)
  const totalMinutos = h * 60 + m + 60;
  const hFin = Math.floor(totalMinutos / 60) % 24;
  const mFin = totalMinutos % 60;

  const hFinStr = hFin.toString().padStart(2, '0');
  const mFinStr = mFin.toString().padStart(2, '0');

  return `${limpia} - ${hFinStr}:${mFinStr}`;
};

interface ReservaCarrito {
  fecha: string;
  hora: string;
  tipo: 'normal' | 'conversacion';
  usarCredito?: boolean;
}

interface OcupacionAnonima {
  fecha: string;
  hora: string;
}

const carrito = ref<ReservaCarrito[]>([]);
const confirmando = ref(false);
const reservasConflictivas = ref<ReservaCarrito[]>([]);

// Saldos
const saldoNormal = ref(0);
const saldoConversacion = ref(0);
const cargandoSaldo = ref(false);
const usarCreditosGlobal = ref(false);
const usuarioLogueado = computed(() => !!user.value?.id);

const BUCKET_URL = 'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/';

const getIconoPersonalizado = (tipo: string | undefined) => {
  if (tipo === 'conversacion') return `${BUCKET_URL}iconoconv.svg`;
  return `${BUCKET_URL}iconoindiv.svg`;
};

// --- CARGA INICIAL ---
onMounted(async () => {
  cargarCarrito();
  if (user.value?.id) {
    cargandoSaldo.value = true;
    try {
      const { data } = await supabase
        .from('datos_usuarios')
        .select('saldo_normal, saldo_conversacion')
        .eq('user_id', user.value.id)
        .single();

      if (data) {
        saldoNormal.value = data.saldo_normal || 0;
        saldoConversacion.value = data.saldo_conversacion || 0;
      }
    } catch (e) {
      console.error('Error cargando saldo', e);
    } finally {
      cargandoSaldo.value = false;
    }
  }
  void verificarDisponibilidad();
});

// --- LÓGICA DE CRÉDITOS ---
const recalcularAplicacionCreditos = () => {
  carrito.value.forEach((item) => (item.usarCredito = false));

  if (!usarCreditosGlobal.value) {
    guardarCarrito();
    return;
  }

  let disponiblesNormal = saldoNormal.value;
  let disponiblesConv = saldoConversacion.value;

  carrito.value.forEach((item) => {
    if (item.tipo === 'normal') {
      if (disponiblesNormal > 0) {
        item.usarCredito = true;
        disponiblesNormal--;
      }
    } else if (item.tipo === 'conversacion') {
      if (disponiblesConv > 0) {
        item.usarCredito = true;
        disponiblesConv--;
      }
    }
  });

  guardarCarrito();
};

const totalPagarDinero = computed(() => {
  return carrito.value.reduce((sum, reserva) => {
    if (reserva.usarCredito) return sum;
    return sum + (reserva.tipo === 'normal' ? 32 : 27);
  }, 0);
});

const totalGastarCreditos = computed(() => carrito.value.filter((c) => c.usarCredito).length);

// --- PAGO Y CONFIRMACIÓN ---
const confirmarReservasHibridas = async () => {
  // 1. Verificaciones iniciales
  if (!usuarioLogueado.value || reservasConflictivas.value.length > 0) return;

  // 2. RE-VERIFICACIÓN DE SEGURIDAD
  await verificarDisponibilidad();
  if (reservasConflictivas.value.length > 0) {
    $q.notify({ type: 'warning', message: '¡Vaya! Alguien se ha adelantado en una clase.' });
    confirmando.value = false;
    return;
  }

  confirmando.value = true;

  try {
    const itemsConCredito = carrito.value.filter((i) => i.usarCredito);
    const itemsConTarjeta = carrito.value.filter((i) => !i.usarCredito);

    const reservasParaEmail: { fecha: string; hora: string; tipo: string; meet_link?: string }[] =
      [];

    // A. PAGAR CON CRÉDITOS
    if (itemsConCredito.length > 0) {
      for (const item of itemsConCredito) {
        // A.1. Crear reserva en BBDD (RPC)
        const { data, error } = await supabase.rpc('reservar_con_credito', {
          p_user_id: user.value!.id,
          p_tipo_clase: item.tipo,
          p_fecha: item.fecha,
          p_hora: item.hora,
          p_precio: item.tipo === 'normal' ? 32 : 27,
          p_meet_link: null,
        });

        if (error || !data.success) {
          throw new Error(data?.message || error?.message || 'Error desconocido');
        }

        // A.2. Generar Link de Google Meet
        const nuevaReservaId = data.reserva_id;
        let linkGenerado = null;

        if (nuevaReservaId) {
          try {
            // 1. Invocamos la función para que genere el link y lo guarde en DB
            await supabase.functions.invoke('crear-meet', {
              body: { reservaId: nuevaReservaId },
            });

            // 2. RECUPERACIÓN SEGURA: Leemos la reserva de la BBDD para obtener el link real
            // Esto asegura que tenemos el link aunque la función 'crear-meet' no lo devuelva en el body
            const { data: reservaActualizada } = await supabase
              .from('reservas')
              .select('meet_link')
              .eq('id', nuevaReservaId)
              .single();

            if (reservaActualizada && reservaActualizada.meet_link) {
              linkGenerado = reservaActualizada.meet_link;
            }
          } catch (e) {
            console.error('Error generando meet:', e);
            // No bloqueamos el flujo, pero el link irá vacío
          }
        }

        // A.3. Añadir a la lista de emails con el link recuperado
        reservasParaEmail.push({
          fecha: item.fecha,
          hora: item.hora,
          tipo: item.tipo === 'normal' ? 'individual' : 'conversacion',
          meet_link: linkGenerado || undefined,
        });
      }

      // A.4. Enviar Email Resumen
      if (reservasParaEmail.length > 0) {
        try {
          console.log('📨 Enviando resumen con links:', reservasParaEmail);
          await supabase.functions.invoke('send-booking-email', {
            body: {
              reservas: reservasParaEmail,
              userId: user.value!.id,
            },
          });
          console.log('✅ Email enviado.');
        } catch (e) {
          console.error('Error no bloqueante enviando email:', e);
        }
      }
    }

    // B. PAGAR CON TARJETA O FINALIZAR
    if (itemsConTarjeta.length > 0) {
      await irAStripe(itemsConTarjeta);
    } else {
      $q.notify({ type: 'positive', message: '¡Reservas confirmadas! 📧' });
      carrito.value = [];
      guardarCarrito();

      // Navegación suave
      await router.push('/AreaPersonal');
    }
  } catch (err: unknown) {
    console.error('Error pago:', err);
    const mensaje = err instanceof Error ? err.message : 'Error procesando la reserva';
    $q.notify({ type: 'negative', message: mensaje });
  } finally {
    confirmando.value = false;
  }
};

const irAStripe = async (items: ReservaCarrito[]) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const reservasMetadata = items.map((r) => ({
    fecha: r.fecha,
    hora: r.hora,
    tipo: r.tipo,
  }));

  const res = await fetch('https://zleqsdfpjepdangitcxv.supabase.co/functions/v1/stripe-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      reservas: reservasMetadata,
      user_id: user.value!.id,
      user_email: user.value?.email,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error conectando con Stripe');
  }

  const responseData = await res.json();
  if (!responseData.url) throw new Error('No se obtuvo URL de Stripe');

  window.location.href = responseData.url;
};

// --- UTILIDADES ---
const cargarCarrito = () => {
  const carritoGuardado = localStorage.getItem('carritoReservas');
  if (carritoGuardado) {
    try {
      carrito.value = JSON.parse(carritoGuardado);
    } catch {
      carrito.value = [];
    }
  }
};

const guardarCarrito = () => {
  localStorage.setItem('carritoReservas', JSON.stringify(carrito.value));
};

const quitarDelCarrito = (index: number) => {
  const reservaEliminada = carrito.value[index];
  carrito.value.splice(index, 1);
  recalcularAplicacionCreditos();

  if (reservaEliminada) {
    reservasConflictivas.value = reservasConflictivas.value.filter(
      (c) => c && !(c.fecha === reservaEliminada.fecha && c.hora === reservaEliminada.hora),
    );
  }
};

const formatFecha = (fecha: string) => {
  const fechaFormateada = new Date(fecha).toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
};

const verificarDisponibilidad = async () => {
  try {
    if (carrito.value.length === 0) {
      reservasConflictivas.value = [];
      return;
    }

    const { data: todasOcupadas, error } = await supabase.rpc('obtener_ocupacion');
    if (error) throw error;

    const ocupacionReal = (todasOcupadas || []) as OcupacionAnonima[];
    reservasConflictivas.value = carrito.value.filter((itemCarrito) => {
      return ocupacionReal.some((ocupada) => {
        const horaOcupada = ocupada.hora.substring(0, 5);
        return ocupada.fecha === itemCarrito.fecha && horaOcupada === itemCarrito.hora;
      });
    });
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
  }
};

const esReservaConflictiva = (reserva: ReservaCarrito) => {
  return reservasConflictivas.value.some(
    (c) => c.fecha === reserva.fecha && c.hora === reserva.hora,
  );
};
</script>

<style scoped>
.bg-negative-1 {
  background-color: #851319;
}
.text-h6 {
  font-weight: 500;
}
.text-white {
  color: white !important;
}
.strike-through {
  text-decoration: line-through;
}
.separator > div:not(:last-child) {
  border-bottom: 1px solid #eeeeee;
}
:deep(.checkbox-creditos .q-checkbox__label) {
  font-size: 0.875rem;
}
.resumen-fecha {
  font-size: 1.1rem;
  font-weight: bold;
  color: #851319;
}
.resumen-fecha.text-white {
  color: white !important;
}
.resumen-titulo {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  margin: 0 0 1rem 0;
}
.numero-reservas {
  font-size: 1.1rem;
  font-weight: 500;
}
.total-precio {
  font-size: 1.3rem;
}
:deep(.btn-confirmar .q-btn__content) {
  font-weight: bold;
}
</style>
