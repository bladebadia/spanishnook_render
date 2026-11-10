<template>
  <q-page class="ca-pagina">
    <div class="sn-contenedor">
      <h1 class="ca-h1">{{ t('carrito.carritoDeReservas') }}</h1>

      <!-- Vacío -->
      <div v-if="carrito.length === 0" class="ca-vacio">
        <q-icon name="shopping_cart" size="56px" />
        <p>{{ t('carrito.tuCarritoEstaVacio') }}</p>
        <q-btn
          color="primary"
          unelevated
          no-caps
          size="lg"
          class="ca-boton"
          :label="t('carrito.reservarClases')"
          to="/Reservas"
        />
      </div>

      <div v-else class="ca-rejilla">
        <!-- Clases del carrito -->
        <ul class="ca-lista">
          <li
            v-for="(reserva, index) in carrito"
            :key="index"
            class="ca-item"
            :class="[
              reserva.tipo === 'normal' ? 'sn-sello-general' : 'sn-sello-conversacion',
              { 'ca-item--conflicto': esReservaConflictiva(reserva) },
            ]"
          >
            <div class="ca-item__info">
              <span class="ca-item__tipo">
                {{ reserva.tipo === 'normal' ? t('carrito.claseNormal') : t('carrito.claseConversacion') }}
              </span>
              <span class="ca-item__fecha">{{ formatFecha(reserva.fecha, reserva.hora) }}</span>
              <span class="ca-item__hora">{{ obtenerRangoLocalSeguro(reserva.fecha, reserva.hora) }}</span>
              <span class="ca-item__madrid">(🇪🇸 {{ formatHorarioMadrid(reserva.hora) }} Madrid)</span>
              <span v-if="esReservaConflictiva(reserva)" class="ca-item__aviso">
                <q-icon name="warning" size="16px" /> {{ t('carrito.horaOcupada') }}
              </span>
            </div>

            <div class="ca-item__precio">
              <template v-if="!esReservaConflictiva(reserva)">
                <template v-if="reserva.usarCredito">
                  <span class="ca-credito">{{ t('carrito.creditoBadge') }}</span>
                  <span class="ca-tachado">{{ reserva.tipo === 'normal' ? '32 €' : '27 €' }}</span>
                </template>
                <span v-else class="ca-importe">{{ reserva.tipo === 'normal' ? '32 €' : '27 €' }}</span>
              </template>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                :aria-label="t('ReservasPagina.quitar')"
                @click="quitarDelCarrito(index)"
              />
            </div>
          </li>
        </ul>

        <!-- Resumen y pago -->
        <aside class="ca-resumen">
          <q-no-ssr>
            <div v-if="usuarioLogueado" class="ca-creditos">
              <SaldoWallet
                :saldo-normal="saldoNormal"
                :saldo-conversacion="saldoConversacion"
                :loading="cargandoSaldo"
              />
              <q-checkbox
                v-model="usarCreditosGlobal"
                :label="t('carrito.utilizarCreditos')"
                color="positive"
                class="ca-check"
                :disable="saldoNormal === 0 && saldoConversacion === 0"
                @update:model-value="recalcularAplicacionCreditos"
              />
            </div>
          </q-no-ssr>

          <div class="ca-total sn-nota">
            <p class="ca-total__titulo">{{ t('carrito.resumenDelPedido') }}</p>
            <div class="ca-total__fila">
              <span>{{ carrito.length }} {{ t('carrito.reserva', carrito.length) }}</span>
              <strong class="ca-total__importe">{{ totalPagarDinero }} €</strong>
            </div>
            <p v-if="totalGastarCreditos > 0" class="ca-total__creditos">
              {{ t('carrito.usarasCreditos', totalGastarCreditos) }}
            </p>
            <p v-if="reservasConflictivas.length > 0" class="ca-total__conflicto">
              <q-icon name="warning" size="16px" />
              {{ reservasConflictivas.length }}
              {{ t('carrito.reservaNoDisponible', { count: reservasConflictivas.length }) }}
            </p>

            <q-btn
              color="primary"
              unelevated
              no-caps
              size="lg"
              class="full-width ca-boton q-mt-md"
              :label="totalPagarDinero === 0 ? t('carrito.canjear') : t('carrito.pagarYConfirmarReservas')"
              :icon="totalPagarDinero === 0 ? 'check_circle' : 'credit_card'"
              :disable="!usuarioLogueado || reservasConflictivas.length > 0"
              :loading="confirmando"
              @click="confirmarReservasHibridas"
            />
            <q-btn
              flat
              no-caps
              color="grey-8"
              class="full-width q-mt-sm"
              icon="arrow_back"
              :label="t('carrito.seguir')"
              to="/Reservas"
            />
          </div>

          <q-no-ssr>
            <q-banner v-if="!usuarioLogueado" class="sn-nota q-mt-md" rounded>
              <template #avatar><q-icon name="info" color="primary" /></template>
              {{ t('carrito.debesIniciarSesion') }}
            </q-banner>
          </q-no-ssr>
        </aside>
      </div>
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
import { useAnalytics } from 'src/composables/useAnalytics';
import {
  formatFechaCalendario,
  formatFechaClaseLocal,
  rangoHoraLocal,
  rangoHoraMadrid,
  zonaUsuario,
} from 'src/utils/zonaHoraria';
// ELIMINADO: import { useHorarios } from 'src/composables/useHorarios';

const { t, locale } = useI18n();
const { user } = useAuth();
const $q = useQuasar();
const router = useRouter(); // 2. Inicializar
const { claseReservada, compraIniciada } = useAnalytics();

// --- 1. FUNCIÓN LOCAL SEGURA (Sustituye a useHorarios) ---
// Calcula hora local usuario = Hora Madrid + Offset Real. Duración 60 min.
const obtenerRangoLocalSeguro = (fechaStr: string, horaStr: string) =>
  fechaStr && horaStr ? rangoHoraLocal(fechaStr, horaStr, 60) : '...';

// --- FORMATO MADRID (Para referencia visual) ---
const formatHorarioMadrid = (horaInicio: string) =>
  horaInicio ? rangoHoraMadrid(horaInicio, 60) : '';

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
  // Si tiene créditos para alguna clase del carrito, se usan por defecto (antes salía
  // desmarcado y el botón proponía pagar con tarjeta teniendo saldo)
  const hayCreditoUtil = carrito.value.some(
    (item) =>
      (item.tipo === 'normal' && saldoNormal.value > 0) ||
      (item.tipo === 'conversacion' && saldoConversacion.value > 0),
  );
  if (hayCreditoUtil) {
    usarCreditosGlobal.value = true;
    recalcularAplicacionCreditos();
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
    $q.notify({ type: 'warning', message: t('carrito.alguienSeHaAdelantado') });
    confirmando.value = false;
    return;
  }

  confirmando.value = true;

  try {
    const itemsConCredito = carrito.value.filter((i) => i.usarCredito);
    const itemsConTarjeta = carrito.value.filter((i) => !i.usarCredito);

    // IDs de las reservas creadas: el correo se construye en el servidor con datos de la BD
    const idsParaEmail: string[] = [];
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
          throw new Error(data?.message || error?.message || t('errorDesconocido'));
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
        if (nuevaReservaId) idsParaEmail.push(String(nuevaReservaId));
        reservasParaEmail.push({
          fecha: item.fecha,
          hora: item.hora,
          tipo: item.tipo === 'normal' ? 'individual' : 'conversacion',
          meet_link: linkGenerado || undefined,
        });

        // A.3.1. Track clase reservada en Google Analytics
        claseReservada(
          item.tipo === 'normal' ? 'individual' : 'grupal',
          item.fecha,
          item.hora
        );
      }

      // A.4. Enviar Email Resumen
      if (reservasParaEmail.length > 0) {
        try {
          console.log('📨 Enviando resumen con links:', reservasParaEmail);
          await supabase.functions.invoke('send-booking-email', {
            body: {
              reservaIds: idsParaEmail,
              idioma: locale.value.startsWith('en') ? 'en' : 'es',
              zonaHoraria: zonaUsuario(),
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
      $q.notify({ type: 'positive', message: t('carrito.confirmadas') });
      carrito.value = [];
      guardarCarrito();

      // Navegación suave
      await router.push('/AreaPersonal');
    }
  } catch (err: unknown) {
    console.error('Error pago:', err);
    const mensaje = err instanceof Error ? err.message : t('carrito.errorProcesando');
    $q.notify({ type: 'negative', message: mensaje });
  } finally {
    confirmando.value = false;
  }
};

const irAStripe = async (items: ReservaCarrito[]) => {
  // Track inicio de compra
  const totalCompra = items.reduce((sum, item) => sum + (item.tipo === 'normal' ? 32 : 27), 0);
  compraIniciada(totalCompra);

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
      idioma: locale.value.startsWith('en') ? 'en' : 'es',
      zonaHoraria: zonaUsuario(),
    }),
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as {
      error?: string;
      franjasNoValidas?: unknown[];
    };
    // 409: alguna hora ya no se puede reservar (ocupada, curso o menos de 24 h)
    if (res.status === 409 && errorData.franjasNoValidas) {
      await verificarDisponibilidad();
      throw new Error(t('carrito.alguienSeHaAdelantado'));
    }
    throw new Error(errorData.error || t('carrito.errorStripe'));
  }

  const responseData = await res.json();
  if (!responseData.url) throw new Error(t('carrito.sinUrlStripe'));

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

// Con hora: fecha tal como la vive el alumno (puede ser otro día que en Madrid)
const formatFecha = (fecha: string, hora?: string) =>
  hora ? formatFechaClaseLocal(fecha, hora, locale.value) : formatFechaCalendario(fecha, locale.value);

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
.ca-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
  padding-block: clamp(24px, 5vw, 48px) var(--sn-seccion);
}
.ca-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  color: var(--sn-burdeos);
  margin: 0 0 24px;
}
.ca-boton {
  border-radius: var(--sn-r-boton);
  font-weight: 700;
}
.ca-vacio {
  text-align: center;
  padding: 48px 16px;
  border: 1px dashed var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  color: var(--sn-tinta-suave);
}

.ca-rejilla {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}
@media (min-width: 900px) {
  .ca-rejilla {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 32px;
  }
  .ca-resumen {
    position: sticky;
    top: 120px;
  }
}

/* Clases */
.ca-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.ca-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-left: 6px solid var(--sn-sello);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
}
.ca-item--conflicto {
  border-color: var(--q-negative);
  background: #fdecec;
}
.ca-item__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.35;
}
.ca-item__tipo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-peq);
  color: var(--sn-sello);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ca-item__fecha {
  font-weight: 700;
  margin-top: 2px;
}
.ca-item__hora {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--sn-burdeos);
}
.ca-item__madrid {
  font-size: var(--sn-t-peq);
  color: var(--sn-tinta-suave);
}
.ca-item__aviso {
  margin-top: 4px;
  color: var(--q-negative);
  font-weight: 700;
  font-size: var(--sn-t-peq);
}
.ca-item__precio {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}
.ca-importe {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.2rem;
  font-weight: 700;
}
.ca-credito {
  padding: 2px 10px;
  border-radius: var(--sn-r-boton);
  background: #eef5e3;
  color: var(--sn-oliva);
  font-weight: 700;
  font-size: var(--sn-t-peq);
}
.ca-tachado {
  text-decoration: line-through;
  color: var(--sn-tinta-suave);
}

/* Resumen */
.ca-creditos {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}
.ca-check :deep(.q-checkbox__label) {
  font-weight: 700;
}
.ca-total {
  padding: 20px;
}
.ca-total__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  margin: 0 0 12px;
}
.ca-total__fila {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.ca-total__importe {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.6rem;
  color: var(--sn-burdeos);
}
.ca-total__creditos {
  margin: 6px 0 0;
  color: var(--sn-oliva);
  font-weight: 700;
  font-size: var(--sn-t-peq);
}
.ca-total__conflicto {
  margin: 8px 0 0;
  color: var(--q-negative);
  font-weight: 700;
}
</style>
