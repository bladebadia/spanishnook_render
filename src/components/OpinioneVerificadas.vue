<!-- filepath: /workspaces/Spanishnook/Spanishnook/src/components/OpinioneVerificadas.vue -->
<template>
  <q-card class="opinion-card bg-yellow-2">
    <q-card-section class="row items-center q-pb-none">
      <div class="col">
        <div class="text-h6 text-weight-bold">{{ opinion.name }}</div>
        <div class="text-caption text-grey-7">{{ opinion.country }}</div>
        <q-rating :model-value="opinion.rating" readonly size="sm" color="amber" class="q-mt-xs" />
      </div>
      <q-icon v-if="opinion.verified" name="verified" color="primary" size="md">
        <q-tooltip>Opinión verificada</q-tooltip>
      </q-icon>
    </q-card-section>

    <q-card-section>
      <div class="text-body2" style="color: #111">
        {{ opinion.comment }}
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="row items-center text-caption text-grey-6">
        <span>{{ formatDate(opinion.date) }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Opinion {
  name: string;
  country: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
}

interface Props {
  opinion: Opinion;
  showAvatar?: boolean;
}

withDefaults(defineProps<Props>(), {
  showAvatar: true,
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>

.opinion-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.opinion-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
</style>
