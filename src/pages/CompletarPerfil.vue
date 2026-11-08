<template>
  <q-page class="flex flex-center sn-pagina-acceso">
    <q-card class="cp-tarjeta">
      <q-card-section class="text-center q-pb-none">
        <q-icon name="waving_hand" class="cp-icono" />
        <h1 class="cp-h1">{{ t('CompletarPerfil.titulo') }}</h1>
        <p class="cp-entrada">{{ t('CompletarPerfil.entrada') }}</p>
      </q-card-section>

      <q-card-section>
        <div v-if="cargando" class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
        </div>

        <q-form v-else class="cp-form" @submit="guardar">
          <!-- Sobre ti -->
          <h2 class="cp-h2">{{ t('registro.sobreTi') }}</h2>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.nombre"
                outlined
                :label="t('personal.nombre') + ' *'"
                :rules="[(v) => !!v || t('registro.requerido')]"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.apellido1" outlined :label="t('personal.apellido')" />
            </div>
          </div>
          <q-select
            v-model="form.idiomaNativo"
            :options="idiomasComunes"
            outlined
            use-input
            input-debounce="0"
            new-value-mode="add-unique"
            :label="t('registro.lenguaMaterna') + ' *'"
            :rules="[(v) => !!v || t('registro.requerido')]"
          />

          <!-- Tu español -->
          <h2 class="cp-h2">{{ t('registro.tuEspanol') }}</h2>

          <p class="cp-pregunta">1. {{ t('registro.preguntaNivel') }}</p>
          <q-btn-toggle
            v-model="form.nivelEstimado"
            spread
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="grey-3"
            text-color="grey-9"
            :options="[
              { label: t('registro.nivelPrincipiante'), value: 'Principiante' },
              { label: t('registro.nivelIntermedio'), value: 'Intermedio' },
              { label: t('registro.nivelAvanzado'), value: 'Avanzado' },
            ]"
          />

          <p class="cp-pregunta">2. {{ t('registro.preguntaEstudiadoAntes') }}</p>
          <div class="q-gutter-md">
            <q-radio v-model="form.haEstudiadoAntes" :val="true" :label="t('registro.si')" />
            <q-radio v-model="form.haEstudiadoAntes" :val="false" :label="t('registro.noNunca')" />
          </div>
          <q-input
            v-if="form.haEstudiadoAntes"
            v-model="form.detallesEstudio"
            outlined
            class="q-mt-sm"
            :label="t('registro.dondeYCuantoTiempo')"
          />

          <p class="cp-pregunta">
            3. {{ t('registro.preguntaIntereses') }}
            <span class="cp-nota">({{ t('registro.seleccionaTodas') }})</span>
          </p>
          <div class="cp-intereses">
            <q-checkbox
              v-for="tag in tagsIntereses"
              :key="tag.val"
              v-model="form.intereses"
              :val="tag.val"
              :label="tag.label"
              class="cp-interes"
            />
          </div>

          <p class="cp-pregunta">4. {{ t('registro.tusObjetivos') }}</p>
          <q-input
            v-model="form.usoEspanol"
            outlined
            type="textarea"
            rows="3"
            :label="t('registro.paraQueEspanol')"
            :hint="t('registro.paraQueEspanolHint')"
          />

          <q-btn
            type="submit"
            color="primary"
            unelevated
            no-caps
            size="lg"
            class="full-width cp-boton"
            icon-right="check_circle"
            :label="t('CompletarPerfil.guardar')"
            :loading="guardando"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
/**
 * Cuestionario de perfil para quien entra con Google: el registro por correo ya lo pide
 * (pasos 2 y 3 de RegistroCuenta), pero el alta con Google se salta esos pasos.
 * AuthCallback trae aquí si datos_usuarios.nivel_estimado está vacío.
 */
import { computed, onMounted, ref } from 'vue';
import { useQuasar, useMeta } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { destinoSeguro } from 'src/utils/acceso';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { user } = useAuth();

useMeta({ title: 'SpanishNook', meta: { robots: { name: 'robots', content: 'noindex' } } });

const cargando = ref(true);
const guardando = ref(false);

const form = ref({
  nombre: '',
  apellido1: '',
  idiomaNativo: 'English',
  nivelEstimado: 'Principiante',
  haEstudiadoAntes: false,
  detallesEstudio: '',
  intereses: [] as string[],
  usoEspanol: '',
});

// Mismas opciones que el registro por correo
const idiomasComunes = ['English', 'Français', 'Deutsch', 'Italiano', 'Português', 'Otro/Another'];
const tagsIntereses = computed(() => [
  { label: t('registro.interesConversacion'), val: 'Conversación' },
  { label: t('registro.interesGramatica'), val: 'Gramática' },
  { label: t('registro.interesTrabajo'), val: 'Trabajo' },
  { label: t('registro.interesViajes'), val: 'Viajes' },
  { label: t('registro.interesCultura'), val: 'Cultura' },
  { label: t('registro.interesExamenes'), val: 'Exámenes' },
]);

onMounted(async () => {
  try {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) return;
    const { data: datos } = await supabase
      .from('datos_usuarios')
      .select('nombre, apellido1, idioma_nativo, nivel_estimado, uso_espanol, intereses')
      .eq('user_id', u.id)
      .maybeSingle();
    const meta = u.user_metadata ?? {};
    form.value.nombre = datos?.nombre || meta.given_name || meta.full_name || '';
    form.value.apellido1 = datos?.apellido1 || meta.family_name || '';
    form.value.idiomaNativo = datos?.idioma_nativo || 'English';
    form.value.nivelEstimado = datos?.nivel_estimado || 'Principiante';
    form.value.usoEspanol = datos?.uso_espanol || '';
    form.value.intereses = Array.isArray(datos?.intereses) ? datos.intereses : [];
  } finally {
    cargando.value = false;
  }
});

async function guardar() {
  if (!user.value?.id) return;
  guardando.value = true;
  try {
    const { error } = await supabase
      .from('datos_usuarios')
      .update({
        nombre: form.value.nombre,
        apellido1: form.value.apellido1 || null,
        idioma_nativo: form.value.idiomaNativo,
        nivel_estimado: form.value.nivelEstimado,
        ha_estudiado_antes: form.value.haEstudiadoAntes,
        detalles_estudio_previo: form.value.haEstudiadoAntes ? form.value.detallesEstudio || null : null,
        intereses: form.value.intereses,
        uso_espanol: form.value.usoEspanol || null,
      })
      .eq('user_id', user.value.id);
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('CompletarPerfil.guardado') });
    void router.replace(destinoSeguro(route.query.redirect));
  } catch (e) {
    console.error('Error guardando el perfil:', e);
    $q.notify({ type: 'negative', message: t('CompletarPerfil.error') });
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.cp-tarjeta {
  width: 100%;
  max-width: 680px;
}
.cp-icono {
  font-size: 30px;
  color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
  border-radius: 50%;
  padding: 12px;
}
.cp-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  color: var(--sn-burdeos);
  margin: 12px 0 8px;
}
.cp-entrada {
  color: var(--sn-tinta-suave);
  margin: 0 auto;
  max-width: 50ch;
}
.cp-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  margin: 24px 0 12px;
}
.cp-pregunta {
  font-weight: 700;
  margin: 18px 0 8px;
}
.cp-nota {
  font-weight: 400;
  color: var(--sn-tinta-suave);
  font-size: var(--sn-t-peq);
}
.cp-intereses {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 560px) {
  .cp-intereses {
    grid-template-columns: 1fr 1fr;
  }
}
.cp-interes {
  border: 1px solid var(--sn-borde);
  border-radius: 10px;
  padding: 4px 8px;
  background: var(--sn-papel);
}
.cp-boton {
  margin-top: 28px;
  border-radius: var(--sn-r-boton);
}
</style>
