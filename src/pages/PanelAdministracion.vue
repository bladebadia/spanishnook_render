<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center flex flex-center q-pa-lg q-mb-md">
      <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo">
        PANEL DE ADMINISTRACIÓN - {{ seccionActual.toUpperCase() }}
      </p>
    </div>

    <!-- Menú lateral y contenido -->
    <div class="row q-col-gutter-lg">
      <!-- Menú lateral izquierdo -->
      <div class="col-12 col-md-3">
        <q-card class="sticky-menu">
          <q-list padding class="menu-lateral">
            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'calendario'"
              @click="cambiarSeccion('calendario')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="event" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Calendario</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'cursos'"
              @click="cambiarSeccion('cursos')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="school" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cursos </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'particulares'"
              @click="cambiarSeccion('particulares')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Clases Particulares</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'noticias'"
              @click="cambiarSeccion('noticias')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="article" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tarjetas y Noticias</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Contenido principal -->
      <div class="col-12 col-md-9">
        <!-- Sección Calendario -->
        <div v-if="seccionActual === 'calendario'">
          <!-- Controles principales -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-8">
              <q-btn-group>
                <q-btn
                  :color="seleccionMultiple ? 'primary' : 'grey'"
                  @click="activarSeleccionMultiple"
                  label="Selección múltiple"
                  icon="checklist"
                />
                <q-btn
                  :color="!seleccionMultiple ? 'primary' : 'grey'"
                  @click="activarSeleccionUnica"
                  label="Selección única"
                  icon="event"
                />
                <q-btn
                  color="positive"
                  icon="save"
                  label="Guardar cambios"
                  @click="grabarSeleccion"
                  :disabled="fechasSeleccionadas.length === 0"
                  :loading="guardando"
                />
                <q-btn
                  color="negative"
                  icon="delete"
                  label="Eliminar selección"
                  @click="eliminarSeleccion"
                  :disabled="fechasSeleccionadas.length === 0"
                />
              </q-btn-group>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="mesActual"
                type="text"
                label="Mes y año"
                @update:model-value="cambiarMes"
                filled
                :min="'2024-01'"
                :max="'2030-12'"
                mask="####-##"
                placeholder="YYYY-MM"
              />
            </div>
          </div>

          <!-- Leyenda -->
          <q-card class="q-mb-md">
            <q-card-section class="q-py-sm">
              <div class="row items-center q-gutter-md">
                <div class="text-caption text-weight-bold">Leyenda:</div>
                <div class="row items-center">
                  <q-icon name="square" color="blue" size="sm" />
                  <span class="q-ml-xs text-caption">Laborable</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="red" size="sm" />
                  <span class="q-ml-xs text-caption">Festivo</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="orange" size="sm" />
                  <span class="q-ml-xs text-caption">Especial</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="green" size="sm" />
                  <span class="q-ml-xs text-caption">Seleccionado</span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Calendario personalizado -->
          <q-card>
            <q-card-section>
              <!-- Encabezado del calendario -->
              <div class="row items-center justify-between q-mb-md">
                <div class="col-auto">
                  <q-btn icon="chevron_left" flat round @click="mesAnterior" color="primary" />
                </div>
                <div class="col text-center">
                  <div class="text-h6 text-weight-bold">{{ nombreMesActual }} {{ añoActual }}</div>
                </div>
                <div class="col-auto">
                  <q-btn icon="chevron_right" flat round @click="mesSiguiente" color="primary" />
                </div>
              </div>

              <!-- Días de la semana -->
              <div class="row q-mb-sm">
                <div
                  v-for="dia in diasSemana"
                  :key="dia"
                  class="col text-center text-weight-bold text-grey-7"
                >
                  {{ dia }}
                </div>
              </div>

              <!-- Días del mes -->
              <div class="calendario-grid">
                <div
                  v-for="(celda, index) in diasDelMes"
                  :key="index"
                  class="celda-dia"
                  :class="getClasesDia(celda)"
                  @click="seleccionarDia(celda)"
                >
                  <div v-if="celda" class="contenido-dia">
                    <div class="numero-dia">{{ celda.getDate() }}</div>
                    <div class="indicador-tipo" :class="getClaseTipoDia(celda)"></div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Panel de configuración -->
          <q-card v-if="fechasSeleccionadas.length > 0" class="q-mt-md">
            <q-card-section>
              <div class="text-h6">
                Configurar {{ fechasSeleccionadas.length }} día(s) seleccionado(s)
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Fechas seleccionadas:</div>
                <div class="q-gutter-sm">
                  <q-chip
                    v-for="fecha in fechasSeleccionadas"
                    :key="fecha"
                    color="primary"
                    text-color="white"
                    removable
                    @remove="removerFecha(fecha)"
                  >
                    {{ formatFechaDisplay(fecha) }}
                  </q-chip>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Formulario de configuración -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="configuracion.tipoDia"
                    :options="opcionesTipoDia"
                    label="Tipo de día *"
                    filled
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Campo obligatorio']"
                  />
                </div>

                <!-- SELECTOR DE HORARIOS MÚLTIPLE -->
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="configuracion.horariosSeleccionados"
                    :options="todosLosHorarios"
                    label="Horarios"
                    filled
                    multiple
                    use-chips
                    stack-label
                    clearable
                    placeholder="Selecciona horarios"
                  />
                </div>
              </div>

              <!-- Vista previa de horarios seleccionados -->
              <div v-if="configuracion.horariosSeleccionados.length > 0" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Horarios seleccionados:</div>
                <div class="q-gutter-sm">
                  <q-chip
                    v-for="horario in configuracion.horariosSeleccionados"
                    :key="horario"
                    color="secondary"
                    text-color="white"
                    removable
                    @remove="removerHorario(horario)"
                  >
                    {{ horario }}
                  </q-chip>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="row q-gutter-sm q-mt-lg">
                <q-btn
                  label="Aplicar configuración"
                  color="primary"
                  @click="aplicarConfiguracion"
                  class="col"
                  :disabled="!configuracion.tipoDia"
                />
                <q-btn
                  label="Limpiar selección"
                  color="grey"
                  @click="limpiarSeleccion"
                  class="col"
                  outline
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Cursos -->
        <div v-if="seccionActual === 'cursos'">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h4">Gestión de Cursos Grupales</div>
            <q-btn
              color="primary"
              icon="add"
              label="Nuevo Curso"
              @click="abrirDialogNuevoCurso"
              unelevated
            />
          </div>

          <!-- Estado vacío -->
          <q-card v-if="cursosGrupales.length === 0" flat bordered class="q-pa-lg text-center">
            <q-icon name="school" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No hay cursos disponibles</div>
            <div class="text-body2 text-grey-6">
              Crea tu primer curso haciendo clic en "Nuevo Curso"
            </div>
          </q-card>

          <!-- Lista de cursos -->
          <q-list v-else bordered separator class="rounded-borders">
            <q-expansion-item
              v-for="curso in cursosGrupales"
              :key="curso.id ?? 0"
              :model-value="cursoExpandido === curso.id"
              @update:model-value="curso.id !== undefined && toggleCurso(curso.id)"
              expand-separator
              :header-class="
                curso.estado_curso === 'Activo'
                  ? 'bg-green-1'
                  : curso.estado_curso === 'Completado'
                    ? 'bg-blue-1'
                    : 'bg-grey-2'
              "
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-avatar
                    :color="curso.estado_curso === 'Activo' ? 'primary' : 'grey'"
                    text-color="white"
                    icon="school"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-h6">
                    {{ curso.nombre_curso }}
                    <q-badge
                      :color="curso.estado_curso === 'Activo' ? 'positive' : 'grey'"
                      class="q-ml-sm"
                    >
                      {{ curso.codigo_curso }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>
                    <q-chip
                      size="sm"
                      :color="getColorEstado(curso.estado_curso)"
                      text-color="white"
                      dense
                    >
                      {{ curso.estado_curso }}
                    </q-chip>
                    <q-chip
                      v-if="curso.nivel"
                      size="sm"
                      color="primary"
                      text-color="white"
                      dense
                      class="q-ml-xs"
                    >
                      {{ curso.nivel }}
                    </q-chip>
                    <q-chip
                      v-if="curso.precio_curso"
                      size="sm"
                      color="secondary"
                      text-color="white"
                      dense
                      class="q-ml-xs"
                    >
                      {{ curso.precio_curso }}
                    </q-chip>
                    <q-chip
                      v-if="curso.mostrar_promo"
                      size="sm"
                      color="red"
                      text-color="white"
                      dense
                      class="q-ml-xs"
                    >
                      {{ curso.texto_promo || 'Promo' }}
                    </q-chip>
                    <q-chip size="sm" color="blue-grey" text-color="white" dense class="q-ml-xs">
                      <q-icon name="people" size="14px" class="q-mr-xs" />
                      {{ curso.usuarios?.length || 0 }} / {{ curso.max_estudiantes || 0 }}
                    </q-chip>
                    <q-chip
                      v-if="curso.lista_espera && curso.lista_espera.length > 0"
                      size="sm"
                      color="orange"
                      text-color="white"
                      dense
                      class="q-ml-xs"
                    >
                      <q-icon name="hourglass_empty" size="14px" class="q-mr-xs" />
                      {{ curso.lista_espera.length }} en espera
                    </q-chip>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn flat round dense icon="edit" color="primary" size="sm" />
                </q-item-section>
              </template>

              <q-card flat>
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-3">
                      <q-input
                        v-model="cursoFormulario.codigo_curso"
                        label="Código del curso *"
                        filled
                        dense
                        :rules="[(val) => !!val || 'Campo obligatorio']"
                      >
                        <template v-slot:prepend>
                          <q-icon name="tag" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="cursoFormulario.nombre_curso"
                        label="Nombre del curso *"
                        filled
                        dense
                        :rules="[(val) => !!val || 'Campo obligatorio']"
                      >
                        <template v-slot:prepend>
                          <q-icon name="title" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="cursoFormulario.estado_curso"
                        :options="estadosCurso"
                        label="Estado *"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="info" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-4 flex items-center">
                      <q-toggle
                        v-model="cursoFormulario.visibilidad"
                        color="positive"
                        :label="
                          cursoFormulario.visibilidad ? 'Visible en página' : 'Oculto en página'
                        "
                        left-label
                        dense
                      >
                        <q-tooltip>
                          {{
                            cursoFormulario.visibilidad
                              ? 'El curso se mostrará en la página pública'
                              : 'El curso está oculto para los visitantes'
                          }}
                        </q-tooltip>
                      </q-toggle>
                    </div>
                    <div class="col-12 col-md-2">
                      <q-select
                        v-model="cursoFormulario.nivel"
                        :options="nivelesDisponibles"
                        label="Nivel"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="signal_cellular_alt" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-2">
                      <q-input
                        v-model.number="cursoFormulario.max_estudiantes"
                        label="Máx. estudiantes"
                        type="number"
                        filled
                        dense
                        min="1"
                      >
                        <template v-slot:prepend>
                          <q-icon name="group" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-2">
                      <q-input
                        v-model="cursoFormulario.fecha_inicio"
                        label="Fecha inicio"
                        type="date"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="cursoFormulario.dias_semana"
                        :options="diasSemanaOpciones"
                        label="Días de la semana"
                        filled
                        dense
                        multiple
                        use-chips
                        counter
                        hint="Selecciona los días en que se imparte el curso"
                      >
                        <template v-slot:prepend>
                          <q-icon name="calendar_month" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="cursoFormulario.horarios_curso"
                        :options="horariosDisponibles"
                        label="Horarios"
                        filled
                        dense
                        multiple
                        use-chips
                        counter
                        emit-value
                        map-options
                        options-dense
                        hint="Selecciona los horarios disponibles"
                      >
                        <template v-slot:prepend>
                          <q-icon name="schedule" />
                        </template>
                        <template v-slot:selected-item="scope">
                          <q-chip
                            removable
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            color="primary"
                            text-color="white"
                            dense
                            class="q-ma-xs"
                          >
                            {{ scope.opt }}
                          </q-chip>
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12">
                      <q-input
                        v-model="cursoFormulario.descripcion"
                        label="Descripción"
                        type="textarea"
                        filled
                        dense
                        rows="3"
                      >
                        <template v-slot:prepend>
                          <q-icon name="description" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-separator class="q-my-md" />
                      <div class="text-subtitle1 text-weight-medium q-mb-sm">
                        Información de la tarjeta
                      </div>
                    </div>

                    <div class="col-12 col-md-3">
                      <q-input
                        v-model="cursoFormulario.titulo_tarjeta"
                        label="Título de la tarjeta"
                        filled
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="badge" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-2">
                      <q-input
                        v-model="cursoFormulario.boton_tarjeta"
                        label="Texto del botón"
                        filled
                        dense
                        placeholder="Más información"
                      >
                        <template v-slot:prepend>
                          <q-icon name="smart_button" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-12">
                      <q-input
                        v-model="cursoFormulario.texto_tarjeta"
                        label="Texto de la tarjeta"
                        type="textarea"
                        filled
                        dense
                        rows="3"
                        placeholder="Breve descripción que aparece en la tarjeta"
                      >
                        <template v-slot:prepend>
                          <q-icon name="notes" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-3">
                      <q-input
                        v-model="cursoFormulario.imagen_tarjeta"
                        label="URL de la imagen"
                        filled
                        dense
                        placeholder="https://ejemplo.com/imagen.jpg"
                      >
                        <template v-slot:prepend>
                          <q-icon name="image" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-separator class="q-my-md" />
                      <div class="text-subtitle1 text-weight-medium q-mb-sm">
                        <q-icon name="local_offer" class="q-mr-sm" />
                        Promoción y Precios
                      </div>
                    </div>

                    <div class="col-12 col-md-3 flex items-center">
                      <q-toggle
                        v-model="cursoFormulario.mostrar_promo"
                        color="primary"
                        :label="
                          cursoFormulario.mostrar_promo
                            ? 'Badge de promoción activado'
                            : 'Sin badge de promoción'
                        "
                        left-label
                        dense
                      >
                        <q-tooltip>
                          Mostrar un badge destacado en la esquina superior derecha de la tarjeta
                        </q-tooltip>
                      </q-toggle>
                    </div>

                    <div v-if="cursoFormulario.mostrar_promo" class="col-12 col-md-3">
                      <q-input
                        v-model="cursoFormulario.texto_promo"
                        label="Texto de la promoción"
                        filled
                        dense
                        placeholder="¡Prueba tu clase gratis!"
                        hint="Máximo 30 caracteres recomendado"
                        counter
                        maxlength="50"
                      >
                        <template v-slot:prepend>
                          <q-icon name="campaign" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-3 flex items-center">
                      <q-toggle
                        v-model="cursoFormulario.mostrar_precio"
                        color="secondary"
                        :label="
                          cursoFormulario.mostrar_precio
                            ? 'Badge de precio activado'
                            : 'Sin badge de precio'
                        "
                        left-label
                        dense
                      >
                        <q-tooltip>
                          Mostrar un badge con el precio en la esquina superior izquierda de la
                          tarjeta
                        </q-tooltip>
                      </q-toggle>
                    </div>

                    <div v-if="cursoFormulario.mostrar_precio" class="col-12 col-md-3">
                      <q-input
                        v-model="cursoFormulario.precio_curso"
                        label="Precio para mostrar"
                        filled
                        dense
                        placeholder="29€/mes"
                        hint="Formato libre: 29€, 30€/mes, etc."
                      >
                        <template v-slot:prepend>
                          <q-icon name="payments" />
                        </template>
                      </q-input>
                    </div>

                    <div v-if="cursoFormulario.mostrar_precio" class="col-12 col-md-3">
                      <q-input
                        v-model="cursoFormulario.precio_original"
                        label="Precio original (opcional)"
                        filled
                        dense
                        placeholder="60€"
                        hint="Se mostrará tachado para indicar descuento"
                      >
                        <template v-slot:prepend>
                          <q-icon name="money_off" />
                        </template>
                      </q-input>
                    </div>

                    <div
                      v-if="cursoFormulario.mostrar_promo || cursoFormulario.mostrar_precio"
                      class="col-12"
                    >
                      <q-card flat bordered class="q-pa-md bg-grey-2">
                        <div class="text-caption text-weight-bold q-mb-sm">
                          Vista previa de badges:
                        </div>
                        <div class="row q-gutter-sm">
                          <q-badge
                            v-if="cursoFormulario.mostrar_promo"
                            color="red"
                            text-color="white"
                            class="q-pa-sm"
                          >
                            <q-icon name="star" size="16px" class="q-mr-xs" />
                            {{ cursoFormulario.texto_promo || '¡Prueba tu clase gratis!' }}
                          </q-badge>
                          <q-badge
                            v-if="cursoFormulario.mostrar_precio"
                            color="primary"
                            text-color="white"
                            class="q-pa-sm"
                            style="flex-direction: column"
                          >
                            <span
                              v-if="cursoFormulario.precio_original"
                              style="font-size: 0.7rem; text-decoration: line-through; opacity: 0.8"
                            >
                              {{ cursoFormulario.precio_original }}
                            </span>
                            <span style="font-size: 0.9rem; font-weight: 800">
                              {{ cursoFormulario.precio_curso || '0€' }}
                            </span>
                          </q-badge>
                        </div>
                      </q-card>
                    </div>
                  </div>

                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      label="Ver Alumnos"
                      icon="group"
                      color="info"
                      outline
                      @click="verAlumnosCurso(curso.id!, curso.nombre_curso)"
                      :loading="cargandoAlumnos"
                    />

                    <q-btn
                      label="Gestionar Espera"
                      icon="checklist"
                      color="orange"
                      outline
                      @click="abrirGestorListaEspera(curso.id!, curso.lista_espera || [])"
                    >
                      <q-badge
                        color="orange"
                        floating
                        v-if="curso.lista_espera && curso.lista_espera.length > 0"
                      >
                        {{ curso.lista_espera.length }}
                      </q-badge>
                    </q-btn>

                    <q-btn
                      label="Guardar cambios"
                      color="primary"
                      icon="save"
                      @click="guardarCurso"
                      :loading="guardandoCurso"
                      unelevated
                    />

                    <q-btn
                      v-if="curso.estado_curso === 'Activo'"
                      label="Finalizar Curso"
                      color="deep-purple"
                      icon="money_off"
                      @click="confirmarCierreCurso(curso)"
                      :loading="procesandoCierre === curso.id"
                      outline
                    >
                      <q-tooltip>
                        Cierra el curso, devuelve el dinero y cancela suscripciones
                      </q-tooltip>
                    </q-btn>

                    <q-btn
                      v-else
                      label="Eliminar registro"
                      color="negative"
                      icon="delete"
                      @click="eliminarCurso(curso.id!)"
                      outline
                    >
                      <q-tooltip>
                        Borra el curso de la base de datos (Solo permitido si no está activo)
                      </q-tooltip>
                    </q-btn>
                    <q-btn label="Cancelar" color="grey" @click="cursoExpandido = null" flat />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>

          <!-- Dialog para nuevo curso -->
          <q-dialog v-model="dialogNuevoCurso" persistent>
            <q-card style="min-width: 700px; max-width: 90vw">
              <q-card-section class="row items-center">
                <div class="text-h6">Crear Nuevo Curso</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-separator />

              <q-card-section style="max-height: 70vh" class="scroll">
                <div class="row q-col-gutter-md">
                  <!-- Información básica -->
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.codigo_curso"
                      label="Código del curso *"
                      filled
                      :rules="[(val) => !!val || 'Campo obligatorio']"
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.nombre_curso"
                      label="Nombre del curso *"
                      filled
                      :rules="[(val) => !!val || 'Campo obligatorio']"
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="cursoFormulario.estado_curso"
                      :options="estadosCurso"
                      label="Estado"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="cursoFormulario.nivel"
                      :options="nivelesDisponibles"
                      label="Nivel"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.fecha_inicio"
                      label="Fecha inicio"
                      type="date"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="cursoFormulario.dias_semana"
                      :options="diasSemanaOpciones"
                      label="Días de la semana"
                      filled
                      multiple
                      use-chips
                      counter
                      hint="Días en que se imparte"
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="cursoFormulario.horarios_curso"
                      :options="horariosDisponibles"
                      label="Horarios"
                      filled
                      multiple
                      use-chips
                      counter
                      emit-value
                      map-options
                      options-dense
                      hint="Horarios disponibles"
                    >
                      <template v-slot:selected-item="scope">
                        <q-chip
                          removable
                          @remove="scope.removeAtIndex(scope.index)"
                          :tabindex="scope.tabindex"
                          color="primary"
                          text-color="white"
                          dense
                          class="q-ma-xs"
                        >
                          {{ scope.opt }}
                        </q-chip>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model.number="cursoFormulario.max_estudiantes"
                      label="Máx. estudiantes"
                      type="number"
                      filled
                      min="1"
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="cursoFormulario.descripcion"
                      label="Descripción"
                      type="textarea"
                      filled
                      rows="3"
                    />
                  </div>

                  <!-- Fila 6: Información de la tarjeta -->
                  <div class="col-12">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle1 text-weight-medium">Información de la tarjeta</div>
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.titulo_tarjeta"
                      label="Título tarjeta"
                      filled
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.boton_tarjeta"
                      label="Texto del botón"
                      filled
                      placeholder="Más información"
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.imagen_tarjeta"
                      label="URL de la imagen"
                      filled
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <!-- Promoción y Precios -->
                  <div class="col-12">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle1 text-weight-medium q-mb-sm">
                      <q-icon name="payments" class="q-mr-sm" />
                      Configuración de Pagos y Tarifas
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="tarifaSeleccionada"
                      :options="TARIFAS_DISPONIBLES"
                      label="Selecciona la Tarifa *"
                      filled
                      dense
                      option-label="label"
                      @update:model-value="aplicarTarifa"
                    >
                      <template v-slot:prepend>
                        <q-icon name="price_change" />
                      </template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                            <q-item-label caption>
                              {{ scope.opt.descripcion }} -
                              <strong>{{ scope.opt.precio_display }}€</strong>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.precio_curso"
                      label="Precio Visual (€)"
                      filled
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="cursoFormulario.stripe_price_id"
                      label="ID Stripe"
                      filled
                      dense
                      readonly
                      bg-color="grey-2"
                    >
                      <template v-slot:append>
                        <q-icon
                          name="check_circle"
                          color="green"
                          v-if="cursoFormulario.stripe_price_id"
                        />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 row q-col-gutter-md q-mt-xs">
                    <div class="col-12 col-md-4">
                      <q-toggle
                        v-model="cursoFormulario.visibilidad"
                        color="positive"
                        label="Visible en web"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-toggle
                        v-model="cursoFormulario.mostrar_promo"
                        color="red"
                        label="Activar Promoción"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-toggle
                        v-model="cursoFormulario.mostrar_precio"
                        color="secondary"
                        label="Mostrar Badge Precio"
                      />
                    </div>
                  </div>

                  <div v-if="cursoFormulario.mostrar_promo" class="col-12 col-md-6 q-mt-sm">
                    <q-input
                      v-model="cursoFormulario.texto_promo"
                      label="Texto Promoción"
                      filled
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-6 q-mt-sm">
                    <q-input
                      v-model="cursoFormulario.precio_original"
                      label="Precio Original"
                      filled
                      dense
                      placeholder="Ej: 80€"
                    />
                  </div>

                  <div
                    v-if="cursoFormulario.mostrar_promo || cursoFormulario.mostrar_precio"
                    class="col-12"
                  >
                    <q-card flat bordered class="q-pa-md bg-grey-2">
                      <div class="text-caption text-weight-bold q-mb-sm">
                        Vista previa de badges:
                      </div>
                      <div class="row q-gutter-sm">
                        <q-badge
                          v-if="cursoFormulario.mostrar_promo"
                          color="red"
                          text-color="white"
                          class="q-pa-sm"
                        >
                          <q-icon name="star" size="16px" class="q-mr-xs" />
                          {{ cursoFormulario.texto_promo || '¡Prueba tu clase gratis!' }}
                        </q-badge>
                        <q-badge
                          v-if="cursoFormulario.mostrar_precio"
                          color="primary"
                          text-color="white"
                          class="q-pa-sm"
                          style="flex-direction: column"
                        >
                          <span
                            v-if="cursoFormulario.precio_original"
                            style="font-size: 0.7rem; text-decoration: line-through; opacity: 0.8"
                          >
                            {{ cursoFormulario.precio_original }}
                          </span>
                          <span style="font-size: 0.9rem; font-weight: 800">
                            {{ cursoFormulario.precio_curso || '0€' }}
                          </span>
                        </q-badge>
                      </div>
                    </q-card>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn label="Cancelar" color="grey" flat @click="cerrarDialogNuevoCurso" />

                <q-btn
                  label="Crear Curso"
                  color="primary"
                  @click="guardarCurso"
                  :loading="guardandoCurso"
                  unelevated
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>

        <!-- Sección Clases Particulares -->
        <div v-if="seccionActual === 'particulares'">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h4">Gestión de Clases Particulares</div>
            <q-chip color="primary" text-color="white" icon="event">
              {{ reservasActivas.length }} reserva(s) activa(s)
            </q-chip>
          </div>

          <!-- Filtros -->
          <q-card class="q-mb-md">
            <q-card-section class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filtroReservas.userId"
                  label="Buscar por User ID"
                  filled
                  dense
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filtroReservas.tipo"
                  :options="['Todos', 'Individual', 'Grupal', 'Conversación']"
                  label="Tipo de clase"
                  filled
                  dense
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filtroReservas.fechaDesde"
                  label="Fecha desde"
                  type="date"
                  filled
                  dense
                />
              </div>
              <div class="col-12 col-md-2 flex items-center">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="Recargar"
                  @click="cargarReservas"
                  unelevated
                  class="full-width"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Estado vacío -->
          <q-card v-if="reservasActivas.length === 0" flat bordered class="q-pa-lg text-center">
            <q-icon name="event_busy" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No hay reservas activas</div>
            <div class="text-body2 text-grey-6">
              Las reservas futuras aparecerán aquí automáticamente
            </div>
          </q-card>

          <!-- Lista de reservas -->
          <q-list v-else bordered separator class="rounded-borders">
            <q-item
              v-for="(reserva, index) in reservasFiltradas"
              :key="reserva.id ?? `reserva-${index}`"
              class="q-pa-md"
            >
              <q-item-section avatar>
                <q-avatar :color="getColorTipo(reserva.tipo)" text-color="white" icon="person" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ formatFechaReserva(reserva.fecha) }} - {{ reserva.hora }}
                </q-item-label>
                <q-item-label caption>
                  <q-chip size="sm" color="primary" text-color="white" dense>
                    User ID: {{ truncarUserId(reserva.user_id) }}
                  </q-chip>
                  <q-chip
                    size="sm"
                    :color="getColorTipo(reserva.tipo)"
                    text-color="white"
                    dense
                    class="q-ml-xs"
                  >
                    {{ reserva.tipo || 'Sin tipo' }}
                  </q-chip>
                  <q-chip
                    v-if="reserva.precio"
                    size="sm"
                    color="green"
                    text-color="white"
                    dense
                    class="q-ml-xs"
                  >
                    {{ reserva.precio }}€
                  </q-chip>
                </q-item-label>
                <q-item-label v-if="reserva.stripe_payment_intent" caption class="q-mt-xs">
                  <q-icon name="payment" size="xs" />
                  Pago: {{ truncarStripeId(reserva.stripe_payment_intent) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="primary"
                    @click="verDetalleReservaCompleto(reserva)"
                  >
                    <q-tooltip>Ver Ficha Alumno</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    color="orange"
                    @click="editarReserva(reserva)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="eliminarReserva(reserva.id!)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Paginación -->
          <div v-if="reservasActivas.length > 0" class="q-mt-md flex flex-center">
            <q-pagination
              v-model="paginaActual"
              :max="totalPaginas"
              :max-pages="7"
              direction-links
              boundary-links
              color="primary"
            />
          </div>
        </div>

        <!-- Dialog detalle reserva -->
        <q-dialog v-model="dialogDetalleReserva">
          <q-card style="min-width: 600px; max-width: 90vw">
            <q-card-section class="bg-primary text-white row items-center">
              <div class="text-h6">Ficha del Alumno</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section v-if="datosAlumnoDetalle" class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-primary q-mb-sm">Información Básica</div>
                  <q-list dense>
                    <q-item class="q-px-none">
                      <q-item-section avatar style="min-width: 30px"
                        ><q-icon name="badge" color="grey-7"
                      /></q-item-section>
                      <q-item-section>
                        <q-item-label caption>Nombre</q-item-label>
                        <q-item-label class="text-weight-bold"
                          >{{ datosAlumnoDetalle.nombre }}
                          {{ datosAlumnoDetalle.apellido1 }}</q-item-label
                        >
                      </q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section avatar style="min-width: 30px"
                        ><q-icon name="email" color="grey-7"
                      /></q-item-section>
                      <q-item-section>
                        <q-item-label caption>Email</q-item-label>
                        <q-item-label>{{ datosAlumnoDetalle.email }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section avatar style="min-width: 30px"
                        ><q-icon name="phone" color="grey-7"
                      /></q-item-section>
                      <q-item-section>
                        <q-item-label caption>Teléfono</q-item-label>
                        <q-item-label>{{
                          datosAlumnoDetalle.telefono || 'No indicado'
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item class="q-px-none">
                      <q-item-section avatar style="min-width: 30px"
                        ><q-icon name="translate" color="grey-7"
                      /></q-item-section>
                      <q-item-section>
                        <q-item-label caption>Idioma Nativo</q-item-label>
                        <q-item-label>{{ datosAlumnoDetalle.idioma_nativo || '-' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-primary q-mb-sm">Perfil de Estudiante</div>
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section>
                      <div class="row items-center justify-between q-mb-sm">
                        <span class="text-grey-8">Nivel Estimado:</span>
                        <q-badge color="secondary" text-color="white" class="text-subtitle2">{{
                          datosAlumnoDetalle.nivel_estimado || '?'
                        }}</q-badge>
                      </div>
                      <div class="row items-center justify-between">
                        <span class="text-grey-8">¿Ha estudiado antes?:</span>
                        <span class="text-weight-bold">{{
                          datosAlumnoDetalle.ha_estudiado_antes ? 'SÍ' : 'NO'
                        }}</span>
                      </div>
                      <div
                        v-if="datosAlumnoDetalle.detalles_estudio_previo"
                        class="q-mt-sm text-caption text-grey-8 bg-white q-pa-sm rounded-borders"
                      >
                        "{{ datosAlumnoDetalle.detalles_estudio_previo }}"
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12">
                  <q-separator class="q-my-sm" />
                  <div class="text-subtitle2 text-primary q-mb-xs">Intereses</div>
                  <div class="q-gutter-xs q-mt-xs">
                    <q-chip
                      v-for="tag in datosAlumnoDetalle.intereses"
                      :key="tag"
                      color="deep-purple-1"
                      text-color="deep-purple-9"
                      icon="check"
                      >{{ tag }}</q-chip
                    >
                    <span v-if="!datosAlumnoDetalle.intereses?.length" class="text-italic text-grey"
                      >Sin intereses seleccionados</span
                    >
                  </div>

                  <div class="q-mt-md">
                    <div class="text-subtitle2 text-primary q-mb-xs">Objetivos con el Español</div>
                    <div class="bg-blue-grey-1 q-pa-md rounded-borders text-body2 text-blue-grey-9">
                      {{ datosAlumnoDetalle.uso_espanol || 'No especificado por el alumno.' }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section v-else class="text-center q-pa-xl">
              <q-spinner-dots color="primary" size="3em" />
              <div class="text-grey q-mt-sm">Cargando perfil del alumno...</div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialog editar reserva -->
        <q-dialog v-model="dialogEditarReserva" persistent>
          <q-card style="min-width: 500px">
            <q-card-section>
              <div class="text-h6">Editar Reserva</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="q-gutter-md">
                <q-input
                  v-model="reservaFormulario.user_id"
                  label="User ID"
                  filled
                  dense
                  readonly
                />
                <q-input v-model="reservaFormulario.fecha" label="Fecha" type="date" filled dense />
                <q-input v-model="reservaFormulario.hora" label="Hora" type="time" filled dense />
                <q-select
                  v-model="reservaFormulario.tipo"
                  :options="['Individual', 'Grupal', 'Conversación']"
                  label="Tipo de clase"
                  filled
                  dense
                />
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey" @click="cerrarDialogEditar" />
              <q-btn
                label="Guardar"
                color="primary"
                @click="guardarReserva"
                :loading="guardandoReserva"
                unelevated
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Sección Tarjetas -->
        <div v-if="seccionActual === 'tarjetas'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Tarjetas</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar los cursos y tarjetas del
                sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Noticias -->
        <div v-if="seccionActual === 'noticias'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Noticias</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar las noticias del sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <q-dialog v-model="dialogGestorEspera">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="bg-orange text-white row items-center">
          <div class="text-h6">📋 Gestión Lista de Espera</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <div v-if="cargandoGestor" class="row justify-center q-pa-lg">
            <q-spinner color="orange" size="3em" />
          </div>

          <div v-else-if="listaEsperaCargada.length === 0" class="text-center q-pa-xl text-grey">
            <q-icon name="low_priority" size="4em" class="q-mb-sm" />
            <div>La lista de espera está vacía.</div>
          </div>

          <q-list v-else separator>
            <q-item v-for="persona in listaEsperaCargada" :key="persona.id">
              <q-item-section avatar>
                <q-avatar
                  color="orange-1"
                  text-color="orange"
                  icon="person"
                  v-if="persona.tipo === 'usuario'"
                />
                <q-avatar color="grey-3" text-color="grey" icon="no_accounts" v-else />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">{{ persona.nombre }}</q-item-label>
                <q-item-label caption>{{ persona.email }}</q-item-label>
                <q-item-label caption v-if="persona.telefono !== '-'"
                  >📞 {{ persona.telefono }}</q-item-label
                >
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="borrarDeListaEspera(persona)"
                >
                  <q-tooltip>Sacar de la lista</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Interfaces
interface SubscripcionRow {
  user_id: string;
}

interface ItemListaEspera {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo: 'usuario' | 'invitado' | 'desconocido';
}

interface PerfilUsuarioCompleto {
  user_id: string;
  nombre: string;
  apellido1: string;
  email: string;
  telefono?: string;
  idioma_nativo?: string;
  nivel_estimado?: string;
  ha_estudiado_antes?: boolean;
  detalles_estudio_previo?: string;
  intereses?: string[];
  uso_espanol?: string;
}

interface PerfilUsuario {
  user_id: string;
  nombre: string;
  apellido1: string;
  email: string;
}

interface EntradaCalendario {
  id?: number;
  tipo_dia: string;
  horario: string | null;
  fecha: string;
  fecha_text: string;
  created_at?: string;
  updated_at?: string;
}

interface Configuracion {
  tipoDia: string;
  horariosSeleccionados: string[];
}

interface OpcionTipoDia {
  label: string;
  value: string;
}

// ⬇️ Interface CursoGrupal con nuevos campos para tarjeta/promo/precio
interface CursoGrupal {
  id?: number;
  codigo_curso: string;
  nombre_curso: string;
  estado_curso: string;
  fecha_inicio?: string;
  horarios_curso?: string[];
  dias_semana?: string[];
  descripcion?: string;
  usuarios?: string[];
  lista_espera?: string[];
  imagen_tarjeta?: string;
  titulo_tarjeta?: string;
  boton_tarjeta?: string;
  texto_tarjeta?: string;
  nivel?: string;
  max_estudiantes?: number;
  precio_curso?: string;
  visibilidad?: boolean;
  mostrar_promo?: boolean;
  texto_promo?: string;
  mostrar_precio?: boolean;
  precio_original?: string;
  created_at?: string;
  stripe_price_id?: string;
  meet_link?: string;
}

interface Reserva {
  id?: number;
  user_id: string;
  fecha: string;
  hora: string;
  stripe_payment_intent?: string;
  precio?: number;
  tipo?: string;
  created_at?: string;
}

const $q = useQuasar();

// Estado de la aplicación
const seccionActual = ref<string>('calendario');
const user = ref<User | null>(null);
const seleccionMultiple = ref<boolean>(true);
const guardando = ref<boolean>(false);
const mesActual = ref<string>(new Date().toISOString().slice(0, 7));
const fechasSeleccionadas = ref<string[]>([]);
const datosCalendario = ref<EntradaCalendario[]>([]);
const cursosGrupales = ref<CursoGrupal[]>([]);
const cursoExpandido = ref<number | null>(null);
const dialogNuevoCurso = ref<boolean>(false);
const editandoCurso = ref<boolean>(false);
const guardandoCurso = ref<boolean>(false);
const procesandoCierre = ref<number | null>(null);
const cargandoConfiguracion = ref<boolean>(false);

const cursoFormulario = ref<CursoGrupal>({
  codigo_curso: '',
  nombre_curso: '',
  estado_curso: 'Lista de espera',
  fecha_inicio: '',
  dias_semana: [],
  horarios_curso: [],
  descripcion: '',
  usuarios: [],
  lista_espera: [],
  imagen_tarjeta: '',
  titulo_tarjeta: '',
  boton_tarjeta: 'Más información',
  texto_tarjeta: '',
  nivel: 'Principiante',
  max_estudiantes: 10,
  precio_curso: '',
  visibilidad: true,
  // nuevos por defecto
  mostrar_promo: false,
  texto_promo: '¡Prueba tu clase gratis!',
  mostrar_precio: false,
  precio_original: '',
  stripe_price_id: '',
});

const diasSemanaOpciones = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const horariosDisponibles = [
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

const nivelesDisponibles = ['Principiante', 'Elemental', 'Intermedio', 'Avanzado', 'Nativo'];
const estadosCurso = ['Activo', 'Completado', 'Lista de espera'];
const reservasActivas = ref<Reserva[]>([]);
const dialogEditarReserva = ref(false);
const guardandoReserva = ref(false);
const paginaActual = ref(1);
const itemsPorPagina = 10;
const dialogDetalleReserva = ref(false);
const datosAlumnoDetalle = ref<PerfilUsuarioCompleto | null>(null);

const verDetalleReservaCompleto = async (reserva: Reserva) => {
  dialogDetalleReserva.value = true;
  datosAlumnoDetalle.value = null;

  try {
    const { data, error } = await supabase
      .from('datos_usuarios')
      .select('*')
      .eq('user_id', reserva.user_id)
      .single();

    if (error) throw error;

    datosAlumnoDetalle.value = data;
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'No se encontró el perfil de este alumno.' });
    dialogDetalleReserva.value = false;
  }
};

const filtroReservas = ref({
  userId: '',
  tipo: 'Todos',
  fechaDesde: new Date().toISOString().split('T')[0],
});

const reservaFormulario = ref<Reserva>({
  user_id: '',
  fecha: '',
  hora: '',
  tipo: '',
  precio: 0,
  stripe_payment_intent: '',
});

// Configuración
const configuracion = ref<Configuracion>({
  tipoDia: '',
  horariosSeleccionados: [],
});

// Opciones
const opcionesTipoDia: OpcionTipoDia[] = [
  { label: 'Laborable', value: 'laborable' },
  { label: 'Festivo', value: 'festivo' },
  { label: 'Especial', value: 'especial' },
];

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

// Computed
const fechaActual = computed(() => new Date(mesActual.value + '-01'));
const nombreMesActual = computed(() => {
  return fechaActual.value.toLocaleDateString('es-ES', { month: 'long' });
});
const añoActual = computed(() => fechaActual.value.getFullYear());

// Precios disponibles

const TARIFAS_DISPONIBLES = [
  {
    label: 'Clases de Conversación',
    precio_display: '65', // Lo que se ve en la tarjeta
    stripe_id: 'price_1SXvSpLFUAzgw0DDMUPJgHzv', // El ID raro de Stripe
    descripcion: 'Acceso a las clases de conversación',
  },
  {
    label: 'Curso Niveles',
    precio_display: '75',
    stripe_id: 'price_1SxcqELFUAzgw0DDiTwVF5Np',
    descripcion: 'Acceso a las clases por niveles',
  },
  {
    label: 'Gratuito / Solo Info',
    precio_display: '0',
    stripe_id: null, // Sin pago
    descripcion: 'Curso sin pasarela de pago',
  },
];

// 2. Variable para el modelo del select
const tarifaSeleccionada = ref(null);

// 3. Función para rellenar los datos automáticamente al elegir
const aplicarTarifa = (tarifa: (typeof TARIFAS_DISPONIBLES)[0] | null) => {
  if (!tarifa) return;

  cursoFormulario.value.precio_curso = tarifa.precio_display;

  cursoFormulario.value.stripe_price_id = tarifa.stripe_id || '';

  if (tarifa.stripe_id) {
    cursoFormulario.value.mostrar_precio = true;
  }
};

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

// Navegación entre secciones
const cambiarSeccion = (seccion: string): void => {
  seccionActual.value = seccion;
};

// Funciones del calendario
const mesAnterior = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() - 1);

  const minDate = new Date(2024, 0, 1);
  if (fecha >= minDate) {
    mesActual.value = fecha.toISOString().slice(0, 7);
  }
};

const mesSiguiente = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() + 1);

  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1;
  const mesStr = `${year}-${month.toString().padStart(2, '0')}`;
  if (mesStr <= '2030-12') {
    mesActual.value = mesStr;
  } else {
    $q.notify({
      type: 'warning',
      message: 'Has alcanzado el límite máximo (Diciembre 2030)',
      timeout: 2000,
    });
  }
};

const cambiarMes = (nuevoMes: string | number | null): void => {
  if (!nuevoMes || typeof nuevoMes !== 'string') return;
  if (!/^\d{4}-\d{2}$/.test(nuevoMes)) return;
  if (nuevoMes >= '2024-01' && nuevoMes <= '2030-12') {
    mesActual.value = nuevoMes;
  } else {
    $q.notify({
      type: 'warning',
      message: 'El mes debe estar entre Enero 2024 y Diciembre 2030',
      timeout: 2000,
    });
  }
};

// Selección de días
const seleccionarDia = (fecha: Date | null): void => {
  if (!fecha) return;

  // FIX: Usar formato local en vez de toISOString para evitar cambio de zona horaria
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaStr = `${year}-${month}-${day}`;

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

  void cargarConfiguracionAutomatica();
};

const cargarConfiguracionAutomatica = async (): Promise<void> => {
  if (fechasSeleccionadas.value.length === 0) {
    limpiarSeleccion();
    return;
  }

  cargandoConfiguracion.value = true;

  if (fechasSeleccionadas.value.length === 1) {
    const fechaStr = fechasSeleccionadas.value[0];
    if (!fechaStr) {
      cargandoConfiguracion.value = false;
      return;
    }

    const entradaExistente = datosCalendario.value.find((item) => item.fecha === fechaStr);

    if (entradaExistente) {
      configuracion.value.tipoDia = entradaExistente.tipo_dia;

      if (entradaExistente.horario) {
        try {
          if (typeof entradaExistente.horario === 'string') {
            const horariosStr = entradaExistente.horario.replace(/[{}]/g, '');
            configuracion.value.horariosSeleccionados = horariosStr
              .split(',')
              .map((h) => h.trim().replace(/"/g, ''))
              .filter((h) => h.length > 0);
          } else if (Array.isArray(entradaExistente.horario)) {
            // Si viene como array directamente de Supabase
            configuracion.value.horariosSeleccionados = [...entradaExistente.horario];
          } else {
            configuracion.value.horariosSeleccionados = [];
          }
          console.log(
            '✅ Horarios cargados para',
            fechaStr,
            '(',
            entradaExistente.tipo_dia,
            '):',
            configuracion.value.horariosSeleccionados,
          );
        } catch (e) {
          console.error('❌ Error parseando horarios:', e);
          configuracion.value.horariosSeleccionados = [];
        }
      } else {
        console.log('⚠️ Día sin horarios:', fechaStr, entradaExistente.tipo_dia);
        configuracion.value.horariosSeleccionados = [];
      }
    } else {
      configuracion.value.tipoDia = 'laborable';
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    }
  } else {
    configuracion.value.tipoDia = 'laborable';
    configuracion.value.horariosSeleccionados = [...todosLosHorarios];
  }

  await nextTick();
  cargandoConfiguracion.value = false;
};

// Clases CSS
const getClasesDia = (fecha: Date | null): string => {
  if (!fecha) return 'dia-vacio';

  const clases = ['dia-calendario'];

  // FIX: Mismo formato local para comparar
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaStr = `${year}-${month}-${day}`;

  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  if (fechaStr === hoyStr) {
    clases.push('dia-hoy');
  }

  if (fechasSeleccionadas.value.includes(fechaStr)) {
    clases.push('dia-seleccionado');
  }

  return clases.join(' ');
};

const getClaseTipoDia = (fecha: Date): string => {
  // FIX: Mismo formato local
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaStr = `${year}-${month}-${day}`;

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
  $q.notify({
    type: 'info',
    message: `Configuración aplicada a ${fechasSeleccionadas.value.length} día(s) - Guarda los cambios para aplicar en la base de datos`,
  });
};

const limpiarSeleccion = (): void => {
  fechasSeleccionadas.value = [];
  configuracion.value = {
    tipoDia: '',
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

    const resultados = [];

    for (const fecha of fechasSeleccionadas.value) {
      if (!fecha || typeof fecha !== 'string') continue;

      const { data: existingData, error: selectError } = await supabase
        .from('Calendario')
        .select('id')
        .eq('fecha', fecha)
        .maybeSingle();

      if (selectError) throw selectError;

      const horariosArray =
        configuracion.value.horariosSeleccionados.length > 0
          ? `{${configuracion.value.horariosSeleccionados.map((h) => `"${h}"`).join(',')}}`
          : null;

      const datosParaGuardar = {
        fecha: fecha,
        fecha_text: formatFechaDisplay(fecha),
        tipo_dia: configuracion.value.tipoDia,
        horario: horariosArray,
        updated_at: new Date().toISOString(),
      };

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

      if (resultado.error) throw resultado.error;
      resultados.push(resultado);
    }

    $q.notify({
      type: 'positive',
      message: `${fechasSeleccionadas.value.length} día(s) guardado(s) correctamente en Supabase`,
      timeout: 3000,
    });

    await cargarDatosCalendario();
    limpiarSeleccion();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
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

    $q.dialog({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar ${fechasValidas.length} día(s) del calendario?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          const { error } = await supabase.from('Calendario').delete().in('fecha', fechasValidas);
          if (error) throw error;

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
    $q.notify({
      type: 'negative',
      message: `Error al eliminar: ${errorMessage}`,
      timeout: 3000,
    });
  }
};

// Cargar datos calendario de Supabase OK
const cargarDatosCalendario = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('Calendario')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) throw error;

    datosCalendario.value = data || [];
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido al cargar datos';
    $q.notify({
      type: 'negative',
      message: `Error al cargar los datos del calendario: ${errorMessage}`,
    });
  }
};

// Cargar usuario actual OK
const cargarUsuario = async (): Promise<void> => {
  try {
    const {
      data: { user: userData },
    } = await supabase.auth.getUser();
    user.value = userData;
    console.log('Usuario cargado:', user.value);
  } catch {
    // noop
  }
};

// Inicialización
let subscription: ReturnType<typeof supabase.channel> | null = null;

// Funciones para gestionar cursos grupales
const cargarCursosGrupales = async (): Promise<void> => {
  try {
    // 1. Pedimos los cursos
    const { data: cursos, error } = await supabase
      .from('cursos_grupales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Pedimos el CONTEO real de suscripciones activas para cada curso
    const cursosConConteo = await Promise.all(
      (cursos || []).map(async (curso) => {
        // Consultamos cuántos están suscritos y activos/trialing a este curso
        const { count } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true }) // head:true significa "solo dame el número, no los datos"
          .eq('course_id', curso.id)
          .in('estado', ['active', 'trialing', 'canceled']);

        return {
          ...curso,
          usuarios: new Array(count || 0).fill('alumno'),

          // Mantenemos el resto de tus mapeos de arrays...
          dias_semana: Array.isArray(curso.dias_semana) ? curso.dias_semana : [],
          horarios_curso: Array.isArray(curso.horarios_curso) ? curso.horarios_curso : [],
          lista_espera: Array.isArray(curso.lista_espera) ? curso.lista_espera : [],
        };
      }),
    );

    cursosGrupales.value = cursosConConteo;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    $q.notify({
      type: 'negative',
      message: `Error al cargar cursos: ${errorMessage}`,
      timeout: 3000,
    });
  }
};

const toggleCurso = (id: number): void => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;

  if (cursoExpandido.value === id) {
    const curso = cursosGrupales.value.find((c) => c.id === id);
    if (curso) {
      const horariosArray = Array.isArray(curso.horarios_curso)
        ? JSON.parse(JSON.stringify(curso.horarios_curso))
        : [];
      const diasArray = Array.isArray(curso.dias_semana)
        ? JSON.parse(JSON.stringify(curso.dias_semana))
        : [];
      const usuariosArray = Array.isArray(curso.usuarios)
        ? JSON.parse(JSON.stringify(curso.usuarios))
        : [];
      const esperaArray = Array.isArray(curso.lista_espera)
        ? JSON.parse(JSON.stringify(curso.lista_espera))
        : [];
      cursoFormulario.value = {
        ...curso,
        dias_semana: diasArray,
        horarios_curso: horariosArray,
        usuarios: usuariosArray,
        lista_espera: esperaArray,
        mostrar_promo: !!curso.mostrar_promo,
        texto_promo: curso.texto_promo ?? '¡Prueba tu clase gratis!',
        mostrar_precio: !!curso.mostrar_precio,
        precio_curso: curso.precio_curso ?? '',
        precio_original: curso.precio_original ?? '',
      };

      editandoCurso.value = true;
    }
  } else {
    editandoCurso.value = false;
  }
};

const abrirDialogNuevoCurso = (): void => {
  cursoFormulario.value = {
    codigo_curso: '',
    nombre_curso: '',
    estado_curso: 'Lista de espera',
    fecha_inicio: '',
    dias_semana: [],
    horarios_curso: [],
    descripcion: '',
    usuarios: [],
    lista_espera: [],
    imagen_tarjeta: '',
    titulo_tarjeta: '',
    boton_tarjeta: 'Más información',
    texto_tarjeta: '',
    nivel: 'Principiante',
    max_estudiantes: 10,
    precio_curso: '',
    visibilidad: true,
    mostrar_promo: false,
    texto_promo: '¡Prueba tu clase gratis!',
    mostrar_precio: false,
    precio_original: '',
  };
  editandoCurso.value = false;
  dialogNuevoCurso.value = true;
};

const cerrarDialogNuevoCurso = (): void => {
  dialogNuevoCurso.value = false;
};

// --- 1. NUEVA FUNCIÓN AUXILIAR  ---
// --- FUNCIÓN INTELIGENTE PARA CREAR MEET Y CALENDARIO ---
const verificarYGenerarMeet = async (cursoId: number, datosCurso: CursoGrupal) => {
  // 1. Si ya tiene link, no hacemos nada (ya está creado y no queremos duplicar)
  if (datosCurso.meet_link) return;

  // 2. FRENO DE MANO:
  // Solo generamos el calendario si el curso está ACTIVO.
  // Si está en "Lista de espera", nos salimos silenciosamente (no ensuciamos el calendario).
  if (datosCurso.estado_curso !== 'Activo') {
    return;
  }

  // 3. VALIDACIÓN ANTI-ERRORES:
  if (
    !datosCurso.fecha_inicio ||
    !datosCurso.horarios_curso ||
    datosCurso.horarios_curso.length === 0
  ) {
    $q.notify({
      type: 'warning',
      message: '⚠️ El curso está Activo pero le falta Fecha u Hora. No se ha creado el calendario.',
      timeout: 5000,
    });
    return;
  }

  try {
    $q.notify({
      type: 'ongoing',
      message: 'Generando evento en Google Calendar...',
      timeout: 2000,
    });

    // Preparamos datos (ya sabemos que existen por la validación del paso 3)
    const fechaInicio = datosCurso.fecha_inicio;
    const horaInicio = datosCurso.horarios_curso[0];

    // Llamamos a la Edge Function
    const { data, error } = await supabase.functions.invoke('crear-meet', {
      body: {
        fecha: fechaInicio,
        hora: horaInicio,
        nombreCurso: datosCurso.nombre_curso,
        esCurso: true,
        duracionMinutos: 90,
        diasSemana: datosCurso.dias_semana,
      },
    });

    if (error) throw error;

    // Si devuelve datos, guardamos TANTO el Link COMO el ID del evento
    if (data && data.meetLink) {
      console.log('✨ Meet generado:', data.meetLink);
      console.log('🆔 Google Event ID:', data.googleEventId);

      const { error: dbError } = await supabase
        .from('cursos_grupales')
        .update({
          meet_link: data.meetLink,
          google_event_id: data.googleEventId, // <--- VITAL PARA PODER BORRARLO LUEGO
        })
        .eq('id', cursoId);

      if (dbError) throw dbError;

      $q.notify({ type: 'positive', message: '¡Evento y Meet creados!' });
    }
  } catch (e) {
    console.error('Error generando Meet:', e);
    // No bloqueamos el guardado del curso en BD, solo avisamos del fallo en Calendar
    $q.notify({
      type: 'warning',
      message: 'El curso se guardó, pero falló la conexión con Google Calendar',
    });
  }
};

// --- 2. FUNCIÓN
const guardarCurso = async (): Promise<void> => {
  if (!cursoFormulario.value.codigo_curso || !cursoFormulario.value.nombre_curso) {
    $q.notify({ type: 'warning', message: 'Faltan datos obligatorios' });
    return;
  }

  guardandoCurso.value = true;

  try {
    // 1. Detectar si estamos ACTIVANDO un curso
    const cursoAntiguo = cursosGrupales.value.find((c) => c.id === cursoFormulario.value.id);

    const esActivacion =
      editandoCurso.value &&
      cursoAntiguo?.estado_curso !== 'Activo' &&
      cursoFormulario.value.estado_curso === 'Activo';

    const tieneListaEspera =
      cursoFormulario.value.lista_espera && cursoFormulario.value.lista_espera.length > 0;

    const datosGuardar = {
      codigo_curso: cursoFormulario.value.codigo_curso,
      nombre_curso: cursoFormulario.value.nombre_curso,
      estado_curso: cursoFormulario.value.estado_curso,
      fecha_inicio: cursoFormulario.value.fecha_inicio || null,
      dias_semana: Array.isArray(cursoFormulario.value.dias_semana)
        ? cursoFormulario.value.dias_semana
        : [],
      horarios_curso: Array.isArray(cursoFormulario.value.horarios_curso)
        ? cursoFormulario.value.horarios_curso
        : [],
      descripcion: cursoFormulario.value.descripcion || null,
      usuarios: Array.isArray(cursoFormulario.value.usuarios) ? cursoFormulario.value.usuarios : [],
      lista_espera: Array.isArray(cursoFormulario.value.lista_espera)
        ? cursoFormulario.value.lista_espera
        : [],
      imagen_tarjeta: cursoFormulario.value.imagen_tarjeta || null,
      titulo_tarjeta: cursoFormulario.value.titulo_tarjeta || null,
      boton_tarjeta: cursoFormulario.value.boton_tarjeta || 'Más información',
      texto_tarjeta: cursoFormulario.value.texto_tarjeta || null,
      nivel: cursoFormulario.value.nivel || null,
      max_estudiantes: cursoFormulario.value.max_estudiantes || null,
      visibilidad: cursoFormulario.value.visibilidad ?? true,
      mostrar_promo: cursoFormulario.value.mostrar_promo ?? false,
      texto_promo: cursoFormulario.value.texto_promo || '¡Prueba tu clase gratis!',
      mostrar_precio: cursoFormulario.value.mostrar_precio ?? false,
      precio_curso: cursoFormulario.value.precio_curso || null,
      stripe_price_id: cursoFormulario.value.stripe_price_id || null,
      precio_original: cursoFormulario.value.precio_original || null,
    };

    let resultado;
    let cursoIdParaMeet: number | undefined;

    if (editandoCurso.value && cursoFormulario.value.id) {
      // UPDATE
      resultado = await supabase
        .from('cursos_grupales')
        .update(datosGuardar)
        .eq('id', cursoFormulario.value.id)
        .select();

      if (resultado.error) throw resultado.error;
      cursoIdParaMeet = cursoFormulario.value.id;

      $q.notify({ type: 'positive', message: 'Curso actualizado' });

      // 🔥 LÓGICA DE NOTIFICACIÓN (CORREGIDA SIN $q.loading) 🔥
      if (esActivacion && tieneListaEspera) {
        $q.dialog({
          title: '📢 Notificar Lista de Espera',
          message: `El curso ha pasado a ACTIVO y hay ${cursoFormulario.value.lista_espera!.length} personas esperando. ¿Quieres enviarles un email ahora?`,
          cancel: true,
          persistent: true,
          ok: { label: 'Sí, enviar emails', color: 'positive' },
        }).onOk(() => {
          // Usamos void() para evitar error de promesas en el linter
          void (async () => {
            // 1. Mostramos notificación de "Cargando..." que no desaparece sola (timeout 0)
            const notifCarga = $q.notify({
              group: false,
              timeout: 0,
              spinner: true,
              message: 'Enviando correos masivos...',
              color: 'primary',
            });

            try {
              const { error: errorMail } = await supabase.functions.invoke('notify-waitlist', {
                body: {
                  cursoId: cursoFormulario.value.id,
                  nombreCurso: cursoFormulario.value.nombre_curso,
                  listaIds: cursoFormulario.value.lista_espera,
                },
              });

              // 2. Cerramos la notificación de carga
              notifCarga();

              if (errorMail) throw errorMail;

              $q.notify({ type: 'positive', message: 'Correos enviados correctamente 📨' });
            } catch (e) {
              // Si falla, cerramos la carga y mostramos error
              notifCarga();
              console.error(e);
              $q.notify({
                type: 'negative',
                message: 'Error enviando correos (Revisa los logs de Supabase)',
              });
            }
          })();
        });
      }
    } else {
      // INSERT (Nuevo curso)
      resultado = await supabase.from('cursos_grupales').insert([datosGuardar]).select();
      if (resultado.error) throw resultado.error;
      if (resultado.data && resultado.data.length > 0) cursoIdParaMeet = resultado.data[0].id;

      $q.notify({ type: 'positive', message: 'Curso creado' });
      dialogNuevoCurso.value = false;
    }

    if (cursoIdParaMeet) {
      await verificarYGenerarMeet(cursoIdParaMeet, cursoFormulario.value);
    }

    await cargarCursosGrupales();
    cursoExpandido.value = null;
    editandoCurso.value = false;
  } catch (error: unknown) {
    let errorMessage = 'Error al guardar';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }

    $q.notify({ type: 'negative', message: errorMessage });
  } finally {
    guardandoCurso.value = false;
  }
};

// --- FUNCIÓN PARA CERRAR CURSO Y REEMBOLSAR ---
const confirmarCierreCurso = (curso: CursoGrupal) => {
  if (!curso.id) return;

  $q.dialog({
    title: '⚠️ Cierre de Curso y Reembolsos',
    message: `¿Estás seguro de finalizar el curso <b>"${curso.nombre_curso}"</b>?<br><br>
    Esto realizará las siguientes acciones:<br>
    1. Marcará el curso como 'Completado' y lo ocultará.<br>
    2. Cancelará las suscripciones de todos los alumnos activos.<br>
    3. <b>Stripe devolverá automáticamente la parte proporcional</b> del dinero no disfrutado.<br>
    4. Se enviará un email automático de despedida.`,
    html: true,
    persistent: true,
    ok: {
      label: 'Sí, Finalizar y Devolver',
      color: 'deep-orange',
      push: true,
    },
    cancel: {
      label: 'Cancelar',
      color: 'primary',
      flat: true,
    },
  }).onOk(() => {
    void finalizarCurso(curso.id!);
  });
};

const finalizarCurso = async (cursoId: number) => {
  procesandoCierre.value = cursoId;

  try {
    // Llamada a tu nueva Edge Function
    const { data, error } = await supabase.functions.invoke('cerrar-curso', {
      body: { courseId: cursoId },
    });

    if (error) throw error;

    const numProcesados = data?.procesados?.length || 0;

    $q.notify({
      type: 'positive',
      message: `Curso cerrado. Se han procesado ${numProcesados} reembolsos/cancelaciones.`,
      timeout: 5000,
    });

    // Recargar la lista para que se actualice el estado a "Completo" visualmente
    await cargarCursosGrupales();
  } catch (error: unknown) {
    console.error('Error cerrando curso:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al procesar el cierre en el servidor.',
    });
  } finally {
    procesandoCierre.value = null;
  }
};

const cargandoAlumnos = ref(false);

// --- FUNCIÓN CORREGIDA (SIN JOIN SQL Y SIN LOADING GLOBAL) ---
const verAlumnosCurso = async (id: number, nombre: string) => {
  cargandoAlumnos.value = true; // Activamos el spinner del botón
  try {
    // PASO 1: Obtener los user_id de las suscripciones
    const { data: subs, error: errorSubs } = await supabase
      .from('user_subscriptions')
      .select('user_id, estado') // Traemos también el estado para pintarlo
      .eq('course_id', id)
      // Si el curso está activo, solo activos. Si está cerrado, todos.
      // O por simplicidad, tráete todos los que no sean null:
      .in('estado', ['active', 'trialing', 'canceled']);

    if (errorSubs) throw errorSubs;

    if (!subs || subs.length === 0) {
      $q.dialog({
        title: `Alumnos: ${nombre}`,
        message: 'No hay alumnos activos actualmente.',
      });
      return;
    }

    // Extraemos los IDs en un array limpio
    // Convertimos a 'unknown' primero para evitar líos de tipos con Supabase
    const listaIds = (subs as SubscripcionRow[]).map((s) => s.user_id);

    // PASO 2: Buscar los datos personales de esos IDs
    const { data: perfiles, error: errorPerfiles } = await supabase
      .from('datos_usuarios')
      .select('user_id, nombre, apellido1, email')
      .in('user_id', listaIds);

    if (errorPerfiles) throw errorPerfiles;

    // PASO 3: Cruzar los datos en Javascript (Más seguro que SQL Join)
    const listaHTML = listaIds
      .map((userId) => {
        // Casteamos 'perfiles' a nuestro tipo definido
        const perfil = (perfiles as PerfilUsuario[] | null)?.find((p) => p.user_id === userId);

        if (perfil) {
          return `• <b>${perfil.nombre} ${perfil.apellido1 || ''}</b> <br><span class="text-grey-7" style="font-size:0.85em">(${perfil.email})</span>`;
        } else {
          return `• <span class="text-orange">Usuario sin perfil</span> <br><span class="text-grey-7" style="font-size:0.85em">ID: ${userId}</span>`;
        }
      })
      .join('<br><br>');

    // Mostrar el resultado
    $q.dialog({
      title: `<div class="text-primary text-weight-bold">👨‍🎓 Alumnos: ${nombre}</div>`,
      message: listaHTML,
      html: true,
      ok: { label: 'Cerrar', flat: true, color: 'primary' },
    });
  } catch (error) {
    console.error('Error cargando alumnos:', error);
    $q.notify({ type: 'negative', message: 'Error al recuperar la lista de alumnos' });
  } finally {
    cargandoAlumnos.value = false; // Apagamos el spinner
  }
};

const eliminarCurso = (id: number): void => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.',
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
    },
  }).onOk(() => {
    void (async () => {
      try {
        const { error } = await supabase.from('cursos_grupales').delete().eq('id', id);
        if (error) throw error;

        $q.notify({
          type: 'positive',
          message: 'Curso eliminado correctamente',
          timeout: 2000,
        });

        await cargarCursosGrupales();
        cursoExpandido.value = null;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        $q.notify({
          type: 'negative',
          message: `Error al eliminar: ${errorMessage}`,
          timeout: 3000,
        });
      }
    })();
  });
};

onMounted(async (): Promise<void> => {
  await cargarUsuario();
  await cargarDatosCalendario();
  await cargarCursosGrupales();
  await cargarReservas();
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
        void cargarDatosCalendario();
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservas',
      },
      () => {
        void cargarReservas();
      },
    )
    .subscribe();
});

const getColorEstado = (estado: string): string => {
  switch (estado) {
    case 'Activo':
      return 'positive';
    case 'Completado':
      return 'blue';
    case 'Lista de espera':
      return 'cyan';
    default:
      return 'grey';
  }
};

// Computed para reservas filtradas y paginadas
const reservasFiltradas = computed(() => {
  let resultado = [...reservasActivas.value];

  // Filtro por user_id
  if (filtroReservas.value.userId) {
    resultado = resultado.filter((r) =>
      r.user_id.toLowerCase().includes(filtroReservas.value.userId.toLowerCase()),
    );
  }

  // Filtro por tipo
  if (filtroReservas.value.tipo && filtroReservas.value.tipo !== 'Todos') {
    resultado = resultado.filter((r) => r.tipo === filtroReservas.value.tipo);
  }

  // Filtro por fecha desde (con validación)
  if (filtroReservas.value.fechaDesde) {
    const fechaDesde = filtroReservas.value.fechaDesde;
    resultado = resultado.filter((r) => r.fecha >= fechaDesde);
  }

  // Paginación
  const inicio = (paginaActual.value - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  return resultado.slice(inicio, fin);
});

const totalPaginas = computed(() => {
  const total = reservasActivas.value.length;
  return Math.ceil(total / itemsPorPagina);
});

// Funciones auxiliares para Clases Particulares
const getColorTipo = (tipo?: string): string => {
  switch (tipo) {
    case 'Individual':
      return 'primary';
    case 'Grupal':
      return 'secondary';
    case 'Conversación':
      return 'accent';
    default:
      return 'grey';
  }
};

const truncarUserId = (userId: string): string => {
  return userId.length > 20 ? userId.substring(0, 20) + '...' : userId;
};

const truncarStripeId = (stripeId?: string): string => {
  if (!stripeId) return 'N/A';
  return stripeId.length > 25 ? stripeId.substring(0, 25) + '...' : stripeId;
};

const formatFechaReserva = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const editarReserva = (reserva: Reserva): void => {
  reservaFormulario.value = { ...reserva };
  dialogEditarReserva.value = true;
};

// --- VARIABLES PARA EL GESTOR DE LISTA DE ESPERA ---
const dialogGestorEspera = ref(false);
const listaEsperaCargada = ref<ItemListaEspera[]>([]);
const cursoIdEnGestion = ref<number | null>(null); // Para saber qué curso estamos tocando
const cargandoGestor = ref(false);

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const abrirGestorListaEspera = async (cursoId: number, listaIds: string[]) => {
  cursoIdEnGestion.value = cursoId;
  dialogGestorEspera.value = true;
  listaEsperaCargada.value = [];
  cargandoGestor.value = true;

  try {
    if (!listaIds || listaIds.length === 0) {
      cargandoGestor.value = false;
      return;
    }

    // A. SEPARAMOS: ¿Cuáles son IDs de usuario y cuáles son emails escritos a mano?
    const idsValidos = listaIds.filter((id) => isUuid(id));

    // B. CONSULTAMOS: Solo enviamos a Supabase los que son IDs reales
    let perfiles: {
      user_id: string;
      nombre: string;
      apellido1: string;
      email: string;
      telefono: string | null;
    }[] = [];

    if (idsValidos.length > 0) {
      const { data, error } = await supabase
        .from('datos_usuarios')
        .select('user_id, nombre, apellido1, email, telefono')
        .in('user_id', idsValidos);

      if (error) throw error;

      // 🔥 CAMBIO: Forzamos a TypeScript a entender que 'data' tiene esa forma
      if (data) {
        perfiles = data as {
          user_id: string;
          nombre: string;
          apellido1: string;
          email: string;
          telefono: string | null;
        }[];
      }
    }

    // C. MEZCLAMOS: Juntamos los perfiles encontrados con los invitados manuales
    listaEsperaCargada.value = listaIds.map((id) => {
      if (isUuid(id)) {
        // Es un ID: Buscamos sus datos en lo que devolvió Supabase
        const perfil = perfiles.find((p) => p.user_id === id);
        if (perfil) {
          return {
            tipo: 'usuario',
            id: id,
            nombre: `${perfil.nombre} ${perfil.apellido1}`,
            email: perfil.email,
            telefono: perfil.telefono || '-',
          };
        } else {
          return {
            tipo: 'desconocido',
            id: id,
            nombre: 'Usuario borrado',
            email: 'ID: ' + id,
            telefono: '-',
          };
        }
      } else {
        // Es un Email suelto (Invitado manual): Lo mostramos tal cual
        return {
          tipo: 'invitado',
          id: id,
          nombre: 'Invitado Manual',
          email: id, // El "id" en este caso es el propio email
          telefono: '-',
        };
      }
    });
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Error cargando la lista' });
  } finally {
    cargandoGestor.value = false;
  }
};

// --- 2. BORRAR A ALGUIEN DE LA LISTA ---
const borrarDeListaEspera = (itemBorrar: ItemListaEspera) => {
  if (!cursoIdEnGestion.value) return;

  $q.dialog({
    title: 'Sacar de la lista',
    message: `¿Estás seguro de quitar a <b>${itemBorrar.nombre}</b> de la lista de espera?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Quitar', color: 'negative' },
  }).onOk(() => {
    void (async () => {
      try {
        // Calculamos la nueva lista de IDs
        const nuevaListaIds = listaEsperaCargada.value
          .filter((item) => item.id !== itemBorrar.id)
          .map((item) => item.id);

        // Actualizamos BD
        const { error } = await supabase
          .from('cursos_grupales')
          .update({ lista_espera: nuevaListaIds })
          .eq('id', cursoIdEnGestion.value);

        if (error) throw error;

        // Actualizamos vista local
        listaEsperaCargada.value = listaEsperaCargada.value.filter(
          (item) => item.id !== itemBorrar.id,
        );

        // Actualizamos el contador general
        await cargarCursosGrupales();

        $q.notify({ type: 'positive', message: 'Usuario retirado de la lista' });
      } catch (e) {
        console.error(e);
        $q.notify({ type: 'negative', message: 'Error al actualizar la base de datos' });
      }
    })();
  });
};

const cerrarDialogEditar = (): void => {
  dialogEditarReserva.value = false;
  reservaFormulario.value = {
    user_id: '',
    fecha: '',
    hora: '',
    tipo: '',
    precio: 0,
    stripe_payment_intent: '',
  };
};

const guardarReserva = async (): Promise<void> => {
  if (!reservaFormulario.value.id) return;

  guardandoReserva.value = true;
  try {
    const { error } = await supabase
      .from('reservas')
      .update({
        fecha: reservaFormulario.value.fecha,
        hora: reservaFormulario.value.hora,
        tipo: reservaFormulario.value.tipo,
        precio: reservaFormulario.value.precio,
      })
      .eq('id', reservaFormulario.value.id);

    if (error) throw error;

    $q.notify({
      type: 'positive',
      message: 'Reserva actualizada correctamente',
      timeout: 2000,
    });

    await cargarReservas();
    cerrarDialogEditar();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    $q.notify({
      type: 'negative',
      message: `Error al actualizar: ${errorMessage}`,
      timeout: 3000,
    });
  } finally {
    guardandoReserva.value = false;
  }
};

const eliminarReserva = (id: number): void => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar esta reserva?',
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
    },
  }).onOk(() => {
    void (async () => {
      try {
        const { error } = await supabase.from('reservas').delete().eq('id', id);

        if (error) throw error;

        $q.notify({
          type: 'positive',
          message: 'Reserva eliminada correctamente',
          timeout: 2000,
        });

        await cargarReservas();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        $q.notify({
          type: 'negative',
          message: `Error al eliminar: ${errorMessage}`,
          timeout: 3000,
        });
      }
    })();
  });
};

// Cargar reservas desde Supabase
const cargarReservas = async (): Promise<void> => {
  try {
    const fechaActual = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .gte('fecha', fechaActual)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) throw error;

    reservasActivas.value = data || [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    $q.notify({
      type: 'negative',
      message: `Error al cargar reservas: ${errorMessage}`,
      timeout: 3000,
    });
  }
};

onUnmounted(() => {
  if (subscription) {
    void subscription.unsubscribe();
  }
});

watch(
  () => configuracion.value.tipoDia,
  (nuevoTipo, tipoAnterior) => {
    if (nuevoTipo === tipoAnterior) return;
    if (cargandoConfiguracion.value) return; // No interferir durante carga de BD

    // Solo auto-rellenar horarios cuando el usuario cambia manualmente el tipo
    if (nuevoTipo === 'laborable') {
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    } else if (nuevoTipo === 'festivo' || nuevoTipo === 'especial') {
      configuracion.value.horariosSeleccionados = [];
    }
  },
);
</script>

<style scoped>
/* 🔧 SOLUCIÓN DEFINITIVA PARA TAMAÑOS DE CELDAS */
.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  width: 100%;
}

.celda-dia {
  width: 100%;
  height: 50px;
  border-radius: 8px;
}

.dia-calendario {
  border: 2px solid #e0e0e0;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dia-calendario:hover {
  background-color: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.dia-seleccionado {
  background: linear-gradient(135deg, #4caf50, #388e3c) !important;
  border-color: #2e7d32 !important;
  color: white;
  transform: scale(1.05);
}

.dia-hoy {
  border: 3px solid #ff9800 !important;
  background-color: #fff3e0 !important;
  font-weight: bold;
}

.dia-vacio {
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
  cursor: default;
}

.contenido-dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 6px;
}

.numero-dia {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
}

.dia-seleccionado .numero-dia {
  color: white;
  font-weight: 700;
}

/* 🔴 INDICADORES MÁS VISIBLES */
.indicador-tipo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tipo-laborable {
  background-color: #2196f3;
}

.tipo-festivo {
  background-color: #f44336;
}

.tipo-especial {
  background-color: #ff9800;
}

.dia-seleccionado .indicador-tipo {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 🔧 MENÚ LATERAL */
.sticky-menu {
  position: sticky;
  top: 20px;
  z-index: 100;
}

.menu-lateral {
  border-radius: 8px;
}

.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #e3f2fd;
  transform: translateX(5px);
}

.menu-item.q-item--active {
  background-color: #1976d2;
  color: white;
}

.menu-item.q-item--active .q-icon {
  color: white;
}

/* 📱 RESPONSIVE MEJORADO */
@media (max-width: 1024px) {
  .celda-dia {
    height: 70px;
    padding: 4px;
  }

  .numero-dia {
    font-size: 1rem;
  }

  .indicador-tipo {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 768px) {
  .calendario-grid {
    gap: 2px;
  }

  .celda-dia {
    height: 60px;
    padding: 3px;
  }

  .numero-dia {
    font-size: 0.9rem;
  }

  .indicador-tipo {
    width: 16px;
    height: 16px;
  }

  .contenido-dia {
    gap: 4px;
  }

  .sticky-menu {
    position: relative;
    top: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .celda-dia {
    height: 50px;
    padding: 2px;
  }

  .numero-dia {
    font-size: 0.8rem;
  }

  .indicador-tipo {
    width: 14px;
    height: 14px;
    border-width: 1px;
  }

  .contenido-dia {
    gap: 2px;
  }
}

/* 🔧 FORZAR TAMAÑOS EN CASO DE CONFLICTOS */
:deep(.q-page) {
  min-height: calc(100vh - 50px);
}

:deep(.q-card) {
  overflow: visible;
}

:deep(.q-card-section) {
  padding: 16px;
}

/* Estilos para estados de carga */
.celda-dia.cargando {
  opacity: 0.6;
  cursor: wait;
}

.celda-dia.deshabilitado {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Efectos visuales mejorados */
.dia-calendario:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Animación para nuevos días seleccionados */
@keyframes seleccionarDia {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}

.dia-seleccionado {
  animation: seleccionarDia 0.3s ease-out;
}

/* Mejora para días vacíos */
.dia-vacio:hover {
  transform: none;
  background-color: #f5f5f5;
  cursor: default;
}

/* Asegurar que el grid ocupe espacio consistente */
.calendario-grid::after {
  content: '';
  flex: auto;
}

/* Contenedor principal del calendario */
:deep(.calendario-container) {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

/* Estilos para las secciones de contenido */
.seccion-contenido {
  min-height: 600px;
}
</style>
