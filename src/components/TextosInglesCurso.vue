<template>
  <q-expansion-item
    icon="translate"
    :label="t('adminCursoIngles.titulo')"
    :caption="t('adminCursoIngles.explica')"
    header-class="tic-cabecera"
    class="tic"
  >
    <div class="row q-col-gutter-md q-pt-sm">
      <div class="col-12 col-md-6">
        <q-input
          :model-value="modelValue.nombre_curso ?? ''"
          :label="t('adminCursoIngles.nombre')"
          filled
          dense
          @update:model-value="(v) => cambiar('nombre_curso', v)"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          :model-value="modelValue.titulo_tarjeta ?? ''"
          :label="t('adminCursoIngles.tituloTarjeta')"
          filled
          dense
          @update:model-value="(v) => cambiar('titulo_tarjeta', v)"
        />
      </div>
      <div class="col-12">
        <q-input
          :model-value="modelValue.texto_tarjeta ?? ''"
          :label="t('adminCursoIngles.textoTarjeta')"
          type="textarea"
          rows="2"
          filled
          dense
          @update:model-value="(v) => cambiar('texto_tarjeta', v)"
        />
      </div>
      <div class="col-12">
        <q-input
          :model-value="modelValue.descripcion ?? ''"
          :label="t('adminCursoIngles.descripcion')"
          type="textarea"
          rows="3"
          filled
          dense
          @update:model-value="(v) => cambiar('descripcion', v)"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          :model-value="modelValue.boton_tarjeta ?? ''"
          :label="t('adminCursoIngles.boton')"
          placeholder="More information"
          filled
          dense
          @update:model-value="(v) => cambiar('boton_tarjeta', v)"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          :model-value="modelValue.texto_promo ?? ''"
          :label="t('adminCursoIngles.promo')"
          placeholder="Try your free class!"
          maxlength="50"
          filled
          dense
          @update:model-value="(v) => cambiar('texto_promo', v)"
        />
      </div>
    </div>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { CampoTraducible, TextosEn } from 'src/utils/textoCurso';

const props = defineProps<{ modelValue: TextosEn }>();
const emit = defineEmits<{ 'update:modelValue': [valor: TextosEn] }>();
const { t } = useI18n();

function cambiar(campo: CampoTraducible, valor: string | number | null) {
  emit('update:modelValue', { ...props.modelValue, [campo]: String(valor ?? '') });
}
</script>

<style scoped>
.tic {
  border: 1px solid var(--sn-borde, #eadfd5);
  border-radius: 12px;
  overflow: hidden;
}
.tic :deep(.q-expansion-item__content) {
  padding: 4px 16px 16px;
}
</style>
