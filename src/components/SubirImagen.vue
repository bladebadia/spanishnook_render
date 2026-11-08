<template>
  <div class="subir-imagen">
    <div class="subir-imagen__fila">
      <div class="subir-imagen__previa" :class="{ 'subir-imagen__previa--vacia': !modelValue }">
        <img v-if="modelValue" :src="modelValue" :alt="t('subirImagen.vistaPrevia')" />
        <q-icon v-else name="image" size="32px" />
      </div>

      <div class="subir-imagen__acciones">
        <span class="text-caption text-weight-bold">{{ etiqueta ?? t('subirImagen.etiqueta') }}</span>
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            unelevated
            no-caps
            dense
            class="q-px-md"
            icon="upload"
            :label="modelValue ? t('subirImagen.cambiar') : t('subirImagen.subir')"
            :loading="subiendo"
            @click="input?.click()"
          />
          <q-btn
            v-if="modelValue"
            flat
            no-caps
            dense
            color="negative"
            icon="delete"
            :label="t('subirImagen.quitar')"
            @click="emit('update:modelValue', '')"
          />
        </div>
        <button type="button" class="subir-imagen__enlace" @click="verEnlace = !verEnlace">
          {{ t('subirImagen.usarEnlace') }}
        </button>
      </div>
    </div>

    <q-input
      v-if="verEnlace"
      :model-value="modelValue"
      dense
      filled
      class="q-mt-sm"
      :label="t('subirImagen.enlace')"
      placeholder="https://..."
      @update:model-value="(v) => emit('update:modelValue', String(v ?? ''))"
    />

    <input
      ref="input"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      class="hidden"
      @change="alElegir"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Campo de imagen para el panel de administración: sube la foto desde el dispositivo
 * al bucket público de Storage y devuelve su URL pública por v-model.
 * Antes de subirla la reduce (lado máximo 1200 px, WebP) para que cargue rápido en móvil.
 * Subir exige ser admin: política "Admins gestionan archivos" de storage.objects.
 */
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    /** Bucket público de Storage */
    bucket?: string;
    /** Carpeta dentro del bucket */
    carpeta?: string;
    etiqueta?: string;
  }>(),
  { bucket: 'imagenes', carpeta: 'cursos' },
);

const emit = defineEmits<{ 'update:modelValue': [valor: string] }>();

const $q = useQuasar();
const { t } = useI18n();
const input = ref<HTMLInputElement | null>(null);
const subiendo = ref(false);
const verEnlace = ref(false);

const MAX_MB = 10;
const LADO_MAXIMO = 1200;

/** Reduce la imagen a LADO_MAXIMO y la pasa a WebP. Si algo falla, devuelve la original. */
async function optimizar(archivo: File): Promise<{ blob: Blob; extension: string }> {
  const original = { blob: archivo as Blob, extension: archivo.name.split('.').pop()?.toLowerCase() || 'jpg' };
  if (archivo.type === 'image/gif') return original; // conservar animación
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/webp', 0.85));
    if (!blob || blob.type !== 'image/webp' || blob.size >= archivo.size) return original;
    return { blob, extension: 'webp' };
  } catch {
    return original;
  }
}

/** 'Mi Foto (1).PNG' → 'mi-foto-1' */
function nombreLimpio(nombre: string): string {
  return (
    nombre
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'imagen'
  );
}

async function alElegir(evento: Event) {
  const campo = evento.target as HTMLInputElement;
  const archivo = campo.files?.[0];
  campo.value = ''; // permite volver a elegir el mismo archivo
  if (!archivo) return;

  if (!archivo.type.startsWith('image/')) {
    $q.notify({ type: 'warning', message: t('subirImagen.noEsImagen') });
    return;
  }
  if (archivo.size > MAX_MB * 1024 * 1024) {
    $q.notify({ type: 'warning', message: t('subirImagen.demasiadoGrande', { mb: MAX_MB }) });
    return;
  }

  subiendo.value = true;
  try {
    const { blob, extension } = await optimizar(archivo);
    const ruta = `${props.carpeta}/${Date.now()}-${nombreLimpio(archivo.name)}.${extension}`;
    const { data, error } = await supabase.storage.from(props.bucket).upload(ruta, blob, {
      contentType: blob.type || archivo.type,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) throw error;
    const { data: publica } = supabase.storage.from(props.bucket).getPublicUrl(data.path);
    emit('update:modelValue', publica.publicUrl);
    $q.notify({ type: 'positive', message: t('subirImagen.subida') });
  } catch (e) {
    console.error('Error subiendo imagen:', e);
    $q.notify({ type: 'negative', message: t('subirImagen.error') });
  } finally {
    subiendo.value = false;
  }
}
</script>

<style scoped>
.subir-imagen__fila {
  display: flex;
  gap: 12px;
  align-items: center;
}
.subir-imagen__previa {
  flex: none;
  width: 88px;
  height: 88px;
  border-radius: var(--sn-r-imagen);
  border: 1px solid var(--sn-borde);
  background: var(--sn-papel);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sn-tinta-suave);
}
.subir-imagen__previa--vacia {
  border-style: dashed;
}
.subir-imagen__previa img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.subir-imagen__acciones {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.subir-imagen__enlace {
  align-self: flex-start;
  background: none;
  border: 0;
  padding: 0;
  font-size: var(--sn-t-peq);
  color: var(--sn-tinta-suave);
  text-decoration: underline;
  cursor: pointer;
}
</style>
