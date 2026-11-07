import { ref, computed, onMounted } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import {
  diaSemanaMadrid,
  esClaseFutura,
  faltanAlMenos,
  formatFechaCalendario,
  hoyMadridISO,
  sumarDiasISO,
  sumarMesesISO,
} from 'src/utils/zonaHoraria';

// --- INTERFACES ---
export interface ReservaCarrito {
  id?: string;
  fecha: string;
  hora: string;
  tipo: 'normal' | 'conversacion';
}

interface OcupacionAnonima {
  fecha: string;
  hora: string;
}

export interface ReservaConfirmada {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  estado: string;
  created_at?: string;
  tipo?: 'normal' | 'conversacion';
  precio?: number;
}

export interface DiaCalendario {
  fecha: string;
  tipo_dia: string;
  horario: string[];
}

export interface CursoBloqueo {
  dias_semana: string[];
  horarios_curso: string[];
  estado_curso: string;
}

export function useReservasClases() {
  const $q = useQuasar();
  const { t, locale } = useI18n();
  const { user } = useAuth();

  // --- ESTADO ---
  const seleccionClases = ref<string | null>(null);
  const fechaSeleccionada = ref('');
  const horasOcupadas = ref<string[]>([]);
  const misReservas = ref<ReservaConfirmada[]>([]);
  const carrito = ref<ReservaCarrito[]>([]);
  const tipoClase = ref<'normal' | 'conversacion'>('normal');
  const calendario = ref<DiaCalendario[]>([]);
  const reservasExistentes = ref<ReservaConfirmada[]>([]);
  const cursosGrupalesActivos = ref<CursoBloqueo[]>([]);

  // --- COMPUTED ---

  // Fecha y hora guardadas en hora de Madrid → instante real
  const misReservasFuturas = computed(() =>
    misReservas.value.filter((r) => esClaseFutura(r.fecha, r.hora)),
  );

  const opcionesTipoClase = computed(() => [
    { label: `${t('reservasClases.claseNormal')} (32€)`, value: 'normal' },
    { label: `${t('reservasClases.claseConversacion')} (27€)`, value: 'conversacion' },
  ]);

  // Rango del calendario calculado sobre el "hoy" de Madrid (formato Quasar YYYY/MM/DD)
  const fechaMinima = computed<string>(() =>
    sumarDiasISO(hoyMadridISO(), 1).replace(/-/g, '/'),
  );

  const fechaMaxima = computed<string>(() =>
    sumarMesesISO(hoyMadridISO(), 9).replace(/-/g, '/'),
  );

  // 🔥 CORE FIX: Set de días disponibles NORMALIZADO a YYYY/MM/DD
  const diasValidosSet = computed(() => {
    const fechas = new Set<string>();
    calendario.value.forEach((dia) => {
      if (
        (dia.tipo_dia === 'laborable' || dia.tipo_dia === 'especial') &&
        dia.horario &&
        dia.horario.length > 0
      ) {
        // TRUCO: Convertimos lo que venga de BD (guiones) a barras
        fechas.add(dia.fecha.replace(/-/g, '/'));
      }
    });
    return fechas;
  });

  // 🔥 CORE FIX: Función options para Quasar (recibe YYYY/MM/DD)
  const opcionesFechasComputed = (fecha: string): boolean => {
    // Quasar envía la fecha con BARRAS (2026/01/07).
    // Como nuestro Set ya tiene barras, la comparación es directa.
    return diasValidosSet.value.has(fecha);
  };

  const fechasConEventos = computed(() => {
    // Convertimos a array para el mapa de eventos
    return Array.from(diasValidosSet.value);
  });

  // --- LÓGICA DE HORARIOS ---
  // --- LÓGICA DE HORARIOS ---
  const horariosDisponiblesFiltrados = computed(() => {
    if (!fechaSeleccionada.value) return [];

    // Normalizamos la fecha (YYYY-MM-DD)
    const fechaModelo = fechaSeleccionada.value.replace(/\//g, '-');

    const diaCalendario = calendario.value.find((d) => d.fecha === fechaModelo);
    if (!diaCalendario || !diaCalendario.horario || diaCalendario.horario.length === 0) return [];

    // Lógica para filtrar cursos grupales (día de la semana en Madrid)
    const nombreDia = diaSemanaMadrid(fechaModelo);

    // 🔥 FIX: Los cursos grupales duran 2 horas, bloqueamos hora actual y siguiente
    const horasCursos = cursosGrupalesActivos.value
      .filter((c) => c.dias_semana.includes(nombreDia))
      .flatMap((c) => c.horarios_curso || [])
      .flatMap((h) => {
        const horaInicio = h.slice(0, 5);
        const partes = horaInicio.split(':');
        const horas = Number(partes[0] ?? 0);
        const minutos = Number(partes[1] ?? 0);
        if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return [horaInicio];

        // Calculamos la hora siguiente
        const horaSiguiente = new Date(2000, 0, 1, horas + 1, minutos);
        const horaSiguienteStr = horaSiguiente.toTimeString().slice(0, 5);

        // Retornamos ambas horas bloqueadas
        return [horaInicio, horaSiguienteStr];
      });

    const horasReservadas = reservasExistentes.value
      .filter((r) => r.fecha === fechaModelo && r.estado === 'confirmada')
      .map((r) => r.hora.slice(0, 5));
    return diaCalendario.horario.filter((h) => {
      const cleanH = h.slice(0, 5);

      const estaOcupado =
        horasReservadas.includes(cleanH) || horasCursos.includes(cleanH) || estaEnCarrito(cleanH);

      if (estaOcupado) return false;

      // Antelación mínima de 24 h, medida sobre el instante real de la clase
      return faltanAlMenos(fechaModelo, cleanH, 24);
    });
  });

  // --- API CALLS ---
  const cargarCalendario = async () => {
    try {
      // Pedimos datos usando formato ISO (YYYY-MM-DD) para Supabase
      const minISO = fechaMinima.value.replace(/\//g, '-');
      const maxISO = fechaMaxima.value.replace(/\//g, '-');

      const { data, error } = await supabase
        .from('Calendario')
        .select('fecha, tipo_dia, horario')
        .gte('fecha', minISO)
        .lte('fecha', maxISO);

      if (error) throw error;
      calendario.value = data || [];
      console.log('✅ Calendario cargado (RAW):', data?.length);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarReservasExistentes = async () => {
    try {
      const { data, error } = await supabase.rpc('obtener_ocupacion');

      if (error) throw error;

      if (data) {
        const ocupacion = data as OcupacionAnonima[];

        reservasExistentes.value = ocupacion.map((item) => ({
          id: 'anonimo',
          user_id: 'oculto',
          estado: 'confirmada',
          fecha: item.fecha,
          hora: item.hora,
          tipo: 'normal',
          precio: 0,
        }));
      } else {
        reservasExistentes.value = [];
      }
    } catch (e) {
      console.error('Error cargando ocupación:', e);
    }
  };

  const cargarCursosGrupales = async () => {
    try {
      const { data } = await supabase
        .from('cursos_grupales')
        .select('*')
        .eq('estado_curso', 'Activo');
      cursosGrupalesActivos.value = data || [];
    } catch (e) {
      console.error(e);
    }
  };

  const cargarMisReservas = async () => {
    if (!user.value?.id) return;
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada');
    misReservas.value = data || [];
  };

  // --- AUXILIARES ---
  const estaEnCarrito = (h: string) =>
    carrito.value.some((r) => r.fecha === fechaSeleccionada.value && r.hora === h);
  const guardarCarrito = () =>
    localStorage.setItem('carritoReservas', JSON.stringify(carrito.value));
  const cargarCarrito = () => {
    const s = localStorage.getItem('carritoReservas');
    if (s) carrito.value = JSON.parse(s);
  };

  const agregarAlCarrito = (hora: string) => {
    if (!user.value)
      return $q.notify({ type: 'warning', message: t('reservasClases.debesIniciarSesion') });
    carrito.value.push({ fecha: fechaSeleccionada.value, hora, tipo: tipoClase.value });
    guardarCarrito();
  };
  const quitarDelCarrito = (i: number) => {
    carrito.value.splice(i, 1);
    guardarCarrito();
  };

  const formatFecha = (f: string) => (f ? formatFechaCalendario(f, locale.value || 'es-ES') : '');
  const getTipoClaseTexto = (r: ReservaConfirmada) =>
    r.tipo === 'normal' ? t('wallet.clases') : t('reservasClases.conversacion');
  const getPrecioClase = (r: ReservaConfirmada) => {
    const precio = r.precio ?? (r.tipo === 'normal' ? 32 : 27);
    return precio > 1000 ? precio / 100 : precio;
  };
  // Política de cancelación: 24 h (condiciones de venta)
  const puedeCancelar = (r: ReservaConfirmada) => faltanAlMenos(r.fecha, r.hora, 24);

  const cancelarReserva = (r: ReservaConfirmada) => {
    $q.dialog({
      title: t('reservasClases.cancelarReserva'),
      message: t('reservasClases.seguro'),
      cancel: true,
    }).onOk(() => {
      void (async () => {
        await supabase.functions.invoke('cancel-reserva', { body: { reservaId: r.id } });
        misReservas.value = misReservas.value.filter((x) => x.id !== r.id);
        $q.notify({ type: 'positive', message: t('personal.estadoCancelada') });
      })();
    });
  };

  // --- INIT ---
  const inicializar = async () => {
    await Promise.all([
      cargarCalendario(),
      cargarCursosGrupales(),
      cargarReservasExistentes(),
      cargarMisReservas(),
    ]);
    cargarCarrito();
  };

  // No necesitamos watch complejo, el computed se encarga
  const setupWatchers = () => {};

  onMounted(() => {
    void inicializar();
  });
  const activarSeleccionClases = () => {
    seleccionClases.value = 'activa';
  };

  return {
    seleccionClases,
    fechaSeleccionada,
    horasOcupadas,
    misReservas,
    misReservasFuturas,
    carrito,
    tipoClase,
    calendario,
    reservasExistentes,
    cursosGrupalesActivos,
    opcionesTipoClase,
    fechaMinima,
    fechaMaxima,
    fechasConEventos,
    horariosDisponiblesFiltrados,
    opcionesFechasComputed,
    activarSeleccionClases,
    opcionesFechas: opcionesFechasComputed,
    getTipoClaseTexto,
    getPrecioClase,
    formatFecha,
    cargarCalendario,
    cargarReservasExistentes,
    estaEnCarrito,
    agregarAlCarrito,
    quitarDelCarrito,
    guardarCarrito,
    cargarCarrito,
    cargarMisReservas,
    puedeCancelar,
    cancelarReserva,
    inicializar,
    setupWatchers,
  };
}
