<template>
  <q-page class="ap-pagina full-width">
    <q-no-ssr>
      <div class="full-width">
        <div class="row">
          <div class="col-12 text-center q-mb-lg">
            <h1 class="ap-h1">
              {{
                user?.user_metadata?.nombre
                  ? t('personal.holaNombre', { nombre: user.user_metadata.nombre })
                  : t('personal.holaUsuario')
              }}
            </h1>
            <p class="ap-entrada">
              {{ t('personal.bienvenidoAreaPersonal') }}
            </p>
          </div>
        </div>

        <!-- Perfil sin cuestionario (alta con Google que no lo terminó) -->
        <div v-if="perfilIncompleto" class="ap-aviso sn-nota">
          <q-icon name="assignment_ind" class="ap-aviso__icono" />
          <div class="ap-aviso__texto">
            <strong>{{ t('CompletarPerfil.avisoTitulo') }}</strong>
            <span>{{ t('CompletarPerfil.avisoTexto') }}</span>
          </div>
          <q-btn
            color="primary"
            unelevated
            no-caps
            :label="t('CompletarPerfil.avisoBoton')"
            :to="{ path: '/CompletarPerfil', query: { redirect: '/AreaPersonal' } }"
          />
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-3">
            <SaldoWallet
              :saldo-normal="formDatos.saldo_normal"
              :saldo-conversacion="formDatos.saldo_conversacion"
              :loading="cargandoSaldo"
              class="q-mb-md"
            />

            <q-btn
              color="primary"
              class="full-width q-mb-md"
              no-caps
              icon="add_circle"
              :label="t('personal.nuevaReserva')"
              to="/Reservas"
              unelevated
            />

            <!-- Móvil: secciones como pestañas deslizables, siempre visibles -->
            <nav class="ap-pestanas lt-md" :aria-label="t('personal.miCuenta')">
              <button
                v-for="seccion in seccionesMovil"
                :key="seccion.id"
                type="button"
                class="ap-pestana"
                :class="{
                  'ap-pestana--activa': menuActivo === seccion.id,
                  'ap-pestana--peligro': seccion.id === 'eliminar',
                }"
                @click="seccion.id === 'admin' ? irAPanelAdmin() : seleccionarMenu(seccion.id)"
              >
                <q-icon :name="seccion.icono" size="18px" />
                {{ seccion.texto }}
              </button>
            </nav>

            <q-card class="menu-card no-shadow border-gray gt-sm">
              <q-list class="q-py-sm">
                <!-- GRUPO 1: FORMACIÓN -->
                <q-item-label
                  header
                  class="text-weight-bold text-uppercase text-grey-7 text-caption q-pt-md"
                >
                  {{ t('personal.miFormacion') }}
                </q-item-label>

                <q-item
                  clickable
                  v-ripple
                  :active="menuActivo === 'reservadas'"
                  @click="seleccionarMenu('reservadas')"
                  active-class="ap-activo"
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
                  active-class="ap-activo"
                >
                  <q-item-section avatar><q-icon name="school" /></q-item-section>
                  <q-item-section>{{ t('personal.misCursos') }}</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :active="menuActivo === 'historial'"
                  @click="seleccionarMenu('historial')"
                  active-class="ap-activo"
                >
                  <q-item-section avatar><q-icon name="history" /></q-item-section>
                  <q-item-section>{{ t('personal.historialClases') }}</q-item-section>
                </q-item>

                <!-- GRUPO 2: RECURSOS -->
                <q-item-label
                  header
                  class="text-weight-bold text-uppercase text-grey-7 text-caption q-mt-sm"
                >
                  {{ t('personal.recursos') }}
                </q-item-label>

                <q-item
                  clickable
                  v-ripple
                  :active="menuActivo === 'materiales'"
                  @click="seleccionarMenu('materiales')"
                  active-class="ap-activo"
                >
                  <q-item-section avatar><q-icon name="menu_book" /></q-item-section>
                  <q-item-section>{{ t('personal.misCuadernos') }}</q-item-section>
                </q-item>

                <!-- GRUPO 3: CUENTA -->
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
                  active-class="ap-activo"
                >
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>{{ t('personal.datosPersonales') }}</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  :active="menuActivo === 'eliminar'"
                  @click="seleccionarMenu('eliminar')"
                  active-class="ap-activo ap-activo--peligro"
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
                  <q-item-section class="text-weight-bold text-negative"
                    >{{ t('personal.panelAdmin') }}</q-item-section
                  >
                </q-item>
              </q-list>
            </q-card>
          </div>

          <div class="col-12 col-md-9">
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
                  <ul v-if="reservasConfirmadas.length > 0" class="ap-lista">
                    <li
                      v-for="reserva in reservasConfirmadas"
                      :key="reserva.id"
                      class="ap-fila"
                      :class="reserva.tipo === 'normal' ? 'sn-sello-general' : 'sn-sello-conversacion'"
                    >
                      <q-checkbox
                        v-if="modoSeleccion"
                        v-model="seleccionadas"
                        :val="reserva.id"
                        :disable="!puedeCancelar(reserva)"
                      >
                        <q-tooltip v-if="!puedeCancelar(reserva)">{{
                          t('personal.noSePuedeCancelar')
                        }}</q-tooltip>
                      </q-checkbox>

                      <!-- Hoja de calendario con la fecha del alumno, en el color del tipo de clase -->
                      <div class="ap-hoja" :aria-label="formatFecha(reserva.fecha, reserva.hora)">
                        <span class="ap-hoja__semana">{{ partesFecha(reserva).diaSemana }}</span>
                        <span class="ap-hoja__dia">{{ partesFecha(reserva).dia }}</span>
                        <span class="ap-hoja__mes">{{ partesFecha(reserva).mes }}</span>
                      </div>

                      <div class="ap-fila__texto">
                        <span class="ap-fila__hora">
                          {{ formatoHorarioLocal(reserva.fecha, reserva.hora) }}
                        </span>
                        <span class="ap-fila__detalle">
                          <span class="ap-fila__tipo">{{ getTipoClaseTexto(reserva) }}</span>
                          · {{ t('personal.horaMadrid', { hora: formatHorarioIndividual(reserva.hora) }) }}
                        </span>
                        <span v-if="!puedeCancelar(reserva)" class="ap-fila__nota">
                          {{ t('personal.yaNoSeCancela') }}
                        </span>
                      </div>

                      <q-btn
                        v-if="!modoSeleccion && reserva.meet_link"
                        type="a"
                        :href="reserva.meet_link"
                        target="_blank"
                        color="primary"
                        unelevated
                        no-caps
                        icon="videocam"
                        class="ap-fila__boton"
                        :label="t('personal.entrar')"
                      />
                      <span v-else-if="!modoSeleccion" class="ap-fila__pendiente">
                        <q-icon name="hourglass_empty" size="16px" />
                        {{ t('personal.pendiente') }}
                      </span>
                    </li>
                  </ul>

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
                  <div class="text-h6 text-primary">
                    {{
                      misInscripciones.length > 0
                        ? t('personal.misCursos')
                        : t('personal.misSuscripcionesActivas')
                    }}
                  </div>
                  <q-btn flat icon="refresh" round color="primary" @click="cargarCursos" />
                </q-card-section>

                <q-card-section>
                  <!-- Cursos de fechas cerradas (pago único) -->
                  <div
                    v-if="misInscripciones.length > 0"
                    class="row q-col-gutter-md"
                    :class="{ 'q-mb-md': misSuscripciones.length > 0 }"
                  >
                    <div
                      class="col-12"
                      v-for="inscripcion in misInscripciones"
                      :key="inscripcion.id"
                    >
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
                              @click="router.push(`/ReservasCursos?id=${inscripcion.curso_id}`)"
                            >
                              {{
                                inscripcion.cursos_grupales?.nombre_curso ||
                                t('personal.cursoSinNombre')
                              }}
                            </div>
                            <div
                              v-if="inscripcion.cursos_grupales?.fecha_inicio"
                              class="text-subtitle2 text-grey-8"
                            >
                              <q-icon name="event" class="q-mr-xs" />
                              {{ fechasInscripcion(inscripcion) }}
                            </div>
                            <div class="text-subtitle2 text-grey-8 q-mb-sm">
                              <q-icon name="schedule" class="q-mr-xs" />
                              {{ traducirDiasSemana(inscripcion.cursos_grupales?.dias_semana) }} •
                              {{
                                formatHorarios(
                                  inscripcion.cursos_grupales?.horarios_curso,
                                  inscripcion.cursos_grupales?.dias_semana,
                                  inscripcion.cursos_grupales?.duracion_minutos ?? 90,
                                )
                              }}
                            </div>
                            <div class="row items-center q-gutter-x-sm">
                              <q-badge color="primary">{{ t('personal.pagoUnico') }}</q-badge>
                              <q-badge v-if="inscripcionTerminada(inscripcion)" color="grey-7">
                                {{ t('personal.cursoFinalizado') }}
                              </q-badge>
                            </div>
                          </q-card-section>
                          <q-card-section class="col-auto column justify-center q-gutter-y-sm">
                            <q-btn
                              v-if="
                                inscripcion.cursos_grupales?.meet_link &&
                                !inscripcionTerminada(inscripcion)
                              "
                              :href="inscripcion.cursos_grupales?.meet_link ?? undefined"
                              target="_blank"
                              rel="noopener"
                              color="primary"
                              icon="videocam"
                              :label="t('personal.entrar')"
                              unelevated
                              size="sm"
                            />
                          </q-card-section>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>

                  <div v-if="misSuscripciones.length > 0" class="row q-col-gutter-md">
                    <div
                      class="col-12"
                      v-for="suscripcion in misSuscripciones"
                      :key="suscripcion.id"
                    >
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
                              {{
                                suscripcion.cursos_grupales?.nombre_curso ||
                                t('personal.cursoSinNombre')
                              }}
                            </div>
                            <div class="text-subtitle2 text-grey-8 q-mb-sm">
                              <q-icon name="schedule" class="q-mr-xs" />
                              {{ traducirDiasSemana(suscripcion.cursos_grupales?.dias_semana) }} •
                              {{
                                formatHorarios(
                                  suscripcion.cursos_grupales?.horarios_curso,
                                  suscripcion.cursos_grupales?.dias_semana,
                                )
                              }}
                            </div>
                            <div class="row items-center q-gutter-x-sm">
                              <q-badge
                                :color="
                                  suscripcion.estado === 'active' &&
                                  !suscripcion.cancel_at_period_end
                                    ? 'positive'
                                    : 'orange'
                                "
                              >
                                {{
                                  suscripcion.estado === 'active' &&
                                  !suscripcion.cancel_at_period_end
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

                  <div
                    v-else-if="misInscripciones.length === 0"
                    class="column flex-center q-pa-xl text-grey-6"
                  >
                    <q-icon name="school" size="60px" class="q-mb-md opacity-50" />
                    <div class="text-h6">{{ t('personal.noTienesSuscripciones') }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div v-if="menuActivo === 'materiales'">
              <q-card class="shadow-1 rounded-borders">
                <q-card-section class="row items-center justify-between">
                  <div class="text-h6 text-primary">
                    {{ t('personal.misCuadernosYMateriales') }}
                  </div>
                  <q-btn flat icon="refresh" round color="primary" @click="cargarMisCuadernos" />
                </q-card-section>

                <q-card-section>
                  <div v-if="cargandoCuadernos" class="row justify-center q-pa-md">
                    <q-spinner-dots color="primary" size="2em" />
                  </div>

                  <div v-else-if="misCuadernos.length > 0" class="row q-col-gutter-md">
                    <div class="col-12 col-md-6" v-for="mat in misCuadernos" :key="mat.id">
                      <q-card bordered flat>
                        <q-card-section horizontal>
                          <q-img
                            :src="
                              mat.imagen_portada || 'https://via.placeholder.com/150x200?text=PDF'
                            "
                            class="col-4"
                            style="height: 140px; border-radius: 4px 0 0 4px"
                          />
                          <q-card-section class="col-8 column justify-between">
                            <div>
                              <div class="text-h6 text-weight-bold" style="line-height: 1.2">
                                {{ mat.titulo }}
                              </div>
                              <div class="text-caption text-grey-7 q-mt-xs ellipsis-2-lines">
                                {{ mat.descripcion_breve }}
                              </div>
                            </div>
                            <div class="row justify-end q-mt-sm">
                              <q-btn
                                color="positive"
                                icon="download"
                                :label="t('MaterialesPage.descargarPdf')"
                                size="sm"
                                unelevated
                                @click="descargarPdfSeguro(mat.archivo_pdf)"
                              />
                            </div>
                          </q-card-section>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>

                  <div v-else class="column flex-center q-pa-xl text-grey-6">
                    <q-icon name="menu_book" size="60px" class="q-mb-md opacity-50" />
                    <div class="text-h6">{{ t('personal.sinCuadernos') }}</div>
                    <q-btn
                      outline
                      color="primary"
                      :label="t('MaterialesPage.verCatalogo')"
                      to="/Materiales"
                      class="q-mt-md"
                    />
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
                      <q-field
                        :label="t('personal.email')"
                        dense
                        outlined
                        stack-label
                        readonly
                        bg-color="grey-1"
                      >
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
                    <div class="text-subtitle2 text-primary q-mb-xs">
                      {{ t('personal.tuPerfil') }}
                    </div>
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
                  <div class="text-subtitle2 text-grey-8 q-mb-xs">
                    {{ t('personal.repiteNueva') }}
                  </div>
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
                          formatFecha(reserva.fecha, reserva.hora)
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
      </div>
    </q-no-ssr>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';
import { useSuscripciones } from 'src/composables/useSuscripciones';
import SaldoWallet from 'components/SaldoWallet.vue';
import {
  compararClases,
  esClaseFutura,
  faltanAlMenos,
  formatFechaCalendario,
  formatFechaClaseLocal,
  hoyMadridISO,
  partesFechaClaseLocal,
  proximaFechaDiaSemana,
  rangoHoraLocal,
  rangoHoraMadrid,
} from 'src/utils/zonaHoraria';

const $q = useQuasar();
const { user, logout } = useAuth();
const router = useRouter();
const { t, locale } = useI18n();
const { procesando, cambiarEstadoCancelacion } = useSuscripciones();
const route = useRoute();

// --- ESTADOS ---
const reservasConfirmadas = ref<Reserva[]>([]);
const reservasPasadas = ref<Reserva[]>([]);
const menuActivo = ref('reservadas');

// Pestañas de móvil (mismas secciones que el menú lateral de escritorio)
const seccionesMovil = computed(() => [
  { id: 'reservadas', icono: 'event', texto: t('personal.clasesReservadas') },
  { id: 'cursos', icono: 'school', texto: t('personal.misCursos') },
  { id: 'historial', icono: 'history', texto: t('personal.historialClases') },
  { id: 'materiales', icono: 'menu_book', texto: t('personal.misCuadernos') },
  { id: 'datos', icono: 'person', texto: t('personal.datosPersonales') },
  ...(esAdmin.value ? [{ id: 'admin', icono: 'admin_panel_settings', texto: t('personal.panelAdmin') }] : []),
  { id: 'eliminar', icono: 'delete_outline', texto: t('personal.eliminarCuenta') },
]);
const passwordConfirm = ref('');
const deleting = ref(false);
const cargandoSaldo = ref(true);

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

// Cursos de fechas cerradas: inscripciones pagadas (pago único)
interface InscripcionCurso {
  id: string;
  curso_id: number;
  estado: string;
  created_at: string;
  cursos_grupales?: {
    nombre_curso: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    dias_semana: string[];
    horarios_curso: string[];
    meet_link?: string | null;
    duracion_minutos?: number | null;
  } | null;
}
const misInscripciones = ref<InscripcionCurso[]>([]);

// Variables para cuadernos
interface MiCuaderno {
  id: number;
  titulo: string;
  descripcion_breve: string;
  imagen_portada: string;
  archivo_pdf: string;
}

const misCuadernos = ref<MiCuaderno[]>([]);
const cargandoCuadernos = ref(false);

const cargarMisCuadernos = async () => {
  if (!user.value?.id) return;
  cargandoCuadernos.value = true;

  try {
    // 1. Leemos los IDs de los materiales que has comprado
    const { data: compras, error: errorCompras } = await supabase
      .from('compras_materiales')
      .select('material_id')
      .eq('user_id', user.value.id);

    if (errorCompras) throw errorCompras;

    // Si no hay compras, vaciamos la lista y cortamos
    if (!compras || compras.length === 0) {
      misCuadernos.value = [];
      return;
    }

    // 2. Extraemos solo los números (los IDs) en una lista
    const idsComprados = compras.map((c) => c.material_id);

    // 3. Traemos la información completa de esos materiales específicos
    const { data: materiales, error: errorMat } = await supabase
      .from('materiales_didacticos')
      .select('id, titulo, descripcion_breve, imagen_portada, archivo_pdf')
      .in('id', idsComprados);

    if (errorMat) throw errorMat;

    // Se los pasamos a Vue asegurando el formato
    if (materiales) {
      misCuadernos.value = materiales as unknown as MiCuaderno[];
    }
  } catch (error) {
    console.error('Error cargando los cuadernos comprados:', error);
  } finally {
    cargandoCuadernos.value = false;
  }
};

const descargarPdfSeguro = async (archivo_pdf: string) => {
  if (!archivo_pdf) return;

  // Aquí usamos la url firmada temporal de 60 segundos
  const { data, error } = await supabase.storage
    .from('pdfs_materiales')
    .createSignedUrl(archivo_pdf, 60);

  if (error) {
    $q.notify({ type: 'negative', message: t('MaterialesPage.errorDescarga') });
    return;
  }

  if (data?.signedUrl) {
    window.open(data.signedUrl, '_blank');
  }
};

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
// Política de cancelación: 24 h, medidas sobre el instante real de la clase (hora de Madrid)
const puedeCancelar = (reserva: Reserva): boolean => faltanAlMenos(reserva.fecha, reserva.hora, 24);

const cancelarSeleccionadas = () => {
  if (seleccionadas.value.length === 0) return;

  $q.dialog({
    title: t('personal.cancelarReserva'),
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
        nombre_curso: t('personal.cursoNoEncontrado'),
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

const cargarInscripciones = async () => {
  if (!user.value?.id) return;
  const { data, error } = await supabase
    .from('inscripciones_curso')
    .select(
      `id, curso_id, estado, created_at,
      cursos_grupales!curso_id (nombre_curso, fecha_inicio, fecha_fin, dias_semana, horarios_curso,
        meet_link, duracion_minutos)`,
    )
    .eq('user_id', user.value.id)
    .eq('estado', 'pagada')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }
  misInscripciones.value = (data ?? []) as unknown as InscripcionCurso[];
};

const cargarCursos = () => Promise.all([cargarSuscripciones(), cargarInscripciones()]);

const inscripcionTerminada = (inscripcion: InscripcionCurso) => {
  const fin = inscripcion.cursos_grupales?.fecha_fin;
  return !!fin && fin < hoyMadridISO();
};

const fechasInscripcion = (inscripcion: InscripcionCurso) => {
  const curso = inscripcion.cursos_grupales;
  if (!curso?.fecha_inicio) return '';
  return t('personal.fechasCurso', {
    inicio: formatFecha(curso.fecha_inicio),
    fin: curso.fecha_fin ? formatFecha(curso.fecha_fin) : '…',
  });
};

const confirmarCancelacion = (sub: Suscripcion) => {
  const fechaFin = formatearFechaSuscripcion(sub.current_period_end);
  $q.dialog({
    title: t('personal.cancelarSuscripcionPregunta'),
    message: `${t('personal.seguirasTeniendoAcceso')} <b>${fechaFin}</b>.`,
    html: true,
    persistent: true,
    ok: { label: t('personal.siCancelar'), color: 'negative', flat: true },
    cancel: { label: t('personal.volver'), color: 'primary' },
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
  return t('personal.fechaInvalida');
};

// --- FUNCIÓN LOCAL SEGURA PARA CURSOS (90 MINUTOS POR DEFECTO) ---
const formatHorarios = (horarios?: string[], dias?: string[], duracionMin = 90) => {
  const horaInicio = horarios?.[0];
  if (!horaInicio) return t('reservasCursos.porDefinir');
  // Próxima fecha real del curso para aplicar el horario de verano correcto
  const fechaRef = proximaFechaDiaSemana(dias?.[0] ?? '') ?? hoyMadridISO();
  return rangoHoraLocal(fechaRef, horaInicio, duracionMin);
};

// --- FUNCIÓN LOCAL SEGURA PARA CLASES INDIVIDUALES (60 MINUTOS) ---
const formatoHorarioLocal = (fechaStr: string | undefined, horaStr: string | undefined) =>
  fechaStr && horaStr ? rangoHoraLocal(fechaStr, horaStr, 60) : '...';

// --- FORMATO SIMPLE PARA MOSTRAR LA HORA DE MADRID (TEXTO) ---
const formatHorarioIndividual = (horaInicio: string) =>
  horaInicio ? rangoHoraMadrid(horaInicio, 60) : '';

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

// Ficha sin nivel: el alumno entró con Google y no terminó el cuestionario
const perfilIncompleto = ref(false);

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
          message: t('personal.errorPerfil406'),
        });
      }
      if (error.code !== 'PGRST116') return;
    }
    if (data) {
      perfilIncompleto.value = !data.nivel_estimado;
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
  return Boolean(user.value?.app_metadata?.is_admin);
});

const cargarReservasPasadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data: antiguas } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .lt('fecha', hoyMadridISO())
      .order('fecha', { ascending: false });

    const { data: hoy } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .eq('fecha', hoyMadridISO());

    let pasadasHoy: Reserva[] = [];
    if (hoy) {
      pasadasHoy = hoy.filter((r) => !esClaseFutura(r.fecha, r.hora));
    }
    const total = [...(antiguas || []), ...pasadasHoy];
    reservasPasadas.value = total.sort((a, b) => compararClases(b, a));
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
      .gte('fecha', hoyMadridISO())
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (data) {
      reservasConfirmadas.value = data.filter((r) => esClaseFutura(r.fecha, r.hora));
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
  else if (menu === 'cursos') void cargarCursos();
  else if (menu === 'materiales') void cargarMisCuadernos(); // AÑADE ESTA LÍNEA
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

// Con hora: fecha tal como la vive el alumno (puede ser otro día que en Madrid)
const formatFecha = (fecha: string, hora?: string) =>
  hora ? formatFechaClaseLocal(fecha, hora, locale.value) : formatFechaCalendario(fecha, locale.value);

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

const partesFecha = (reserva: Reserva) =>
  partesFechaClaseLocal(reserva.fecha, reserva.hora, locale.value);

const getTipoClaseTexto = (reserva: Reserva): string =>
  reserva.tipo === 'normal' ? t('personal.claseNormal') : t('personal.claseConversacion');

onMounted(() => {
  void cargarReservasConfirmadas();
  void cargarDatosPersonales();

  if (route.query.session_id) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carritoReservas');
      window.dispatchEvent(new Event('storage'));
    }
    $q.notify({
      type: 'positive',
      message: t('personal.pagoCompletado'),
      icon: 'check_circle',
      position: 'top',
    });

    // void router.replace('/AreaPersonal');
  }
});
</script>

<style scoped>
/* Mis reservas: filas compactas con hoja de calendario */
.ap-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.ap-fila {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border: 1px solid var(--sn-borde);
  border-radius: 12px;
  background: var(--sn-hoja);
}
.ap-hoja {
  flex: none;
  width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--sn-sello);
  background: var(--sn-hoja);
  line-height: 1.1;
}
.ap-hoja__semana {
  width: 100%;
  text-align: center;
  background: var(--sn-sello);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 0;
}
.ap-hoja__dia {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--sn-tinta);
  padding-top: 2px;
}
.ap-hoja__mes {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--sn-tinta-suave);
  text-transform: uppercase;
  padding-bottom: 4px;
}
.ap-fila__texto {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}
.ap-fila__hora {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: 1.05rem;
}
.ap-fila__detalle {
  font-size: var(--sn-t-peq);
  color: var(--sn-tinta-suave);
}
.ap-fila__tipo {
  color: var(--sn-sello);
  font-weight: 700;
}
.ap-fila__nota {
  font-size: 0.78rem;
  color: var(--sn-tinta-suave);
}
.ap-fila__boton {
  flex: none;
  border-radius: var(--sn-r-boton);
}
.ap-fila__pendiente {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--sn-t-peq);
  color: var(--sn-tinta-suave);
}
@media (max-width: 420px) {
  .ap-fila {
    flex-wrap: wrap;
  }
  .ap-fila__boton {
    width: 100%;
  }
}
.ap-aviso {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 14px 18px;
  margin-bottom: 20px;
}
.ap-aviso__icono {
  font-size: 28px;
  color: var(--sn-burdeos);
}
.ap-aviso__texto {
  display: flex;
  flex-direction: column;
  flex: 1 1 220px;
}
.ap-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
  padding: clamp(16px, 4vw, 32px) var(--sn-margen) var(--sn-seccion);
}
.ap-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  color: var(--sn-burdeos);
  margin: 0;
}
.ap-entrada {
  font-size: var(--sn-t-entrada);
  color: var(--sn-tinta-suave);
  margin: 8px 0 0;
}

/* Menú de escritorio: sección activa como en el menú lateral */
.menu-card :deep(.q-item__section--avatar) {
  min-width: 36px;
}
.menu-card :deep(.q-item__label--header) {
  padding: 12px 16px 4px;
}
.menu-card :deep(.q-item) {
  border-radius: 10px;
  margin: 2px 8px;
}
.menu-card :deep(.ap-activo) {
  background: var(--sn-burdeos-tenue);
  color: var(--sn-burdeos);
  font-weight: 700;
}
.menu-card :deep(.ap-activo--peligro) {
  color: var(--q-negative);
}

/* Móvil: pestañas deslizables */
.ap-pestanas {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 32px 10px 2px;
  margin-bottom: 8px;
  scrollbar-width: none;
  /* Degradado al borde: indica que hay más pestañas al deslizar */
  mask-image: linear-gradient(to right, #000 85%, transparent);
}
/* Desde 600 px (tablet, ventanas estrechas con ratón): todas visibles en varias líneas */
@media (min-width: 600px) {
  .ap-pestanas {
    flex-wrap: wrap;
    overflow-x: visible;
    padding-right: 2px;
    mask-image: none;
  }
}
.ap-pestanas::-webkit-scrollbar {
  display: none;
}
.ap-pestana {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-boton);
  background: var(--sn-hoja);
  color: var(--sn-tinta);
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
.ap-pestana--activa {
  background: var(--sn-burdeos);
  border-color: var(--sn-burdeos);
  color: #fff;
}
.ap-pestana--peligro:not(.ap-pestana--activa) {
  color: var(--q-negative);
}
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
