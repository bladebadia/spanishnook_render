<template>
  <div class="legal-page q-pa-lg">
    <p class="text-primary text-bold text-center titulo-responsivo">Aviso Legal</p>
    <p class="text-primary text-bold texto-responsivo">Responsable de la web</p>
    <p class="text-left text-justify texto-responsivo">
      De conformidad con la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
      Información y Comercio Electrónico (LSSICE), se informa que la titularidad de este Sitio Web
      <span style="color: firebrick">www.spanishnook.com</span> corresponde a:
    </p>
    <ul class="lista-puntos texto-responsivo q-ml-xl">
      <li>Responsable/titular: Paula Fortes Esparza</li>
      <li>Nombre comercial: SpanishNook</li>
      <li>NIF: 77127036D</li>
      <li>Dirección: Barcelona, España</li>
      <li>Teléfono: +34 694280178</li>
      <li>Email: paulaf@spanishnook.com</li>
    </ul>
    <p class="q-pt-md text-primary text-bold texto-responsivo">Objeto</p>
    <p class="text-left text-justify texto-responsivo">
      La presente web tiene como finalidad ofrecer servicios de enseñanza de español online mediante
      clases en vivo y venta de productos relacionados.
    </p>
    <p class="q-pt-md text-bold text-primary texto-responsivo">Condiciones de uso</p>
    <p class="text-left text-justify texto-responsivo">
      El acceso, navegación y uso del Sitio Web atribuye la condición de Usuario, por lo que se
      aceptan, desde dicho acceso, todas las condiciones de uso aquí establecidas, sin perjuicio de
      la aplicación de la correspondiente normativa legal de obligado cumplimiento.
    </p>
    <p class="q-pt-md text-primary text-bold texto-responsivo">Limitación de responsabilidad</p>
    <p class="text-left texto-responsivo">
      La persona titular no se hace responsable de los daños que pudieran derivarse del mal uso de
      la web ni de enlaces externos a los que pueda redirigir.
    </p>
    <p class="q-pt-md text-primary text-bold texto-responsivo">
      Propiedad intelectual e industrial
    </p>
    <p class="text-left text-justify texto-responsivo">
      Todos los contenidos del Sitio Web, incluyendo textos, vídeos, imágenes, material didáctico,
      logotipos y diseño gráfico, son titularidad de SpanishNook o se dispone de los derechos
      necesarios para su uso, y están protegidos por la normativa de propiedad intelectual e
      industrial.
      <br />
      Queda prohibida la reproducción, distribución o comunicación pública de dichos contenidos sin
      la autorización expresa de la titular.
    </p>
  </div>
</template>

<script setup lang="ts">
import '../css/pages/EstilosGenerales.css';
</script>

<style scoped>
.legal-page {
  max-width: 85%;
  margin: 0 auto;
}

.lista-puntos {
  list-style-type: disc; /* Punto a la izquierda */
  padding-left: 2em; /* Espaciado a la izquierda */
  margin-top: 1em;
}

.lista-puntos li {
  margin-bottom: 0.5em; /* Espaciado entre elementos */
}

.titulo-responsivo {
  font-size: 2.8rem;
  margin-bottom: 2rem;
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
  margin-bottom: 1.3rem;
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
<style scoped></style>
>>>>>>> 97c1df76c594901bec37b9994dd63cb077d50c03
