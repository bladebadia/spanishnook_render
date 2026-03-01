<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="col-12 text-center q-mb-lg">
      <h4 class="text-h4 text-weight-bold text-primary q-my-none">
        {{
          user?.user_metadata?.nombre
            ? `¡Hola, ${user.user_metadata.nombre}!`
            : t('personal.holaUsuario')
        }}
      </h4>
      <p class="text-subtitle1 text-grey-7 q-mt-sm">
        {{ t('personal.bienvenidoAreaPersonal') }}
      </p>
    </div>

    <div class="row q-col-gutter-lg">
      <div :class="['menu-lateral', $q.screen.lt.md ? 'col-12' : 'col-12 col-md-3']">
        <SaldoWallet
          :saldo-normal="formDatos.saldo_normal"
          :saldo-conversacion="formDatos.saldo_conversacion"
          :loading="cargandoSaldo"
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          class="full-width q-mb-md shadow-2"
          size="lg"
          icon="add_circle"
          :label="t('personal.nuevaReserva')"
          to="/Reservas"
          unelevated
        />

        <div v-if="$q.screen.lt.md" class="flex justify-center q-mb-md">
          <q-btn
            flat
            :icon="menuVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            :label="menuVisible ? t('personal.ocultarMenu') : t('personal.mostrarMenu')"
            @click="menuVisible = !menuVisible"
            color="primary"
            class="full-width bg-white"
          />
        </div>

        <q-card v-show="menuVisible || $q.screen.gt.sm" class="menu-card no-shadow border-gray">
          <q-list separator>
            <q-item-label
              header
              class="text-weight-bold text-uppercase text-grey-7 text-caption q-pt-md"
            >
              {{ t('personal.misclases') }}
            </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'reservadas'"
              @click="seleccionarMenu('reservadas')"
              active-class="text-primary bg-red-1"
            >
              <q-item-section avatar><q-icon name="event" /></q-item-section>
              <q-item-section>{{ t('personal.clasesReservadas') }}</q-item-section>
              <q-item-section side v-if="reservasConfirmadas.length > 0">
                <q-badge color="primary" rounded>{{ reservasConfirmadas.length }}</q-badge>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'cursos'"
              @click="seleccionarMenu('cursos')"
              active-class="text-primary bg-red-1"
            >
              <q-item-section avatar><q-icon name="school" /></q-item-section>
              <q-item-section>{{ t('personal.misCursos') }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'historial'"
              @click="seleccionarMenu('historial')"
              active-class="text-primary bg-red-1"
            >
              <q-item-section avatar><q-icon name="history" /></q-item-section>
              <q-item-section>{{ t('personal.historialClases') }}</q-item-section>
            </q-item>

            <q-item-label
              header
              class="text-weight-bold text-uppercase text-grey-7 text-caption q-mt-sm"
            >
              {{ t('personal.miCuenta') }}
            </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'datos'"
              @click="seleccionarMenu('datos')"
              active-class="text-primary bg-red-1"
            >
              <q-item-section avatar><q-icon name="person" /></q-item-section>
              <q-item-section>{{ t('personal.datosPersonales') }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'eliminar'"
              @click="seleccionarMenu('eliminar')"
              active-class="text-negative bg-red-1"
            >
              <q-item-section avatar
                ><q-icon name="delete_outline" color="negative"
              /></q-item-section>
              <q-item-section class="text-negative">{{
                t('personal.eliminarCuenta')
              }}</q-item-section>
            </q-item>

            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              @click="irAPanelAdmin"
              class="bg-grey-2 q-mt-md"
            >
              <q-item-section avatar
                ><q-icon name="admin_panel_settings" color="negative"
              /></q-item-section>
              <q-item-section class="text-weight-bold text-negative">PANEL ADMIN</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div :class="[$q.screen.lt.md ? 'col-12' : 'col-12 col-md-9']">
        <div v-if="menuActivo === 'reservadas' || menuActivo === ''">
          <q-card class="shadow-1 rounded-borders">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-h6 text-primary">{{ t('personal.misReservasConfirmadas') }}</div>

              <div v-if="reservasConfirmadas.length > 0">
                <q-btn
                  v-if="!modoSeleccion"
                  flat
                  dense
                  color="primary"
                  icon="checklist"
                  :label="t('personal.gestionar')"
                  @click="modoSeleccion = true"
                />
                <div v-else class="row q-gutter-sm">
                  <q-btn
                    flat
                    dense
                    color="grey"
                    :label="t('personal.cancelar2')"
                    @click="
                      modoSeleccion = false;
                      seleccionadas = [];
                    "
                  />
                  <q-btn
                    color="negative"
                    :label="`${t('personal.borrar')} (${seleccionadas.length})`"
                    :disable="seleccionadas.length === 0"
                    :loading="cargandoOperacion"
                    @click="cancelarSeleccionadas"
                    dense
                    icon="delete"
                    unelevated
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <q-list separator v-if="reservasConfirmadas.length > 0">
                <q-item v-for="reserva in reservasConfirmadas" :key="reserva.id" class="q-py-md">
                  <q-item-section avatar v-if="modoSeleccion">
                    <q-checkbox
                      v-model="seleccionadas"
                      :val="reserva.id"
                      :disable="!puedeCancelar(reserva)"
                    >
                      <q-tooltip v-if="!puedeCancelar(reserva)" class="bg-negative">{{
                        t('personal.noSePuedeCancelar')
                      }}</q-tooltip>
                    </q-checkbox>
                  </q-item-section>

                  <q-item-section avatar v-else style="min-width: 100px">
                    <img
                      :src="getIconoPersonalizado(reserva.tipo)"
                      alt="Clase"
                      style="width: 90px; height: 90px; object-fit: contain"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-subtitle1">{{
                      formatFecha(reserva.fecha)
                    }}</q-item-label>

                    <q-item-label class="text-primary q-mb-xs">
                      <q-icon name="schedule" class="q-mr-xs" />
                      <span class="text-weight-bold" style="font-size: 1.1em">
                        {{ formatoHorarioLocal(reserva.fecha, reserva.hora) }}
                      </span>
                      <span class="text-caption text-grey-7 q-ml-sm">
                        (🇪🇸 {{ formatHorarioIndividual(reserva.hora) }} Madrid)
                      </span>
                    </q-item-label>

                    <q-badge outline color="grey-7" class="q-mt-xs self-start">{{
                      getTipoClaseTexto(reserva)
                    }}</q-badge>

                    <div
                      v-if="!puedeCancelar(reserva)"
                      class="text-negative text-caption q-mt-xs flex items-center"
                    >
                      <q-icon name="lock" size="xs" class="q-mr-xs" />
                      {{ t('personal.noSePuedeCancelar') || 'Menos de 24h' }}
                    </div>
                  </q-item-section>

                  <q-item-section side v-if="!modoSeleccion">
                    <q-btn
                      v-if="reserva.meet_link"
                      type="a"
                      :href="reserva.meet_link"
                      target="_blank"
                      color="primary"
                      icon="videocam"
                      :label="t('personal.entrar')"
                      unelevated
                    />
                    <q-chip
                      v-else
                      color="grey-3"
                      text-color="grey-8"
                      icon="hourglass_empty"
                      label="Pendiente"
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-else class="column flex-center q-pa-xl text-grey-6">
                <q-icon name="event_busy" size="60px" class="q-mb-md opacity-50" />
                <div class="text-h6">{{ t('personal.noTienesReservas') }}</div>
                <q-btn
                  outline
                  color="primary"
                  :label="t('personal.reservaClase')"
                  to="/Reservas"
                  class="q-mt-md"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="menuActivo === 'cursos'">
          <q-card class="shadow-1 rounded-borders">
            <q-card-section class="row items-center justify-between">
              <div class="text-h6 text-primary">{{ t('personal.misSuscripcionesActivas') }}</div>
              <q-btn flat icon="refresh" round color="primary" @click="cargarSuscripciones" />
            </q-card-section>

            <q-card-section>
              <div v-if="misSuscripciones.length > 0" class="row q-col-gutter-md">
                <div class="col-12" v-for="suscripcion in misSuscripciones" :key="suscripcion.id">
                  <q-card bordered flat class="card-curso">
                    <q-card-section horizontal>
                      <q-card-section class="col-auto flex flex-center bg-grey-1 q-pa-md">
                        <q-avatar size="80px" square
                          ><img :src="getIconoPersonalizado('grupal')"
                        /></q-avatar>
                      </q-card-section>
                      <q-card-section class="col q-py-md">
                        <div
                          class="text-h6 text-primary cursor-pointer hover-underline"
                          @click="router.push(`/ReservasCursos?id=${suscripcion.course_id}`)"
                        >
                          {{ suscripcion.cursos_grupales?.nombre_curso || 'Curso sin nombre' }}
                        </div>
                        <div class="text-subtitle2 text-grey-8 q-mb-sm">
                          <q-icon name="schedule" class="q-mr-xs" />
                          {{ traducirDiasSemana(suscripcion.cursos_grupales?.dias_semana) }} •
                          {{ formatHorarios(suscripcion.cursos_grupales?.horarios_curso) }}
                        </div>
                        <div class="row items-center q-gutter-x-sm">
                          <q-badge
                            :color="
                              suscripcion.estado === 'active' && !suscripcion.cancel_at_period_end
                                ? 'positive'
                                : 'orange'
                            "
                          >
                            {{
                              suscripcion.estado === 'active' && !suscripcion.cancel_at_period_end
                                ? t('personal.estadoActiva')
                                : suscripcion.cancel_at_period_end
                                  ? t('personal.estadoCancelada')
                                  : suscripcion.estado
                            }}
                          </q-badge>

                          <span class="text-caption text-grey">
                            {{
                              suscripcion.cancel_at_period_end
                                ? t('personal.finalizaEl')
                                : t('personal.renovacion')
                            }}
                            {{ formatearFechaSuscripcion(suscripcion.current_period_end) }}
                          </span>
                        </div>
                      </q-card-section>
                      <q-card-section class="col-auto column justify-center q-gutter-y-sm">
                        <q-btn
                          v-if="suscripcion.cursos_grupales?.meet_link"
                          :href="suscripcion.cursos_grupales?.meet_link"
                          target="_blank"
                          color="primary"
                          icon="videocam"
                          :label="t('personal.entrar')"
                          unelevated
                          size="sm"
                        />
                        <q-btn
                          v-if="
                            !suscripcion.cancel_at_period_end && suscripcion.estado === 'active'
                          "
                          flat
                          color="negative"
                          :label="t('personal.cancelar')"
                          @click="confirmarCancelacion(suscripcion)"
                          :loading="procesando"
                          size="sm"
                        />
                        <q-btn
                          v-if="suscripcion.cancel_at_period_end"
                          flat
                          color="positive"
                          :label="t('personal.reactivar')"
                          @click="reactivarSuscripcion(suscripcion)"
                          :loading="procesando"
                          size="sm"
                        />
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div v-else class="column flex-center q-pa-xl text-grey-6">
                <q-icon name="school" size="60px" class="q-mb-md opacity-50" />
                <div class="text-h6">{{ t('personal.noTienesSuscripciones') }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="menuActivo === 'datos'" class="column q-gutter-lg">
          <q-card class="shadow-1 rounded-borders overflow-hidden">
            <div class="bg-primary" style="height: 100px"></div>

            <q-card-section class="relative-position q-pt-none">
              <div class="absolute-top-left q-ml-md" style="top: -40px">
                <q-avatar
                  size="80px"
                  class="shadow-3 bg-white text-primary text-weight-bold font-title"
                >
                  {{ (formDatos.nombre?.[0] || 'U').toUpperCase() }}
                </q-avatar>
              </div>

              <div class="row justify-end q-mt-sm">
                <q-btn
                  :label="t('personal.guardarCambios')"
                  color="primary"
                  unelevated
                  @click="enviarDatosPersonales"
                  icon="save"
                />
              </div>

              <div class="q-mt-md">
                <div class="text-h5 text-weight-bold">
                  {{ formDatos.nombre }} {{ formDatos.apellido1 }}
                </div>
                <div class="text-grey-7">{{ formDatos.email }}</div>
              </div>

              <div class="row q-col-gutter-lg q-mt-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formDatos.nombre"
                    :label="t('personal.nombre')"
                    dense
                    outlined
                    class="q-mb-md"
                  />
                  <q-input
                    v-model="formDatos.apellido1"
                    :label="t('personal.apellido')"
                    dense
                    outlined
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="formDatos.idioma_nativo"
                    :options="idiomasComunes"
                    :label="t('personal.idiomaNativo')"
                    dense
                    outlined
                    class="q-mb-md"
                  >
                    <template v-slot:prepend><q-icon name="language" /></template>
                  </q-select>
                  <q-field label="Email" dense outlined stack-label readonly bg-color="grey-1">
                    <template v-slot:control
                      ><div class="self-center full-width no-outline">
                        {{ formDatos.email }}
                      </div></template
                    >
                    <template v-slot:prepend><q-icon name="email" /></template>
                  </q-field>
                </div>
              </div>

              <div class="q-mt-lg">
                <div class="text-subtitle2 text-primary q-mb-xs">{{ t('personal.tuPerfil') }}</div>
                <q-separator class="q-mb-md" />
                <div class="row q-gutter-md">
                  <div>
                    <div class="text-caption text-grey">{{ t('personal.nivel') }}</div>
                    <q-chip color="secondary" text-color="white" icon="leaderboard">{{
                      formDatos.nivel_estimado || t('personal.sinDefinir')
                    }}</q-chip>
                  </div>
                  <div>
                    <div class="text-caption text-grey">{{ t('personal.intereses') }}</div>
                    <template v-if="formDatos.intereses && formDatos.intereses.length > 0">
                      <q-chip
                        v-for="tag in formDatos.intereses"
                        :key="tag"
                        color="grey-3"
                        text-color="grey-9"
                        >{{ tag }}</q-chip
                      >
                    </template>
                    <span v-else class="text-grey text-caption text-italic">{{
                      t('personal.sinIntereses')
                    }}</span>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-form @submit="verificarYCambiarPassword" class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-grey-8 q-mb-xs">
                {{ t('personal.contraseñaActual') }}
              </div>
              <q-input
                v-model="passForm.current"
                type="password"
                dense
                outlined
                :placeholder="t('personal.introduceContraseñaActual')"
              />
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-grey-8 q-mb-xs">
                {{ t('personal.introduceNuevaContraseña') }}
              </div>
              <q-input
                v-model="passForm.new"
                type="password"
                dense
                outlined
                :placeholder="t('personal.minimo6')"
              />
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-grey-8 q-mb-xs">{{ t('personal.repiteNueva') }}</div>
              <q-input
                v-model="passForm.confirm"
                type="password"
                dense
                outlined
                :placeholder="t('personal.repiteNueva')"
              />
            </div>

            <div class="col-12 flex justify-end">
              <q-btn
                :label="t('personal.actualizarContraseña')"
                color="primary"
                unelevated
                type="submit"
                :loading="loadingPass"
              />
            </div>
          </q-form>
        </div>

        <div v-if="menuActivo === 'historial'">
          <q-card class="shadow-1">
            <q-card-section class="text-h6 text-primary">{{
              t('personal.tuHistorialDeClases')
            }}</q-card-section>
            <q-card-section>
              <q-list separator v-if="reservasPasadas.length > 0">
                <q-item v-for="reserva in reservasPasadas" :key="reserva.id">
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{
                      formatFecha(reserva.fecha)
                    }}</q-item-label>
                    <q-item-label caption>
                      <span class="text-weight-bold text-black">
                        {{ formatoHorarioLocal(reserva.fecha, reserva.hora) }}
                      </span>
                      <span class="q-ml-xs">
                        (🇪🇸 {{ formatHorarioIndividual(reserva.hora) }})
                      </span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge color="grey-4" text-color="grey-8">{{
                      t('personal.finalizada')
                    }}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-center text-grey q-pa-lg">{{ t('personal.noHay') }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="menuActivo === 'eliminar'">
          <q-card class="bg-red-1 shadow-1" style="border: 1px solid #ef9a9a">
            <q-card-section>
              <div class="text-h6 text-negative">{{ t('personal.eliminarCuenta') }}</div>
              <p class="text-grey-9 q-mt-sm text-bold">⚠️ {{ t('personal.estaAccion') }}</p>
            </q-card-section>
            <q-card-section>
              <q-form @submit="eliminarCuenta" class="row items-end q-gutter-md">
                <q-input
                  v-model="passwordConfirm"
                  type="password"
                  :label="t('personal.confirmaTuContrasena')"
                  outlined
                  dense
                  class="col-12 col-md-6"
                  bg-color="white"
                />
                <q-btn
                  :label="t('personal.eliminarDefinitivamente')"
                  type="submit"
                  color="negative"
                  icon="delete_forever"
                  :loading="deleting"
                  unelevated
                />
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { jwtDecode } from 'jwt-decode';
import { ref, onMounted, computed } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';
import { useSuscripciones } from 'src/composables/useSuscripciones';
import SaldoWallet from 'components/SaldoWallet.vue';

const $q = useQuasar();
const { user, logout } = useAuth();
const router = useRouter();
const { t, locale } = useI18n();
const { procesando, cambiarEstadoCancelacion } = useSuscripciones();
const route = useRoute();

// --- ESTADOS ---
const reservasConfirmadas = ref<Reserva[]>([]);
const reservasPasadas = ref<Reserva[]>([]);
const menuVisible = ref($q.screen.gt.sm);
const menuActivo = ref('reservadas');
const passwordConfirm = ref('');
const deleting = ref(false);
const cargandoSaldo = ref(true);
const sessionToken = ref<string | null>(null);

// Variables para cambio de contraseña
const loadingPass = ref(false);
const passForm = ref({ current: '', new: '', confirm: '' });

const modoSeleccion = ref(false);
const seleccionadas = ref<string[]>([]);
const cargandoOperacion = ref(false);

interface Reserva {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  estado: string;
  created_at?: string;
  tipo?: 'normal' | 'conversacion';
  precio?: number;
  stripe_payment_intent?: string;
  meet_link?: string;
}

interface Suscripcion {
  id: string;
  course_id: number;
  stripe_subscription_id: string;
  estado: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  cursos_grupales?: {
    nombre_curso: string;
    dias_semana: string[];
    horarios_curso: string[];
    meet_link?: string;
    estado_curso: string;
  };
}
const misSuscripciones = ref<Suscripcion[]>([]);

interface DatosUsuario {
  nombre: string;
  apellido1: string;
  email: string;
  idioma_nativo: string;
  nivel_estimado: string;
  intereses: string[];
  saldo_normal: number;
  saldo_conversacion: number;
  [key: string]: string | number | null | string[];
}

const formDatos = ref<DatosUsuario>({
  nombre: '',
  apellido1: '',
  email: '',
  idioma_nativo: '',
  nivel_estimado: '',
  intereses: [],
  saldo_normal: 0,
  saldo_conversacion: 0,
});

const idiomasComunes = ['English', 'Français', 'Deutsch', 'Italiano', 'Português', 'Otro/Another'];
const BUCKET_URL = 'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/';

const getIconoPersonalizado = (tipo: string | undefined) => {
  if (tipo === 'conversacion') return `${BUCKET_URL}iconoconv.svg`;
  if (tipo === 'grupal') return `${BUCKET_URL}iconogrupal.svg`;
  return `${BUCKET_URL}iconoindiv.svg`;
};

// --- FUNCIONES SELECCIÓN ---
const puedeCancelar = (reserva: Reserva): boolean => {
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  return (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60) >= 24;
};

const cancelarSeleccionadas = () => {
  if (seleccionadas.value.length === 0) return;

  $q.dialog({
    title: t('personal.cancelarReserva') || 'Cancelar Clases',
    message: `${t('personal.vasA')} ${seleccionadas.value.length} ${t('personal.clase')}. <br>${t('personal.seDevolvera')}`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: t('personal.confirmar'), color: 'negative' },
  }).onOk(() => {
    void (async () => {
      cargandoOperacion.value = true;
      try {
        const { data, error } = await supabase.functions.invoke('cancel-reserva', {
          body: { reservaIds: seleccionadas.value },
        });

        if (error) throw error;

        const mensaje = `${t('personal.hecho')} ${data.canceladas} ${t('personal.canceladas')}.`;
        $q.notify({ type: data.canceladas > 0 ? 'positive' : 'warning', message: mensaje });

        seleccionadas.value = [];
        modoSeleccion.value = false;
        await Promise.all([cargarDatosPersonales(), cargarReservasConfirmadas()]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : t('personal.errorDesconocido');
        $q.notify({ type: 'negative', message: msg });
      } finally {
        cargandoOperacion.value = false;
      }
    })();
  });
};

// --- RESTO DE FUNCIONES ---
const cargarSuscripciones = async () => {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `*, cursos_grupales!course_id (nombre_curso, dias_semana, horarios_curso, meet_link, estado_curso)`,
    )
    .eq('user_id', user.value?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }
  if (data) {
    const cursosTemp = data.map((sub) => ({
      ...sub,
      cursos_grupales: sub.cursos_grupales || {
        nombre_curso: 'Curso no encontrado',
        dias_semana: [],
        horarios_curso: [],
        estado_curso: 'Desconocido',
      },
    })) as Suscripcion[];

    misSuscripciones.value = cursosTemp.filter(
      (s) =>
        s.cursos_grupales?.estado_curso !== 'Completo' &&
        s.cursos_grupales?.estado_curso !== 'Cerrado',
    );
  }
};

const confirmarCancelacion = (sub: Suscripcion) => {
  const fechaFin = formatearFechaSuscripcion(sub.current_period_end);
  $q.dialog({
    title: `¿${t('personal.cancelarSuscripcion')}?`,
    message: `${t('personal.seguirasTeniendoAcceso')} <b>${fechaFin}</b>.`,
    html: true,
    persistent: true,
    ok: { label: 'Sí, cancelar', color: 'negative', flat: true },
    cancel: { label: 'Volver', color: 'primary' },
  }).onOk(() => {
    void (async () => {
      const exito = await cambiarEstadoCancelacion(sub.stripe_subscription_id, true);
      if (exito) {
        // 🔥 ESTO HACE QUE CAMBIE AL INSTANTE
        sub.cancel_at_period_end = true;
        await cargarSuscripciones();
      }
    })();
  });
};

const reactivarSuscripcion = async (sub: Suscripcion) => {
  const exito = await cambiarEstadoCancelacion(sub.stripe_subscription_id, false);
  if (exito) {
    // 🔥 ESTO HACE QUE VUELVA A VERDE AL INSTANTE
    sub.cancel_at_period_end = false;
    await cargarSuscripciones();
  }
};

const formatearFechaSuscripcion = (fecha: string | number) => {
  if (!fecha) return '---';
  if (!isNaN(Number(fecha))) {
    const date = new Date(Number(fecha) * 1000);
    return date.toLocaleDateString(locale.value, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const dateISO = new Date(fecha);
  if (!isNaN(dateISO.getTime())) {
    return dateISO.toLocaleDateString(locale.value, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return 'Fecha inválida';
};

// --- FUNCIÓN LOCAL SEGURA PARA CURSOS (90 MINUTOS) ---
const formatHorarios = (horarios?: string[]) => {
  if (!horarios || !Array.isArray(horarios) || horarios.length === 0) return 'Por definir';

  const horaInicio = horarios[0];
  if (!horaInicio) return 'Por definir';

  try {
    // CORRECCIÓN: Separar y comprobar antes de convertir
    const partes = horaInicio.split(':');
    if (partes.length < 2) return horaInicio;

    const h = Number(partes[0]);
    const m = Number(partes[1]);

    if (isNaN(h) || isNaN(m)) return horaInicio;

    // Calcular offset Madrid
    const now = new Date();
    const strMadrid = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const dateMadrid = new Date(strMadrid);
    const diff = now.getTime() - dateMadrid.getTime();

    // Fecha base con la hora del curso
    const base = new Date();
    base.setHours(h, m, 0, 0);

    // Ajustar a hora local usuario
    const localStart = new Date(base.getTime() + diff);
    // Sumar 90 minutos
    const localEnd = new Date(localStart.getTime() + 90 * 60000);

    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${fmt(localStart)} - ${fmt(localEnd)}`;
  } catch (e) {
    console.warn(e); // Usar 'e' para que el linter no se queje
    return horaInicio;
  }
};

// --- FUNCIÓN LOCAL SEGURA PARA CLASES INDIVIDUALES (60 MINUTOS) ---
const formatoHorarioLocal = (fechaStr: string | undefined, horaStr: string | undefined) => {
  if (!fechaStr || !horaStr) return '...';

  try {
    // CORRECCIÓN: Separar y comprobar antes de convertir
    const partes = horaStr.split(':');
    if (partes.length < 2) return horaStr;

    const h = Number(partes[0]);
    const m = Number(partes[1]);

    if (isNaN(h) || isNaN(m)) return horaStr;

    // Calcular offset Madrid
    const now = new Date();
    const strMadrid = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const dateMadrid = new Date(strMadrid);
    const diff = now.getTime() - dateMadrid.getTime();

    // Fecha base
    const base = new Date(fechaStr);
    base.setHours(h, m, 0, 0);

    // Ajustar a hora local usuario
    const localStart = new Date(base.getTime() + diff);
    // Sumar 60 minutos
    const localEnd = new Date(localStart.getTime() + 60 * 60000);

    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${fmt(localStart)} - ${fmt(localEnd)}`;
  } catch (e) {
    console.warn(e); // Usar 'e'
    return horaStr;
  }
};

// --- FORMATO SIMPLE PARA MOSTRAR LA HORA DE MADRID (TEXTO) ---
const formatHorarioIndividual = (horaInicio: string) => {
  if (!horaInicio) return '';
  const limpia = horaInicio.slice(0, 5);
  const partes = limpia.split(':');
  if (partes.length < 2) return limpia;

  const h = Number(partes[0]);
  const m = Number(partes[1]);

  if (isNaN(h) || isNaN(m)) return limpia;

  // Cálculo simple manual
  const mTotal = h * 60 + m + 60; // +60 minutos duración
  const hFin = Math.floor(mTotal / 60) % 24;
  const mFin = mTotal % 60;

  const hFinStr = hFin.toString().padStart(2, '0');
  const mFinStr = mFin.toString().padStart(2, '0');

  return `${limpia} - ${hFinStr}:${mFinStr}`;
};

const eliminarCuenta = async () => {
  if (!user.value?.email || !user.value?.id) return;
  if (!passwordConfirm.value) return;
  deleting.value = true;
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: passwordConfirm.value,
    });
    if (signInError) throw new Error(t('personal.contrasenaIncorrecta'));
    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('personal.cuentaEliminada') });
    await logout();
    await router.push('/');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    deleting.value = false;
  }
};

const verificarYCambiarPassword = async () => {
  // 1. Si no hay email o los campos están vacíos, no hacemos nada (es opcional)
  if (!user.value?.email) return;
  if (!passForm.value.current && !passForm.value.new && !passForm.value.confirm) return;

  // 2. Validaciones manuales ANTES de tocar la base de datos
  // Así evitamos mensajes de error permanentes en los inputs
  if (!passForm.value.current) {
    $q.notify({ type: 'warning', message: t('personal.introduceContraseñaActual') });
    return;
  }
  if (passForm.value.new.length < 6) {
    $q.notify({ type: 'warning', message: t('personal.minimo6') });
    return;
  }
  if (passForm.value.new !== passForm.value.confirm) {
    $q.notify({ type: 'negative', message: t('personal.noCoinciden') });
    return;
  }

  loadingPass.value = true;
  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: passForm.value.current,
    });

    if (loginError) {
      throw new Error(t('personal.passwordActualIncorrecta'));
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: passForm.value.new,
    });

    if (updateError) throw updateError;

    $q.notify({ type: 'positive', message: t('personal.actualizada') });

    passForm.value = { current: '', new: '', confirm: '' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('personal.errorActualizar');
    $q.notify({ type: 'negative', message: msg });
  } finally {
    loadingPass.value = false;
  }
};

const cargarDatosPersonales = async () => {
  if (!user.value?.id) return;
  cargandoSaldo.value = true;
  try {
    const { data, error } = await supabase
      .from('datos_usuarios')
      .select('*')
      .eq('user_id', user.value.id)
      .single();
    if (error) {
      console.error('Error al cargar datos personales:', error);
      if (error.code === '406') {
        $q.notify({
          type: 'negative',
          message:
            'Error 406: No se puede obtener el perfil. Revisa las políticas RLS o el formato de la petición.',
        });
      }
      if (error.code !== 'PGRST116') return;
    }
    if (data) {
      formDatos.value = {
        nombre: data.nombre || '',
        apellido1: data.apellido1 || '',
        email: data.email || user.value.email || '',
        idioma_nativo: data.idioma_nativo || '',
        nivel_estimado: data.nivel_estimado || '',
        intereses: data.intereses || [],
        saldo_normal: data.saldo_normal || 0,
        saldo_conversacion: data.saldo_conversacion || 0,
      };
    } else {
      formDatos.value.email = user.value.email || '';
    }
  } catch (error) {
    console.error('Excepción al cargar datos personales:', error);
  } finally {
    cargandoSaldo.value = false;
  }
};

const esAdmin = computed(() => {
  if (!sessionToken.value) return false;
  try {
    const payload = jwtDecode<{ app_metadata?: { is_admin?: boolean } }>(sessionToken.value);
    return Boolean(payload.app_metadata?.is_admin);
  } catch {
    return false;
  }
});

const cargarSesion = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  sessionToken.value = session?.access_token || null;
};

const cargarReservasPasadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data: antiguas } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .lt('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: false });

    const { data: hoy } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .eq('fecha', new Date().toISOString().split('T')[0]);

    let pasadasHoy: Reserva[] = [];
    if (hoy) {
      const ahora = new Date();
      pasadasHoy = hoy.filter((r) => {
        const fechaClase = new Date(`${r.fecha}T${r.hora}`);
        return fechaClase <= ahora;
      });
    }
    const total = [...(antiguas || []), ...pasadasHoy];
    reservasPasadas.value = total.sort((a, b) => {
      return (
        new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime()
      );
    });
  } catch (error) {
    console.error(error);
  }
};

const cargarReservasConfirmadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (data) {
      const ahora = new Date();
      reservasConfirmadas.value = data.filter((r) => {
        const fechaClase = new Date(`${r.fecha}T${r.hora}`);
        return fechaClase > ahora;
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const irAPanelAdmin = async () => {
  await router.push('/Administracion');
};

const enviarDatosPersonales = async () => {
  try {
    const datos = {
      user_id: user.value?.id,
      nombre: formDatos.value.nombre,
      apellido1: formDatos.value.apellido1,
      idioma_nativo: formDatos.value.idioma_nativo,
    };
    const { error } = await supabase
      .from('datos_usuarios')
      .update(datos)
      .eq('user_id', user.value?.id);

    if (error) throw error;

    $q.notify({ type: 'positive', message: t('personal.datosGuardadosCorrectamente') });
  } catch (error) {
    console.error('Error al guardar:', error);
    $q.notify({ type: 'negative', message: t('personal.errorGuardandoDatos') });
  }
};

const seleccionarMenu = (menu: string) => {
  menuActivo.value = menu;
  if (menu === 'historial') void cargarReservasPasadas();
  else if (menu === 'datos') void cargarDatosPersonales();
  else if (menu === 'cursos') void cargarSuscripciones();
  if ($q.screen.lt.md) menuVisible.value = false;
};

const diasSemanaMap: Record<string, Record<string, string>> = {
  Lunes: { 'es-ES': 'Lunes', 'en-US': 'Monday' },
  Martes: { 'es-ES': 'Martes', 'en-US': 'Tuesday' },
  Miercoles: { 'es-ES': 'Miércoles', 'en-US': 'Wednesday' },
  Jueves: { 'es-ES': 'Jueves', 'en-US': 'Thursday' },
  Viernes: { 'es-ES': 'Viernes', 'en-US': 'Friday' },
  Sabado: { 'es-ES': 'Sábado', 'en-US': 'Saturday' },
  Doming: { 'es-ES': 'Domingo', 'en-US': 'Sunday' },
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

const traducirDiasSemana = (dias?: string[]) => {
  if (!dias || dias.length === 0) return '';
  return dias
    .map((dia) => {
      const key = dia.toLowerCase();
      const traducciones = diasSemanaMap[key] || diasSemanaMap[dia];
      return traducciones?.[locale.value] ?? traducciones?.['es-ES'] ?? dia;
    })
    .join(', ');
};

const getTipoClaseTexto = (reserva: Reserva): string =>
  reserva.tipo === 'normal' ? t('personal.claseNormal') : t('personal.claseConversacion');

onMounted(() => {
  void cargarReservasConfirmadas();
  void cargarSesion();
  void cargarDatosPersonales();

  if (route.query.session_id) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carritoReservas');
      window.dispatchEvent(new Event('storage'));
    }
    $q.notify({
      type: 'positive',
      message: '¡Pago completado! Tus reservas han sido confirmadas.',
      icon: 'check_circle',
      position: 'top',
    });

    void router.replace('/AreaPersonal');
  }
});
</script>

<style scoped>
.menu-card {
  border-radius: 12px;
  overflow: hidden;
}
.border-gray {
  border: 1px solid #e0e0e0;
}
.font-title {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 32px;
}
.hover-underline:hover {
  text-decoration: underline;
}
.opacity-50 {
  opacity: 0.5;
}
</style>
