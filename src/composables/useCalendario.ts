
import { ref,  onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';
import '../css/pages/EstilosGenerales.css';
import '../css/pages/PanelAdministracion.css';

// Interfaces
export interface EntradaCalendario {
  id?: number;
  tipo_dia: string;
  horario: string | null;
  estado: string;
  fecha: string;
  fecha_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface Configuracion {
  tipoDia: string;
  estado: string;
  horariosSeleccionados: string[];
}

export interface OpcionTipoDia {
  label: string;
  value: string;
}
export function useCalendario () {
  const $q = useQuasar();

  // Estado de la aplicación
  const seccionActual = ref<string>('calendario');
  const user = ref<User | null>(null);
  const seleccionMultiple = ref<boolean>(true);
  const guardando = ref<boolean>(false);
  const mesActual = ref<string>(new Date().toISOString().slice(0, 7));
  const fechasSeleccionadas = ref<string[]>([]);
  const datosCalendario = ref<EntradaCalendario[]>([]);

  // Configuración
  const configuracion = ref<Configuracion>({
    tipoDia: '',
    estado: 'Habilitado',
    horariosSeleccionados: [],
  });

  /* Opciones
  const opcionesTipoDia: OpcionTipoDia[] = [
    { label: 'Laborable', value: 'laborable' },
    { label: 'Festivo', value: 'festivo' },
    { label: 'Especial', value: 'especial' },
  ];
  */
  // Horarios predefinidos
  const todosLosHorarios = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  // Constantes
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
/*
  // Computed
  const fechaActual = computed(() => new Date(mesActual.value + '-01'));

  const nombreMesActual = computed(() => {
    return fechaActual.value.toLocaleDateString('es-ES', { month: 'long' });
  });
  const añoActual = computed(() => fechaActual.value.getFullYear());

  const diasDelMes = computed(() => {
    const year = fechaActual.value.getFullYear();
    const month = fechaActual.value.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasMesAnterior = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
    const dias: (Date | null)[] = [];

    for (let i = 0; i < diasMesAnterior; i++) {
      dias.push(null);
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(year, month, dia));
    }

    return dias;
  });
*/
/*
// Navegación entre secciones
const cambiarSeccion = (seccion: string): void => {
  seccionActual.value = seccion;
};
*/
// Funciones del calendario
const mesAnterior = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() - 1);

  const minDate = new Date(2024, 0, 1);
  if (fecha >= minDate) {
    mesActual.value = fecha.toISOString().slice(0, 7);
  }
};

// ...existing code...


const mesSiguiente = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() + 1);
  
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1; // getMonth() es 0-indexed, sumamos 1
  
  // Formatear como YYYY-MM
  const mesStr = `${year}-${month.toString().padStart(2, '0')}`;
  
  console.log('Intentando avanzar a:', mesStr);
  console.log('Comparación:', mesStr, '<=', '2030-12', '=', mesStr <= '2030-12');
  
  // Permitir hasta 2030-12
  if (mesStr <= '2030-12') {
    mesActual.value = mesStr;
    console.log('Mes actualizado a:', mesActual.value);
  } else {
    console.log('Límite alcanzado, no se puede avanzar más');
    $q.notify({
      type: 'warning',
      message: 'Has alcanzado el límite máximo (Diciembre 2030)',
      timeout: 2000
    });
  }
};

const cambiarMes = (nuevoMes: string | number | null): void => {
  if (!nuevoMes || typeof nuevoMes !== 'string') return;
  
  // Validar formato YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(nuevoMes)) return;
  
  // Validar rango
  if (nuevoMes >= '2024-01' && nuevoMes <= '2030-12') {
    mesActual.value = nuevoMes;
  } else {
    $q.notify({
      type: 'warning',
      message: 'El mes debe estar entre Enero 2024 y Diciembre 2030',
      timeout: 2000
    });
  }
};

/* Selección de días
const seleccionarDia = (fecha: Date | null): void => {
  if (!fecha) return;

  const fechaStr = fecha.toISOString().split('T')[0];
  if (!fechaStr) return;

  if (seleccionMultiple.value) {
    const index = fechasSeleccionadas.value.indexOf(fechaStr);
    if (index > -1) {
      fechasSeleccionadas.value.splice(index, 1);
    } else {
      fechasSeleccionadas.value.push(fechaStr);
    }
  } else {
    fechasSeleccionadas.value = [fechaStr];
  }

  // ⬇️ NUEVO: Cargar configuración automáticamente al seleccionar
  cargarConfiguracionAutomatica();
};

// ⬇️ NUEVA FUNCIÓN: Cargar configuración automática
const cargarConfiguracionAutomatica = (): void => {
  if (fechasSeleccionadas.value.length === 0) {
    limpiarSeleccion();
    return;
  }

  // Si hay una sola fecha seleccionada
  if (fechasSeleccionadas.value.length === 1) {
    const fechaStr = fechasSeleccionadas.value[0];
    if (!fechaStr) return;

    // Buscar si ya existe configuración para esta fecha
    const entradaExistente = datosCalendario.value.find((item) => item.fecha === fechaStr);

    if (entradaExistente) {
      // Cargar configuración existente
      configuracion.value.tipoDia = entradaExistente.tipo_dia;
      configuracion.value.estado = entradaExistente.estado;

      // Parsear horarios desde string a array
      if (entradaExistente.horario) {
        try {
          // Si horario es string como "{09:00,10:00}", convertir a array
          if (typeof entradaExistente.horario === 'string') {
            const horariosStr = entradaExistente.horario.replace(/[{}]/g, '');
            configuracion.value.horariosSeleccionados = horariosStr
              .split(',')
              .map((h) => h.trim().replace(/"/g, ''))
              .filter((h) => h.length > 0);
          } else {
            configuracion.value.horariosSeleccionados = [];
          }
        } catch (error) {
          console.error('Error al parsear horarios:', error);
          configuracion.value.horariosSeleccionados = [];
        }
      } else {
        configuracion.value.horariosSeleccionados = [];
      }
    } else {
      // Nueva fecha sin configuración: establecer valores por defecto
      configuracion.value.tipoDia = 'laborable';
      configuracion.value.estado = 'Habilitado';
      // ⬇️ AQUÍ: Asignar TODOS los horarios automáticamente para días laborables
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    }
  } else {
    // Múltiples fechas seleccionadas: configuración por defecto
    configuracion.value.tipoDia = 'laborable';
    configuracion.value.estado = 'Habilitado';
    // ⬇️ AQUÍ: Asignar TODOS los horarios automáticamente para días laborables
    configuracion.value.horariosSeleccionados = [...todosLosHorarios];
  }
};
*/
// Clases CSS
const getClasesDia = (fecha: Date | null): string => {
  if (!fecha) return 'dia-vacio';

  const clases = ['dia-calendario'];
  const fechaStr = fecha.toISOString().split('T')[0] ?? '';
  const hoy = new Date().toDateString();

  if (fecha.toDateString() === hoy) {
    clases.push('dia-hoy');
  }

  if (fechasSeleccionadas.value.includes(fechaStr)) {
    clases.push('dia-seleccionado');
  }

  return clases.join(' ');
};

const getClaseTipoDia = (fecha: Date): string => {
  const fechaStr = fecha.toISOString().split('T')[0];
  const entrada = datosCalendario.value.find((item) => item.fecha === fechaStr);

  if (!entrada) return '';

  switch (entrada.tipo_dia?.toLowerCase()) {
    case 'laborable':
      return 'tipo-laborable';
    case 'festivo':
      return 'tipo-festivo';
    case 'especial':
      return 'tipo-especial';
    default:
      return '';
  }
};

// Funciones auxiliares
const activarSeleccionMultiple = (): void => {
  seleccionMultiple.value = true;
};

const activarSeleccionUnica = (): void => {
  seleccionMultiple.value = false;
  if (fechasSeleccionadas.value.length > 1) {
    fechasSeleccionadas.value = fechasSeleccionadas.value.slice(0, 1);
  }
};
/*
const removerFecha = (fecha: string): void => {
  fechasSeleccionadas.value = fechasSeleccionadas.value.filter((f) => f !== fecha);
};

const removerHorario = (horario: string): void => {
  configuracion.value.horariosSeleccionados = configuracion.value.horariosSeleccionados.filter(
    (h) => h !== horario,
  );
};

const formatFechaDisplay = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const aplicarConfiguracion = (): void => {
  console.log('Aplicando configuración:', {
    fechas: fechasSeleccionadas.value,
    configuracion: configuracion.value,
  });

  $q.notify({
    type: 'info',
    message: `Configuración aplicada a ${fechasSeleccionadas.value.length} día(s) - Guarda los cambios para aplicar en la base de datos`,
  });
};
*/
const limpiarSeleccion = (): void => {
  fechasSeleccionadas.value = [];
  configuracion.value = {
    tipoDia: '',
    estado: 'Habilitado',
    horariosSeleccionados: [],
  };
};

// Funciones Supabase
const grabarSeleccion = async (): Promise<void> => {
  guardando.value = true;
  try {
    if (!fechasSeleccionadas.value || fechasSeleccionadas.value.length === 0) {
      throw new Error('No hay fechas seleccionadas');
    }

    if (!configuracion.value.tipoDia) {
      throw new Error('El tipo de día es obligatorio');
    }

    console.log('Intentando guardar en Supabase:', {
      fechas: fechasSeleccionadas.value,
      config: configuracion.value,
    });

    const resultados = [];

    for (const fecha of fechasSeleccionadas.value) {
      if (!fecha || typeof fecha !== 'string') {
        console.warn('Fecha inválida omitida:', fecha);
        continue;
      }

      const { data: existingData, error: selectError } = await supabase
        .from('Calendario')
        .select('id')
        .eq('fecha', fecha)
        .maybeSingle();

      if (selectError) {
        console.error('Error al verificar existencia:', selectError);
        throw selectError;
      }

      const horariosArray =
        configuracion.value.horariosSeleccionados.length > 0
          ? `{${configuracion.value.horariosSeleccionados.map((h) => `"${h}"`).join(',')}}`
          : null;

      const datosParaGuardar = {
        fecha: fecha,
        //fecha_text: formatFechaDisplay(fecha),
        tipo_dia: configuracion.value.tipoDia,
        estado: configuracion.value.estado,
        horario: horariosArray,
        updated_at: new Date().toISOString(),
      };

      console.log(`Procesando fecha ${fecha}:`, {
        existe: !!existingData,
        datos: datosParaGuardar,
        horariosArray: horariosArray,
      });

      let resultado;
      if (existingData && existingData.id) {
        resultado = await supabase
          .from('Calendario')
          .update(datosParaGuardar)
          .eq('id', existingData.id);
      } else {
        resultado = await supabase.from('Calendario').insert([
          {
            ...datosParaGuardar,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      if (resultado.error) {
        console.error('Error en operación Supabase:', resultado.error);
        throw resultado.error;
      }

      resultados.push(resultado);
      console.log(`Operación exitosa para fecha ${fecha}`);
    }

    console.log('Todos los cambios guardados en Supabase:', resultados);

    $q.notify({
      type: 'positive',
      message: `${fechasSeleccionadas.value.length} día(s) guardado(s) correctamente en Supabase`,
      timeout: 3000,
    });

    await cargarDatosCalendario();
    limpiarSeleccion();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
    console.error('Error completo al guardar en Supabase:', error);
    $q.notify({
      type: 'negative',
      message: `Error al guardar: ${errorMessage}`,
      timeout: 5000,
    });
  } finally {
    guardando.value = false;
  }
};

const eliminarSeleccion = (): void => {
  try {
    if (!fechasSeleccionadas.value || fechasSeleccionadas.value.length === 0) {
      throw new Error('No hay fechas seleccionadas');
    }

    const fechasValidas = fechasSeleccionadas.value.filter(
      (fecha) => fecha && typeof fecha === 'string' && fecha.length > 0,
    );

    if (fechasValidas.length === 0) {
      throw new Error('No hay fechas válidas para eliminar');
    }

    console.log('Intentando eliminar fechas:', fechasValidas);

    $q.dialog({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar ${fechasValidas.length} día(s) del calendario?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          const { error } = await supabase.from('Calendario').delete().in('fecha', fechasValidas);

          if (error) {
            console.error('Error al eliminar:', error);
            throw error;
          }

          console.log(`Eliminados ${fechasValidas.length} registros`);

          $q.notify({
            type: 'positive',
            message: `${fechasValidas.length} día(s) eliminado(s) correctamente`,
            timeout: 3000,
          });

          await cargarDatosCalendario();
          limpiarSeleccion();
        } catch (innerError: unknown) {
          const errorMessage =
            innerError instanceof Error ? innerError.message : 'Error desconocido al eliminar';
          console.error('Error al eliminar:', innerError);
          $q.notify({
            type: 'negative',
            message: `Error al eliminar: ${errorMessage}`,
            timeout: 5000,
          });
        }
      })();
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al eliminar:', error);
    $q.notify({
      type: 'negative',
      message: `Error al eliminar: ${errorMessage}`,
      timeout: 5000,
    });
  }
};

// Cargar datos de Supabase
const cargarDatosCalendario = async (): Promise<void> => {
  try {
    console.log('Cargando datos del calendario desde Supabase...');

    const { data, error } = await supabase
      .from('Calendario')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error de Supabase al cargar:', error);
      throw error;
    }

    datosCalendario.value = data || [];
    console.log('Datos del calendario cargados:', datosCalendario.value.length, 'registros');
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido al cargar datos';
    console.error('Error al cargar datos:', error);
    $q.notify({
      type: 'negative',
      message: `Error al cargar los datos del calendario: ${errorMessage}`,
    });
  }
};

// Cargar usuario actual
const cargarUsuario = async (): Promise<void> => {
  try {
    const {
      data: { user: userData },
    } = await supabase.auth.getUser();
    user.value = userData;
    console.log('Usuario cargado:', userData?.email);
  } catch (error: unknown) {
    console.error('Error al cargar usuario:', error);
  }
};

// Inicialización
let subscription: ReturnType<typeof supabase.channel> | null = null;

onMounted(async (): Promise<void> => {
  await cargarUsuario();
  await cargarDatosCalendario();

  // Suscribirse a cambios en tiempo real
  subscription = supabase
    .channel('calendario-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Calendario',
      },
      () => {
        console.log('Cambio en tiempo real detectado');
        void cargarDatosCalendario();
      },
    )
    .subscribe();
});

onUnmounted(() => {
  if (subscription) {
    void subscription.unsubscribe();
  }
});
watch(
  () => configuracion.value.tipoDia,
  (nuevoTipo, tipoAnterior) => {
    // Solo aplicar si hay cambio real
    if (nuevoTipo === tipoAnterior) return;

    if (nuevoTipo === 'laborable') {
      // Al cambiar a laborable, asignar todos los horarios
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    } else if (nuevoTipo === 'festivo' || nuevoTipo === 'especial') {
      // Al cambiar a festivo o especial, limpiar horarios
      configuracion.value.horariosSeleccionados = [];
    }
  }
);
return {
  // Estado reactivo
  seleccionMultiple,
  seccionActual,
  mesActual,
  diasSemana,


  //computed
  //diasDelMes,

  //metodos
  activarSeleccionMultiple,
  activarSeleccionUnica,
  grabarSeleccion,
  eliminarSeleccion,
  cambiarMes,
  mesSiguiente,
  mesAnterior,
  getClasesDia,
  getClaseTipoDia

}
}
