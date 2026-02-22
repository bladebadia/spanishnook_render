<!-- filepath: /workspaces/Spanishnook/Spanishnook/src/components/PromoCard.vue -->
<template>
  <div class="q-pa-none q-ma-none">
    <q-card class="card promo-card q-ma-none q-pa-none">
      <!-- Contenedor de imagen con badge de promoción -->
      <div class="image-container">
        <q-img
          :src="imageSrc"
          fit="contain"
          class="card-img-animada"
          @error="onImageError"
          :ratio="undefined"
          :style="computedImageStyle"
        />
        <!-- Badge de promoción -->
        <div v-if="showPromo" class="promo-badge">
          <q-icon name="star" size="18px" class="q-mr-xs" />
          <span>{{ promoText }}</span>
        </div>
      </div>
      <!-- Badge de precio -->
      <div v-if="showPrice && price" class="price-badge">
        <div v-if="originalPrice" class="original-price">{{ originalPrice }}</div>
        <div class="current-price">{{ price }}€/mes</div>
      </div>
      <q-card-section class="title subtitulo-responsivo">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="fechaInicio" class="fecha-inicio text-caption text-grey-8">
        {{ t('NuestrasClases.inicio') }}: {{ formatFecha(fechaInicio) }}
      </q-card-section>
      <q-card-section class="description texto-responsivo" :class="descriptionClass">
        <div v-html="formattedDescription"></div>
      </q-card-section>
      <q-card-actions class="actions flex flex-center">
        <q-btn
          :color="buttonColor"
          :to="to || buttonLink"
          class="oval-btn"
          :class="{ 'text-weight-regular': !buttonBold }"
          :no-caps="buttonNoCaps"
          :size="buttonSize"
          unelevated
          @click="handleButtonClick"
        >
          {{ buttonText }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
//import { useRoute } from 'vue-router';
import '../css/pages/EstilosGenerales.css';

interface Props {
  imageSrc: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to?: any;
  imageStyle?: string;
  showPromo?: boolean;
  promoText?: string;
  showPrice?: boolean;
  price?: string;
  originalPrice?: string;
  fechaInicio?: string;
  buttonColor?: string;
  buttonNoCaps?: boolean;
  buttonBold?: boolean;
  buttonSize?: string;
  descriptionClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showPromo: false,
  promoText: '¡Prueba tu clase gratis!',
  showPrice: false,
  price: ' ',
  originalPrice: '',
  buttonColor: 'primary',
  buttonNoCaps: false,
  buttonBold: true,
  buttonSize: 'md',
  descriptionClass: '',
});

const emit = defineEmits<{
  buttonClick: [];
}>();

const { locale, t } = useI18n();

const handleButtonClick = () => {
  emit('buttonClick');
};

const computedImageStyle = computed(() => {
  const baseStyle = 'max-height: 180px; width: auto; margin: 0 auto; display: block';
  return props.imageStyle ? `${baseStyle}; ${props.imageStyle}` : baseStyle;
});

const formattedDescription = computed(() => {
  return props.description.replace(/\n/g, '<br>');
});

const formatFecha = (fecha: string): string => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat(locale.value || 'es-ES', {
    dateStyle: 'long',
  }).format(date);
};

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  console.warn('Error cargando imagen:', target.src);
  target.src = '/img/estudiante_1024.jpg';
};
</script>

<style scoped>
/* Card como columna y sin overflow */
.card.promo-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  overflow: visible;
  width: 100%;
}

/* Contenedor de imagen con posición relativa para el badge */
.image-container {
  position: relative;
  width: 100%;
}

/* Badge de promoción */
.promo-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(238, 90, 111, 0.4);
  z-index: 10;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(238, 90, 111, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(238, 90, 111, 0.6);
  }
}

/* Badge de precio */
.price-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #851319 0%, #851319 100%);
  color: white;
  /* Ajustamos padding: menos arriba/abajo, más a los lados para efecto ovalado */
  padding: 8px 16px;
  border-radius: 20px !important;
  /* Corregimos la sombra al color rojo */
  box-shadow: 0 4px 12px rgba(133, 19, 25, 0.4);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px; /* Reducimos el hueco si hay precio original */
}

/* Precio original tachado */
.original-price {
  font-size: 0.75rem;
  text-decoration: line-through;
  opacity: 0.8;
  font-weight: 500;
}

/* Precio actual destacado */
.current-price {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
}

/* Imagen controlada - MÁS PEQUEÑA y COMPLETA */
.card-img-animada {
  min-height: 200px;
  width: 100%;
  object-fit: contain;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  padding: 8px;
  margin-top: 20px;
}

/* Título: corte seguro */
.title {
  padding: 8px 12px;
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  text-align: center;
  max-width: 100%;
  margin: 0 auto;
  overflow: visible;
  white-space: normal;
}

/* Descripción: MOSTRAR TODO sin line-clamp */
.description {
  padding: 12px 12px 0px;
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  overflow: visible;
  display: block;
  white-space: pre-wrap;
  text-overflow: clip;
  max-width: 100%;
  margin: 0 auto;
}

.description-small-bold {
  font-size: 0.92rem;
  font-weight: 700;
}

/* Acciones: al final, sin posición absoluta */
.actions {
  margin-top: auto;
  padding: 12px;
  position: static;
  text-align: center;
}

/* Botón sin posición fija */
.oval-btn {
  font-size: 1rem;
  padding: 10px 14px;
}

/* Hover suave */
.card.promo-card:hover {
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 0 0 2px rgba(133, 19, 25, 0.15) !important;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .card.promo-card {
    min-height: 380px;
  }

  .card-img-animada {
    height: 140px;
    padding: 6px;
    margin-top: 16px;
  }

  .promo-badge {
    top: 8px;
    right: 8px;
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .oval-btn {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
  .description {
    padding: 12px 12px 0px;
  }
}

@media (max-width: 480px) {
  .card.promo-card {
    min-height: 360px;
  }

  .card-img-animada {
    height: 120px;
    padding: 4px;
  }

  .promo-badge {
    font-size: 0.7rem;
    padding: 5px 8px;
  }
}
</style>
