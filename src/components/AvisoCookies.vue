<template>
  <transition name="sn-aviso">
    <aside v-if="visible" class="sn-aviso-cookies" :aria-label="t('avisoCookies.titulo')">
      <p class="sn-aviso-cookies__texto">
        {{ t('avisoCookies.texto') }}
        <router-link to="/Cookies">{{ t('avisoCookies.politica') }}</router-link>
      </p>
      <div class="sn-aviso-cookies__acciones">
        <q-btn
          outline
          color="primary"
          :label="t('avisoCookies.rechazar')"
          @click="decidir('rechazadas')"
        />
        <q-btn
          unelevated
          color="primary"
          :label="t('avisoCookies.aceptar')"
          @click="decidir('aceptadas')"
        />
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  guardarConsentimiento,
  leerConsentimiento,
  type EstadoConsentimiento,
} from 'src/composables/useConsentimientoCookies';

const { t } = useI18n();

// Oculto en el servidor; se decide en el navegador para no desajustar la hidratación
const visible = ref(false);

onMounted(() => {
  visible.value = leerConsentimiento() === null;
});

const decidir = (estado: EstadoConsentimiento) => {
  guardarConsentimiento(estado);
  visible.value = false;
};
</script>

<style scoped>
.sn-aviso-cookies {
  position: fixed;
  z-index: 6000;
  left: 12px;
  right: 12px;
  bottom: 12px;
  margin-inline: auto;
  max-width: 760px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding: 16px 20px;
  background: var(--sn-hoja);
  color: var(--sn-tinta);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra-alta);
}

.sn-aviso-cookies__texto {
  flex: 1 1 320px;
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.sn-aviso-cookies__acciones {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
  margin-left: auto;
}

@media (max-width: 480px) {
  .sn-aviso-cookies__acciones {
    width: 100%;
  }
  .sn-aviso-cookies__acciones .q-btn {
    flex: 1;
  }
}

.sn-aviso-enter-active,
.sn-aviso-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.sn-aviso-enter-from,
.sn-aviso-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
