<template>
  <q-card class="noticia-card q-mb-md">
    <!-- Imagen o Video -->
    <div class="media-container">
      <q-img
        v-if="mediaType === 'image'"
        :src="mediaUrl"
        :ratio="16/9"
        class="noticia-media"
      />
      <iframe
        v-else-if="mediaType === 'video'"
        :src="mediaUrl"
        class="noticia-media"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Contenido -->
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
      <div class="text-body2 q-mt-sm text-justify">{{ text }}</div>
    </q-card-section>

    <!-- Botón (opcional) -->
    <q-card-actions v-if="buttonText" align="right" class="q-pa-md">
      <q-btn
        :to="buttonLink"
        color="primary"
        :label="buttonText"
        class="noticia-btn"
        unelevated
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title: string;
  text: string;
  buttonText?: string;
  buttonLink?: string;
}

defineProps<Props>();
</script>

<style scoped>
.noticia-card {
  max-width: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.noticia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.media-container {
  overflow: hidden;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.noticia-media {
  width: 100%;
  object-fit: cover;
}

.noticia-btn {
  border-radius: 20px;
  padding: 8px 20px;
}

/* Responsive */
@media (max-width: 599px) {
  .noticia-card {
    margin: 8px;
  }
}

@media (min-width: 600px) {
  .noticia-card {
    margin: 16px;
  }
}
</style>