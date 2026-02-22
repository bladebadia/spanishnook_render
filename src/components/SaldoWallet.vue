<template>
  <q-card class="bg-grey-1 no-shadow border-gray q-mb-md">
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle2 text-grey-8 q-mb-sm flex items-center">
        <q-icon name="account_balance_wallet" class="q-mr-xs" color="primary" />
        {{ t('wallet.tuSaldo') }}
        <q-space />
        <q-btn
          flat
          dense
          size="xs"
          color="primary"
          :label="t('wallet.comprarPacks')"
          to="/ComprarPacks"
          icon-right="chevron_right"
          class="comprar-packs-btn"
        />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-card flat class="text-white text-center q-py-xs" style="background-color: #60aad8ff">
            <div v-if="loading" class="flex flex-center" style="height: 24px">
              <q-spinner-dots size="1em" />
            </div>
            <div v-else class="text-h6 text-weight-bold">{{ saldoNormal }}</div>
            <div class="text-caption" style="font-size: 0.65rem; opacity: 0.9">
              {{ t('wallet.clases') }}
            </div>
          </q-card>
        </div>

        <div class="col-6">
          <q-card flat class="text-white text-center q-py-xs" style="background-color: #b897cbff">
            <div v-if="loading" class="flex flex-center" style="height: 24px">
              <q-spinner-dots size="1em" />
            </div>
            <div v-else class="text-h6 text-weight-bold">{{ saldoConversacion }}</div>
            <div class="text-caption" style="font-size: 0.65rem; opacity: 0.9">
              {{ t('wallet.conversacion') }}
            </div>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps({
  saldoNormal: { type: Number, default: 0 },
  saldoConversacion: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
});

const { t } = useI18n();
</script>

<style scoped>
.border-gray {
  border: 1px solid #e0e0e0;
}

.comprar-packs-btn {
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
