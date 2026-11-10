/**
 * Textos legales en español (versión que prevalece). El tipo está en en-US/legal.ts.
 * Formato: "**texto**" se muestra en negrita.
 */
import type { TextosLegales } from '../en-US/legal';

const legal: TextosLegales = {
  avisoTraduccion: '',

  aviso: {
    titulo: 'Aviso legal',
    metaTitulo: 'Aviso Legal | SpanishNook',
    metaDescripcion:
      'Aviso legal de SpanishNook. Información sobre la titularidad del sitio web, datos de contacto y condiciones de uso de www.spanishnook.com.',
    secciones: [
      {
        titulo: 'Responsable de la web',
        parrafos: [
          'De conformidad con la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE), se informa que la titularidad de este Sitio Web www.spanishnook.com corresponde a:',
        ],
        lista: [
          'Responsable/titular: Paula Fortes Esparza',
          'Nombre comercial: SpanishNook',
          'NIF: 77127036D',
          'Dirección: Barcelona, España',
          'Teléfono: +34 694280178',
          'Email: info@spanishnook.com',
        ],
      },
      {
        titulo: 'Objeto',
        parrafos: [
          'La presente web tiene como finalidad ofrecer servicios de enseñanza de español online mediante clases en vivo y venta de productos relacionados.',
        ],
      },
      {
        titulo: 'Condiciones de uso',
        parrafos: [
          'El acceso, navegación y uso del Sitio Web atribuye la condición de Usuario, por lo que se aceptan, desde dicho acceso, todas las condiciones de uso aquí establecidas, sin perjuicio de la aplicación de la correspondiente normativa legal de obligado cumplimiento.',
        ],
      },
      {
        titulo: 'Limitación de responsabilidad',
        parrafos: [
          'La persona titular no se hace responsable de los daños que pudieran derivarse del mal uso de la web ni de enlaces externos a los que pueda redirigir.',
        ],
      },
      {
        titulo: 'Propiedad intelectual e industrial',
        parrafos: [
          'Todos los contenidos del Sitio Web, incluyendo textos, vídeos, imágenes, material didáctico, logotipos y diseño gráfico, son titularidad de SpanishNook o se dispone de los derechos necesarios para su uso, y están protegidos por la normativa de propiedad intelectual e industrial.',
          'Queda prohibida la reproducción, distribución o comunicación pública de dichos contenidos sin la autorización expresa de la titular.',
        ],
      },
    ],
  },

  privacidad: {
    titulo: 'Política de privacidad',
    metaTitulo: 'Política de Privacidad | SpanishNook',
    metaDescripcion:
      'Política de privacidad de SpanishNook. Cómo tratamos tus datos personales, qué proveedores usamos y cuáles son tus derechos.',
    actualizado: 'Última actualización: 10 de noviembre de 2026',
    secciones: [
      {
        titulo: 'I. Política de privacidad y protección de datos',
        parrafos: [
          'Respetando lo establecido en la legislación vigente, SpanishNook se compromete a adoptar las medidas técnicas y organizativas necesarias, según el nivel de seguridad adecuado al riesgo de los datos recogidos.',
          'Esta política de privacidad está adaptada a la normativa española y europea vigente en materia de protección de datos personales en internet. En concreto, respeta las siguientes normas:',
        ],
        lista: [
          'El Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (Reglamento General de Protección de Datos, RGPD).',
          'La Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD).',
          'La Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).',
        ],
      },
      {
        titulo: 'Identidad del responsable del tratamiento',
        subtitulo: true,
        parrafos: [
          'La responsable del tratamiento de los datos personales recogidos en este Sitio Web es Paula Fortes Esparza, con NIF 77127036D (en adelante, Responsable del tratamiento). Sus datos de contacto son:',
        ],
        lista: [
          'Dirección: Barcelona, España',
          'Teléfono de contacto: +34 694280178',
          'Email de contacto: info@spanishnook.com',
        ],
      },
      {
        titulo: 'Registro de datos de carácter personal',
        subtitulo: true,
        parrafos: [
          'En cumplimiento de lo establecido en el RGPD y la LOPD-GDD, le informamos que los datos personales recabados por SpanishNook mediante los formularios de sus páginas serán tratados con el fin de facilitar, agilizar y cumplir los compromisos establecidos entre SpanishNook y el Usuario, mantener la relación que se establezca en los formularios que este rellene o atender una solicitud o consulta del mismo. Asimismo, de conformidad con el RGPD y la LOPD-GDD, salvo que sea de aplicación la excepción prevista en el artículo 30.5 del RGPD, se mantiene un registro de actividades de tratamiento que especifica, según sus finalidades, las actividades de tratamiento llevadas a cabo y las demás circunstancias establecidas en el RGPD.',
        ],
      },
      {
        titulo: 'Principios aplicables al tratamiento de los datos personales',
        subtitulo: true,
        parrafos: [
          'El tratamiento de los datos personales del Usuario se someterá a los principios recogidos en el artículo 5 del RGPD y en el artículo 4 y siguientes de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales.',
        ],
      },
      {
        titulo: 'Categorías de datos personales',
        subtitulo: true,
        parrafos: [
          'Las categorías de datos que se tratan son datos identificativos, de contacto y, en su caso, datos necesarios para la gestión de pagos y el acceso a los servicios ofrecidos. En ningún caso se tratan categorías especiales de datos personales en el sentido del artículo 9 del RGPD.',
        ],
      },
      {
        titulo: 'Base legal para el tratamiento de los datos personales',
        subtitulo: true,
        parrafos: [
          'La base legal para el tratamiento de los datos personales es el consentimiento del Usuario, la ejecución de un contrato o la aplicación de medidas precontractuales, así como el cumplimiento de obligaciones legales aplicables. SpanishNook recabará el consentimiento expreso del Usuario cuando este sea necesario, especialmente para el envío de comunicaciones comerciales o informativas.',
          'El Usuario podrá retirar su consentimiento en cualquier momento, siendo tan fácil retirarlo como otorgarlo, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada. En los casos en los que el tratamiento de datos sea necesario para la ejecución de un contrato o para la prestación de los servicios ofrecidos, la retirada del consentimiento no afectará a la continuidad del servicio contratado. Cuando el Usuario deba facilitar sus datos personales a través de formularios para realizar consultas, solicitar información o contratar servicios, se le informará de si la cumplimentación de determinados campos es obligatoria, por ser imprescindibles para la correcta gestión de la solicitud o prestación del servicio.',
        ],
      },
      {
        titulo: 'Finalidad del tratamiento de los datos personales',
        subtitulo: true,
        lista: [
          'Gestionar la creación de cuentas de usuario.',
          'Facilitar el acceso a clases en vivo y cursos.',
          'Gestionar pagos a través de plataformas externas seguras (Stripe).',
          'Mantener comunicación administrativa y de soporte.',
        ],
        despues: [
          'Igualmente, los datos podrán ser utilizados con una finalidad comercial de personalización, operativa y estadística, y actividades propias del objeto social de SpanishNook, así como para la extracción, almacenamiento de datos y estudios de marketing para adecuar el Contenido ofertado al Usuario y la mejora de la calidad, funcionamiento y navegación por el Sitio Web.',
        ],
      },
      {
        titulo: 'Períodos de retención de los datos personales',
        subtitulo: true,
        parrafos: [
          'Los datos personales solo serán retenidos durante el tiempo mínimo necesario para los fines de su tratamiento o hasta que el Usuario solicite su supresión. El Usuario puede eliminar su cuenta en cualquier momento desde su área personal; con ello se borran sus datos, salvo los que deban conservarse por obligación legal (por ejemplo, los de facturación).',
        ],
      },
      {
        titulo: 'Destinatarios de los datos personales',
        subtitulo: true,
        parrafos: [
          'Los datos no se ceden a terceros salvo obligación legal. Para prestar el servicio, SpanishNook utiliza los siguientes proveedores, que actúan como encargados del tratamiento:',
        ],
        lista: [
          'Supabase: alojamiento de las cuentas de usuario y de la base de datos (servidores en la Unión Europea, París).',
          'Vercel: alojamiento de la web.',
          'Stripe: gestión de los pagos. SpanishNook no tiene acceso a los datos completos de las tarjetas.',
          'Google: inicio de sesión con cuenta de Google; Google Calendar y Google Meet para las clases (tu email puede aparecer en la invitación de la clase); Google Analytics, solo si aceptas las cookies de análisis.',
          'Resend: envío de correos electrónicos (confirmaciones de reserva, avisos y mensajes de la cuenta).',
        ],
        despues: [
          'Algunos de estos proveedores pueden estar ubicados fuera del Espacio Económico Europeo, aplicándose en todo caso las garantías adecuadas conforme al RGPD (decisiones de adecuación o cláusulas contractuales tipo).',
        ],
      },
      {
        titulo: 'Datos recibidos de Google',
        subtitulo: true,
        parrafos: [
          'Si inicias sesión con Google, solo recibimos tu nombre, tu dirección de email y tu foto de perfil. Los usamos únicamente para crear tu cuenta, identificarte al entrar y comunicarnos contigo sobre tus clases. No los usamos para publicidad, no los vendemos y no los compartimos con terceros distintos de los proveedores indicados arriba. Puedes retirar el acceso en cualquier momento desde la configuración de tu cuenta de Google y eliminar tu cuenta de SpanishNook desde tu área personal.',
          'El uso que SpanishNook hace de la información recibida de las API de Google cumple la Política de datos de usuario de los servicios de API de Google (Google API Services User Data Policy), incluidos los requisitos de uso limitado.',
        ],
      },
      {
        titulo: 'Secreto y seguridad de los datos personales',
        subtitulo: true,
        parrafos: [
          'El Sitio Web cuenta con un certificado SSL (Secure Socket Layer), que asegura que los datos personales se transmiten de forma segura y confidencial, al ser la transmisión de los datos entre el servidor y el Usuario, y en retroalimentación, totalmente cifrada o encriptada.',
          'Sin embargo, debido a que no puede garantizar la inexpugnabilidad de internet ni la ausencia total de hackers u otros que accedan de modo fraudulento a los datos personales, el Responsable del tratamiento se compromete a comunicar al Usuario sin dilación si se diera el caso de que ocurriera una violación de la seguridad de los datos personales que entrañe un alto riesgo para los derechos y libertades de las personas físicas.',
        ],
      },
      {
        titulo: 'Enlaces a sitios web de terceros',
        subtitulo: true,
        parrafos: [
          'El Sitio Web puede incluir hipervínculos o enlaces que permiten acceder a páginas web de terceros distintos de SpanishNook, y que por tanto no son operados por este. Los titulares de dichos sitios web dispondrán de sus propias políticas de protección de datos, siendo ellos mismos, en cada caso, responsables de los ficheros y prácticas de privacidad.',
        ],
      },
      {
        titulo: 'Derechos del Usuario',
        subtitulo: true,
        parrafos: [
          'El Usuario podrá ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición enviando un correo a info@spanishnook.com. Si considera que no se han atendido correctamente sus derechos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD: https://www.aepd.es/).',
        ],
      },
      {
        titulo: 'II. Aceptación y cambios en la política de privacidad',
        parrafos: [
          'Se reserva el derecho a modificar la Política de Privacidad, de acuerdo al propio criterio del Sitio Web, o motivado por un cambio legislativo, jurisprudencial o doctrinal de la Agencia Española de Protección de Datos. Los cambios o actualizaciones de esta Política de Privacidad no serán notificados de forma explícita al Usuario.',
          'Se recomienda al Usuario consultar esta página de forma periódica para estar al tanto de los últimos cambios o actualizaciones. Esta Política de Privacidad fue actualizada para adaptarse al Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD), y a la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales.',
        ],
      },
    ],
  },

  cookies: {
    titulo: 'Política de cookies',
    metaTitulo: 'Política de Cookies | SpanishNook',
    metaDescripcion:
      'Política de cookies de SpanishNook. Información sobre las cookies que utilizamos, su finalidad y cómo gestionarlas.',
    intro: [
      'En esta página se informa de manera clara y accesible sobre el uso de cookies en el Sitio Web www.spanishnook.com.',
    ],
    secciones: [
      {
        titulo: 'Qué son las cookies',
        parrafos: [
          'El acceso a este Sitio Web puede implicar la utilización de cookies. Las cookies son pequeños archivos de información que se almacenan en el navegador del Usuario —en los distintos dispositivos que pueda utilizar para navegar— y que permiten al Sitio Web recordar cierta información sobre su visita, como sus preferencias o datos técnicos, con el fin de mejorar su experiencia de navegación. Las cookies no dañan el dispositivo del Usuario ni permiten acceder a información personal almacenada en el mismo.',
        ],
      },
      {
        titulo: 'Tipos de cookies utilizadas',
        parrafos: ['En este Sitio Web se utilizan los siguientes tipos de cookies:'],
        lista: [
          'Cookies técnicas o necesarias: permiten la navegación a través del sitio web y el uso de sus diferentes opciones o servicios, como mantener la sesión iniciada o recordar el carrito de clases. Son necesarias para el correcto funcionamiento del Sitio Web y no requieren el consentimiento del Usuario.',
          'Cookies de personalización: permiten recordar características de carácter general, como el idioma que has elegido.',
          'Cookies de análisis (Google Analytics): permiten medir la actividad en el Sitio Web para mejorar su funcionamiento. Solo se instalan si el Usuario las acepta en el aviso de cookies.',
        ],
      },
      {
        titulo: 'Consentimiento para el uso de cookies',
        parrafos: [
          'Las cookies que permiten identificar a una persona se consideran datos personales. Para la utilización de cookies no necesarias será necesario el consentimiento previo del Usuario, que se solicitará mediante un aviso al acceder al Sitio Web. El Usuario podrá aceptarlas o rechazarlas en cualquier momento.',
        ],
      },
      {
        titulo: 'Cómo deshabilitar o eliminar cookies',
        parrafos: [
          'El Usuario puede deshabilitar, rechazar o eliminar las cookies instaladas en su dispositivo mediante la configuración de las opciones del navegador que esté utilizando (por ejemplo, Chrome, Firefox, Safari o Edge).',
          'La desactivación de algunas cookies puede afectar al correcto funcionamiento del Sitio Web.',
        ],
      },
    ],
  },

  condiciones: {
    titulo: 'Términos y condiciones',
    metaTitulo: 'Términos y Condiciones | SpanishNook',
    metaDescripcion:
      'Términos y condiciones de contratación de los servicios educativos online de SpanishNook.',
    actualizado: 'Fecha de última actualización: 2 de enero de 2026',
    secciones: [
      {
        titulo: 'Información general',
        parrafos: [
          'El presente documento regula los términos y condiciones de contratación de los servicios ofrecidos a través de www.spanishnook.com (en adelante, el “Sitio Web”), titularidad de SpanishNook. Los datos identificativos y de contacto del titular se encuentran disponibles en el Aviso Legal del Sitio Web. El acceso, navegación y contratación de servicios a través del Sitio Web atribuye la Condición de Usuario (en adelante, el “Usuario”) e implica la aceptación plena y sin reservas de los presentes Términos y Condiciones.',
          'Asimismo, se informa que estas Condiciones podrían ser modificadas. El Usuario es responsable de consultarlas cada vez que acceda, navegue y/o use el Sitio Web ya que serán aplicables aquellas que se encuentren vigentes en el momento en que se solicite la adquisición de productos y/o servicios. Para todas las preguntas que el Usuario pueda tener en relación con los Términos y Condiciones puede ponerse en contacto con el titular.',
        ],
      },
      {
        titulo: 'Objeto',
        parrafos: [
          'Las presentes condiciones regulan la contratación de servicios educativos online ofrecidos por SpanishNook, que incluyen, entre otros, los siguientes:',
        ],
        lista: [
          'Clases privadas o individuales online.',
          'Clases de conversación.',
          'Cursos o programas formativos online.',
        ],
      },
      {
        titulo: 'Requisitos del usuario',
        parrafos: [
          'El Usuario declara ser mayor de 18 años y tener capacidad legal suficiente para contratar los servicios ofrecidos y asume la responsabilidad del buen uso del Sitio Web.',
          'El Usuario se compromete a facilitar información veraz, actualizada y completa durante el proceso de contratación.',
        ],
      },
      {
        titulo: 'Proceso de contratación',
        parrafos: [
          'La contratación de los servicios se realiza a través del Sitio Web, mediante la selección del servicio correspondiente y la finalización del proceso de pago. Una vez completado el pago, el Usuario recibirá una confirmación por correo electrónico.',
          'En algunos casos, el acceso al servicio o la asignación de clases podrá confirmarse manualmente tras la verificación del pago. La contratación implica la aceptación expresa de estos Términos y Condiciones.',
        ],
      },
      {
        titulo: 'Precios y forma de pago',
        parrafos: [
          'Todos los precios indicados en el Sitio Web se expresan en euros (€) e incluyen los impuestos legalmente aplicables. El pago se realiza principalmente a través de la pasarela segura Stripe. SpanishNook no almacena datos bancarios ni de tarjetas de crédito.',
          'De forma excepcional y bajo acuerdo previo, podrán aceptarse pagos mediante otros métodos como transferencia bancaria, Bizum o Revolut. En estos casos, se aplicarán las mismas condiciones de contratación, cancelación y reembolso.',
        ],
      },
      {
        titulo: 'Tipos de servicios y condiciones específicas',
      },
      {
        titulo: 'Servicios por suscripción',
        subtitulo: true,
        parrafos: [
          'Algunos servicios de SpanishNook se ofrecen bajo modalidad de suscripción periódica.',
        ],
        lista: [
          'La suscripción se cobra de forma recurrente según el período seleccionado.',
          'El Usuario puede cancelar la suscripción en cualquier momento para evitar su renovación automática.',
          'La cancelación no da derecho al reembolso de los importes correspondientes al período ya iniciado.',
          'En el supuesto de no atender a una clase o servicio dentro de una suscripción activa, no se realizará reembolso ni crédito alguno por dicha clase o servicio no utilizado.',
          'El acceso al servicio se mantendrá activo hasta la finalización del período contratado.',
        ],
      },
      {
        titulo: 'Clases privadas o individuales',
        subtitulo: true,
        parrafos: [
          'Las clases privadas son servicios personalizados, reservados para un Usuario concreto en una fecha y hora determinadas.',
          'Debido a su carácter personalizado, se aplican condiciones específicas de cancelación y desistimiento, detalladas más adelante.',
        ],
      },
      {
        titulo: 'Derecho de desistimiento',
        parrafos: [
          'De conformidad con la normativa vigente en materia de consumidores y usuarios, el Usuario dispone de un plazo de 14 días naturales para ejercer su derecho de desistimiento desde la contratación del servicio, **únicamente en aquellos casos en los que el servicio no haya comenzado a prestarse y no esté vinculado a una fecha, hora o período determinado**. El derecho de desistimiento **no será aplicable en los siguientes supuestos:**',
        ],
        lista: [
          'Clases privadas o servicios personalizados con fecha y hora confirmadas.',
          'Servicios que hayan comenzado a prestarse con el consentimiento expreso del Usuario.',
          'Servicios de suscripción una vez iniciado el período contratado.',
        ],
        despues: [
          'En el caso de clases privadas o servicios personalizados, el Usuario reconoce y acepta que, **al confirmar la reserva de una fecha y hora**, el servicio se considera iniciado a efectos legales, por lo que **no resulta aplicable el derecho de desistimiento**.',
        ],
      },
      {
        titulo: 'Cancelaciones, devoluciones y sistema de créditos',
      },
      {
        titulo: 'Suscripciones',
        subtitulo: true,
        lista: [
          'No se realizan reembolsos por períodos de suscripción ya iniciados.',
          'El Usuario puede cancelar la renovación automática de la suscripción en cualquier momento.',
          'La cancelación surtirá efecto al finalizar el período en curso.',
        ],
      },
      {
        titulo: 'Clases privadas o individuales',
        subtitulo: true,
        parrafos: [
          'Las clases privadas son servicios personalizados reservados para un Usuario concreto, por lo que se aplican las siguientes condiciones de cancelación:',
        ],
        lista: [
          'Si el Usuario cancela la clase con al menos 24 horas de antelación, podrá optar a un crédito equivalente, utilizable en futuras clases o servicios o bien, a realizar un cambio de fecha.',
          'Las cancelaciones realizadas con menos de 24 horas de antelación, así como la no asistencia a la clase, se considerarán como clase impartida, sin derecho a crédito ni compensación (salvo causas justificadas).',
        ],
      },
      {
        titulo: 'Créditos y excepciones',
        parrafos: [
          'Con carácter general, **no se realizan devoluciones monetarias automáticas** una vez iniciado el servicio. En determinados casos justificados (fuerza mayor, incidencias técnicas graves u otras circunstancias debidamente acreditadas), SpanishNook podrá:',
        ],
        lista: [
          'Conceder un crédito por el importe correspondiente, utilizable en otros servicios.',
          'Realizar un reembolso total o parcial, gestionado manualmente.',
        ],
        despues: [
          'Estas excepciones se valorarán individualmente y deberán ser solicitadas por escrito.',
        ],
      },
      {
        titulo: 'Procedimiento para solicitudes',
        parrafos: [
          'Las solicitudes de cancelación, cambio, crédito o reembolso deberán realizarse por correo electrónico e incluir, al menos:',
        ],
        lista: [
          'Nombre completo',
          'Correo electrónico utilizado en la compra',
          'Servicio contratado',
          'Fecha de la(s) clase(s) o período(s) afectado(s)',
          'Motivo de la solicitud',
        ],
        despues: ['SpanishNook podrá solicitar documentación adicional en casos justificados.'],
      },
      {
        titulo: 'Responsabilidad',
        parrafos: [
          'SpanishNook no garantiza resultados concretos de aprendizaje, ya que estos dependen del esfuerzo, dedicación y circunstancias personales del Usuario. Asimismo, no será responsable de:',
        ],
        lista: [
          'Fallos técnicos ajenos (plataformas externas, conexión a internet, software de terceros).',
          'Incidencias derivadas de causas de fuerza mayor.',
          'Uso indebido de los contenidos por parte del Usuario.',
        ],
      },
      {
        titulo: 'Propiedad intelectual',
        parrafos: [
          'Todos los materiales proporcionados por SpanishNook son para uso personal y educativo del Usuario. Queda prohibida su reproducción, distribución o explotación sin autorización expresa.',
        ],
      },
      {
        titulo: 'Modificación de las condiciones',
        parrafos: [
          'SpanishNook se reserva el derecho a modificar los presentes Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor desde la fecha de publicación en el Sitio Web.',
        ],
      },
      {
        titulo: 'Legislación aplicable y jurisdicción',
        parrafos: [
          'Las presentes condiciones se rigen por la legislación española.',
          'En caso de conflicto, las partes se someterán a los juzgados y tribunales españoles, sin perjuicio de los derechos que correspondan al Usuario como consumidor.',
        ],
      },
      {
        titulo: 'Aceptación de los términos y condiciones',
        parrafos: [
          'La contratación de cualquiera de los servicios ofrecidos en el Sitio Web implica la lectura, comprensión y aceptación expresa de los presentes Términos y Condiciones. Se recomienda al Usuario conservar una copia de este documento.',
          'El Usuario declara haber leído y comprendido estas condiciones antes de formalizar la contratación.',
        ],
      },
    ],
  },
};

export default legal;
