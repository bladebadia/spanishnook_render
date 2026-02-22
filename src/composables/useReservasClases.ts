import { ref, computed, onMounted } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

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

  const misReservasFuturas = computed(() => {
    const ahora = new Date();
    return misReservas.value.filter(r => {
      // Creamos la fecha completa (Fecha + Hora)
      const fechaClase = new Date(`${r.fecha}T${r.hora}`);
      return fechaClase > ahora;
    });
  });


  const opcionesTipoClase = computed(() => [
    { label: `${t('reservasClases.claseNormal')} (32€)`, value: 'normal' },
    { label: `${t('reservasClases.claseConversacion')} (27€)`, value: 'conversacion' },
  ]);

const fechaMinima = computed<string>(() => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  const isoDate = d.toISOString().split('T')[0] || ''; // <--- AÑADIDO "|| ''"
  return isoDate.replace(/-/g, '/');
});

const fechaMaxima = computed<string>(() => {
  const d = new Date(); d.setMonth(d.getMonth() + 9);
  const isoDate = d.toISOString().split('T')[0] || ''; // <--- AÑADIDO "|| ''"
  return isoDate.replace(/-/g, '/');
});

  // 🔥 CORE FIX: Set de días disponibles NORMALIZADO a YYYY/MM/DD
  const diasValidosSet = computed(() => {
    const fechas = new Set<string>();
    calendario.value.forEach((dia) => {
      if ((dia.tipo_dia === 'laborable' || dia.tipo_dia === 'especial') && 
          dia.horario && dia.horario.length > 0) {
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

    const diaCalendario = calendario.value.find(d => d.fecha === fechaModelo);
    if (!diaCalendario || !diaCalendario.horario || diaCalendario.horario.length === 0) return [];

    // Lógica para filtrar cursos grupales (días de la semana)
    const fechaObj = new Date(fechaModelo + 'T12:00:00');
    const diasSemanaMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDia = diasSemanaMap[fechaObj.getDay()] || '';

    const horasCursos = cursosGrupalesActivos.value
      .filter(c => c.dias_semana.includes(nombreDia))
      .flatMap(c => c.horarios_curso || [])
      .map(h => h.slice(0, 5));

    const horasReservadas = reservasExistentes.value
      .filter(r => r.fecha === fechaModelo && r.estado === 'confirmada')
      .map(r => r.hora.slice(0, 5));
    const ahora = new Date();
    const limite24h = ahora.getTime() + (24 * 60 * 60 * 1000);

    return diaCalendario.horario.filter(h => {
      const cleanH = h.slice(0, 5);
      
      const estaOcupado = horasReservadas.includes(cleanH) || 
                          horasCursos.includes(cleanH) || 
                          estaEnCarrito(cleanH);

      if (estaOcupado) return false;
      const fechaClase = new Date(`${fechaModelo}T${cleanH}`);
      
      return fechaClase.getTime() > limite24h;
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
    } catch (e) { console.error(e); }
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
          precio: 0
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
      const { data } = await supabase.from('cursos_grupales').select('*').eq('estado_curso', 'Activo');
      cursosGrupalesActivos.value = data || [];
    } catch (e) { console.error(e); }
  };
  
  const cargarMisReservas = async () => {
    if(!user.value?.id) return;
    const { data } = await supabase.from('reservas').select('*').eq('user_id', user.value.id).eq('estado', 'confirmada');
    misReservas.value = data || [];
  };

  // --- AUXILIARES ---
  const estaEnCarrito = (h: string) => carrito.value.some(r => r.fecha === fechaSeleccionada.value && r.hora === h);
  const guardarCarrito = () => localStorage.setItem('carritoReservas', JSON.stringify(carrito.value));
  const cargarCarrito = () => { const s = localStorage.getItem('carritoReservas'); if(s) carrito.value = JSON.parse(s); };
  
  const agregarAlCarrito = (hora: string) => {
    if (!user.value) return $q.notify({ type: 'warning', message: t('reservasClases.debesIniciarSesion') });
    carrito.value.push({ fecha: fechaSeleccionada.value, hora, tipo: tipoClase.value });
    guardarCarrito();
  };
  const quitarDelCarrito = (i: number) => { carrito.value.splice(i, 1); guardarCarrito(); };

  const formatFecha = (f: string) => {
    if (!f) return '';
    const fecha = new Date(f).toLocaleDateString(locale.value || 'es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
  };
  const getTipoClaseTexto = (r: ReservaConfirmada) => r.tipo === 'normal' ? 'General' : 'Conversación';
  const getPrecioClase = (r: ReservaConfirmada) => {
    const precio = r.precio ?? (r.tipo === 'normal' ? 32 : 27);
    return precio > 1000 ? precio / 100 : precio;
  };
  const puedeCancelar = (r: ReservaConfirmada) => (new Date(r.fecha + 'T' + r.hora).getTime() - Date.now()) / 36e5 >= 72;

  const cancelarReserva = (r: ReservaConfirmada) => {
    $q.dialog({ title: 'Cancelar', message: '¿Seguro?', cancel: true }).onOk(() => {
      void (async () => {
        await supabase.functions.invoke('cancel-reserva', { body: { reservaId: r.id } });
        misReservas.value = misReservas.value.filter(x => x.id !== r.id);
        $q.notify({ type: 'positive', message: 'Cancelada' });
      })();
    });
  };

  // --- INIT ---
  const inicializar = async () => {
    await Promise.all([cargarCalendario(), cargarCursosGrupales(), cargarReservasExistentes(), cargarMisReservas()]);
    cargarCarrito();
  };

  // No necesitamos watch complejo, el computed se encarga
  const setupWatchers = () => {}; 

  onMounted(() => { void inicializar(); });
  const activarSeleccionClases = () => { seleccionClases.value = 'activa'; };

  return {
    seleccionClases, fechaSeleccionada, horasOcupadas, misReservas, misReservasFuturas, carrito, tipoClase, calendario, 
    reservasExistentes, cursosGrupalesActivos, opcionesTipoClase, fechaMinima, fechaMaxima, 
    fechasConEventos, horariosDisponiblesFiltrados, opcionesFechasComputed, 
    activarSeleccionClases, opcionesFechas: opcionesFechasComputed, 
    getTipoClaseTexto, getPrecioClase, formatFecha, cargarCalendario, cargarReservasExistentes, 
    estaEnCarrito, agregarAlCarrito, quitarDelCarrito, guardarCarrito, cargarCarrito, cargarMisReservas, 
    puedeCancelar, cancelarReserva, inicializar, setupWatchers
  };
}