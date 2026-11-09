<template>
  <div class="sw">
    <div class="sw-cabecera">
      <q-icon name="account_balance_wallet" class="sw-cabecera__icono" />
      <span class="sw-cabecera__titulo">{{ t('wallet.tuSaldo') }}</span>
      <router-link to="/ComprarPacks" class="sw-comprar">
        {{ t('wallet.comprarPacks') }}
        <q-icon name="chevron_right" size="18px" />
      </router-link>
    </div>

    <div class="sw-saldos">
      <div class="sw-saldo sn-sello-general">
        <q-spinner-dots v-if="loading" size="1.4em" class="sw-saldo__numero" />
        <span v-else class="sw-saldo__numero">{{ saldoNormal }}</span>
        <span class="sw-saldo__tipo">{{ t('wallet.clases') }}</span>
      </div>
      <div class="sw-saldo sn-sello-conversacion">
        <q-spinner-dots v-if="loading" size="1.4em" class="sw-saldo__numero" />
        <span v-else class="sw-saldo__numero">{{ saldoConversacion }}</span>
        <span class="sw-saldo__tipo">{{ t('wallet.conversacion') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Créditos del alumno por tipo de clase (1 crédito = 1 clase), con el color de cada tipo. */
import { useI18n } from 'vue-i18n';

defineProps({
  saldoNormal: { type: Number, default: 0 },
  saldoConversacion: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
});

const { t } = useI18n();
</script>

<style scoped>
.sw {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  padding: 14px 16px 16px;
  margin-bottom: 16px;
}
.sw-cabecera {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.sw-cabecera__icono {
  font-size: 20px;
  color: var(--sn-burdeos);
}
.sw-cabecera__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
}
.sw-comprar {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  font-size: var(--sn-t-peq);
  font-weight: 700;
  color: var(--sn-burdeos);
  text-decoration: none;
}
.sw-comprar:hover {
  text-decoration: underline;
}
.sw-saldos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.sw-saldo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 12px;
  background: var(--sn-sello-tenue);
  border: 1px solid color-mix(in srgb, var(--sn-sello) 25%, transparent);
}
.sw-saldo__numero {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-sello);
}
.sw-saldo__tipo {
  font-size: var(--sn-t-peq);
  font-weight: 600;
  color: var(--sn-sello);
}
</style>
