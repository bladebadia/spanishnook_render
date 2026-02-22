<template>
  <div class="legal-page q-pa-lg">
    <p class="text-h3 text-primary text-bold text-center titulo-responsivo">Política de Cookies</p>
    <p class="text-h6 text-left text-black texto-responsivo">
      En esta página se informa de manera clara y accesible sobre el uso de cookies en el Sitio Web
      <span style="color: firebrick">www.spanishnook.com</span>
      <br />
    </p>

    <p class="q-pt-md text-primary text-bold texto-responsivo">Qué son las cookies</p>
    <p class="text-left text-justify texto-responsivo">
      El acceso a este Sitio Web puede implicar la utilización de cookies. Las cookies son pequeños
      archivos de información que se almacenan en el navegador del Usuario —en los distintos
      dispositivos que pueda utilizar para navegar— y que permiten al Sitio Web recordar cierta
      información sobre su visita, como sus preferencias o datos técnicos, con el fin de mejorar su
      experiencia de navegación. Las cookies no dañan el dispositivo del Usuario ni permiten acceder
      a información personal almacenada en el mismo.
    </p>
    <p class="q-pt-md text-primary text-bold texto-responsivo">Tipos de cookies utilizadas</p>
    <p class="text-left text-justify texto-responsivo">
      En este Sitio Web se utilizan los siguientes tipos de cookies:
      <br />
      <br />
      &#8226; Cookies técnicas o necesarias: permiten la navegación a través del sitio web y el uso
      de sus diferentes opciones o servicios. Estas cookies son necesarias para el correcto
      funcionamiento del Sitio Web y no requieren el consentimiento del Usuario.
      <br />
      <br />
      &#8226; Cookies de personalización: Son aquellas que permiten al Usuario acceder al servicio
      con algunas características de carácter general predefinidas en función de una serie de
      criterios en el terminal del Usuario, como por ejemplo serian el idioma, el tipo de navegador
      a través del cual accede al servicio, la configuración regional desde donde accede al
      servicio, etc.
      <br />
      <br />
      &#8226; Cookies de análisis: permiten el seguimiento y análisis del comportamiento de los
      Usuarios en el Sitio Web, con el fin de medir la actividad y mejorar su funcionamiento. Estas
      cookies solo se instalarán si el Usuario presta su consentimiento.
    </p>
    <br />

    <p class="q-pt-md text-primary text-bold texto-responsivo">
      Consentimiento para el uso de cookies
    </p>
    <p class="text-left text-justify texto-responsivo">
      <br />
      Las cookies que permiten identificar a una persona se consideran datos personales. Para la
      utilización de cookies no necesarias será necesario el consentimiento previo del Usuario, que
      se solicitará mediante un banner o panel de configuración al acceder al Sitio Web. El Usuario
      podrá aceptar, rechazar o configurar el uso de cookies en cualquier momento.
      <br />
    </p>

    <p class="q-pt-md text-primary text-bold texto-responsivo">
      Cómo deshabilitar o eliminar cookies
    </p>
    <br />
    <p class="text-left text-justify texto-responsivo">
      El Usuario puede deshabilitar, rechazar o eliminar las cookies instaladas en su dispositivo
      mediante la configuración de las opciones del navegador que esté utilizando (por ejemplo,
      Chrome, Firefox, Safari o Edge).
      <br />
      La desactivación de algunas cookies puede afectar al correcto funcionamiento del Sitio Web.
    </p>
  </div>
</template>
<script setup lang="ts"></script>

<style scoped>
.legal-page {
  max-width: 85%;
  margin: 0 auto;
}

.titulo-responsivo {
  font-size: 2.8rem;
}

@media (max-width: 900px) {
  .titulo-responsivo {
    font-size: 1.8rem;
  }
}

@media (max-width: 600px) {
  .titulo-responsivo {
    font-size: 1.3rem;
    font-weight: bold;
  }
}

.subtitulo-responsivo {
  font-size: 1.6rem;
}

@media (max-width: 900px) {
  .subtitulo-responsivo {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .subtitulo-responsivo {
    font-size: 1rem;
  }
}

.texto-responsivo {
  font-size: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 900px) {
  .texto-responsivo {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .texto-responsivo {
    font-size: 1rem;
  }
}
</style>
