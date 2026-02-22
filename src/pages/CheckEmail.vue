<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card
      class="q-pa-lg shadow-2 my-card text-center"
      bordered
      style="width: 100%; max-width: 480px"
    >
      <div class="q-mb-md animate-bounce">
        <q-avatar
          size="100px"
          color="grey-2"
          text-color="primary"
          font-size="52px"
          icon="mark_email_unread"
        />
      </div>

      <q-card-section class="q-pa-none">
        <div class="text-h5 text-primary text-weight-bold q-mb-xs">
          {{ t('checkEmail.registroCasi') }}
        </div>
        <div class="text-subtitle1 text-grey-7">{{ t('checkEmail.soloFalta') }}</div>
      </q-card-section>

      <q-card-section class="q-py-lg">
        <p class="text-responsivo2 text-center text-grey-8">
          {{ t('checkEmail.hemosenviado') }}
        </p>

        <q-banner dense rounded class="bg-orange-1 text-brown-9 q-mt-md text-left border-orange">
          <template v-slot:avatar>
            <q-icon name="info" color="orange-9" />
          </template>
          <span class="text-responsivo2 text-weight-bold" style="font-size: 0.9em">
            {{ t('checkEmail.noloEncuentras') }} </span
          ><br />
          <span class="text-responsivo2">
            {{ t('checkEmail.revisatuCarpeta') }}
          </span>
        </q-banner>
      </q-card-section>

      <q-card-actions align="center" class="column q-gutter-sm q-mt-sm">
        <q-btn
          :label="t('checkEmail.iniciar')"
          to="/Acceder"
          color="primary"
          unelevated
          size="lg"
          class="full-width shadow-1"
          icon-right="login"
        />

        <q-btn :label="t('checkEmail.volver')" to="/" color="grey-7" flat class="full-width" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
defineOptions({ name: 'CheckEmail' });
</script>

<style scoped>
.my-card {
  border-radius: 16px;
}
.border-orange {
  border: 1px solid #ffe0b2; /* Borde naranja muy suave */
}
/* Animación de entrada */
@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-bounce {
  animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
