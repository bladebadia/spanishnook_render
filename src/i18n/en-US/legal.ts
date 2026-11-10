/**
 * Textos legales (aviso legal, privacidad, cookies y condiciones) en inglés.
 *
 * Van en un módulo aparte y no en los mensajes de vue-i18n porque son textos largos con
 * caracteres que el compilador de mensajes interpreta (@ en los emails, llaves, barras).
 * Este archivo define el tipo; la versión española (es-ES/legal.ts) debe cumplirlo.
 * Formato: "**texto**" se muestra en negrita.
 */

export interface SeccionLegal {
  titulo: string;
  /** Título de apartado dentro de una sección (más pequeño). */
  subtitulo?: boolean;
  parrafos?: string[];
  lista?: string[];
  /** Párrafos después de la lista. */
  despues?: string[];
}

export interface PaginaLegalTexto {
  titulo: string;
  metaTitulo: string;
  metaDescripcion: string;
  actualizado?: string;
  intro?: string[];
  secciones: SeccionLegal[];
}

export interface TextosLegales {
  /** Aviso de que la versión en inglés es una traducción (vacío en español). */
  avisoTraduccion: string;
  aviso: PaginaLegalTexto;
  privacidad: PaginaLegalTexto;
  cookies: PaginaLegalTexto;
  condiciones: PaginaLegalTexto;
}

const legal: TextosLegales = {
  avisoTraduccion:
    'This English version is provided for convenience. If there is any discrepancy, the Spanish version prevails.',

  aviso: {
    titulo: 'Legal Notice',
    metaTitulo: 'Legal Notice | SpanishNook',
    metaDescripcion:
      'Legal notice of SpanishNook: website owner, contact details and terms of use of www.spanishnook.com.',
    secciones: [
      {
        titulo: 'Website owner',
        parrafos: [
          'In accordance with Spanish Law 34/2002 of 11 July on Information Society Services and Electronic Commerce (LSSICE), the website www.spanishnook.com is owned by:',
        ],
        lista: [
          'Owner: Paula Fortes Esparza',
          'Trade name: SpanishNook',
          'Tax ID (NIF): 77127036D',
          'Address: Barcelona, Spain',
          'Phone: +34 694280178',
          'Email: info@spanishnook.com',
        ],
      },
      {
        titulo: 'Purpose',
        parrafos: [
          'The purpose of this website is to offer online Spanish teaching services through live classes and the sale of related products.',
        ],
      },
      {
        titulo: 'Terms of use',
        parrafos: [
          'Accessing, browsing and using the website makes you a User, and from that moment you accept all the terms of use set out here, without prejudice to any mandatory legislation.',
        ],
      },
      {
        titulo: 'Limitation of liability',
        parrafos: [
          'The owner is not responsible for any damage resulting from misuse of the website or from external links it may redirect to.',
        ],
      },
      {
        titulo: 'Intellectual and industrial property',
        parrafos: [
          'All website content, including texts, videos, images, teaching materials, logos and graphic design, belongs to SpanishNook or is used with the necessary rights, and is protected by intellectual and industrial property law.',
          'Reproducing, distributing or publicly communicating this content without the express permission of the owner is prohibited.',
        ],
      },
    ],
  },

  privacidad: {
    titulo: 'Privacy Policy',
    metaTitulo: 'Privacy Policy | SpanishNook',
    metaDescripcion:
      'SpanishNook privacy policy: how we process your personal data, which providers we use and your rights.',
    actualizado: 'Last updated: 10 November 2026',
    secciones: [
      {
        titulo: 'I. Privacy and data protection policy',
        parrafos: [
          'In accordance with current legislation, SpanishNook undertakes to adopt the technical and organisational measures appropriate to the risk of the data collected.',
          'This privacy policy is adapted to the Spanish and European data protection rules that apply on the internet. In particular, it complies with:',
        ],
        lista: [
          'Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data (General Data Protection Regulation, GDPR).',
          'Spanish Organic Law 3/2018 of 5 December on the Protection of Personal Data and the Guarantee of Digital Rights (LOPD-GDD).',
          'Spanish Law 34/2002 of 11 July on Information Society Services and Electronic Commerce (LSSI-CE).',
        ],
      },
      {
        titulo: 'Data controller',
        subtitulo: true,
        parrafos: [
          'The controller of the personal data collected on this website is Paula Fortes Esparza, Tax ID (NIF) 77127036D (hereinafter, the Controller).',
        ],
        lista: ['Address: Barcelona, Spain', 'Phone: +34 694280178', 'Email: info@spanishnook.com'],
      },
      {
        titulo: 'Record of personal data',
        subtitulo: true,
        parrafos: [
          'In accordance with the GDPR and the LOPD-GDD, the personal data collected by SpanishNook through the forms on its pages will be processed in order to provide and manage the services contracted by the User, maintain the relationship established through those forms, or answer a request or query. A record of processing activities is kept, as required by the GDPR, unless the exception in article 30.5 of the GDPR applies.',
        ],
      },
      {
        titulo: 'Principles applicable to the processing of personal data',
        subtitulo: true,
        parrafos: [
          "The User's personal data will be processed according to the principles in article 5 of the GDPR and article 4 onwards of Spanish Organic Law 3/2018 of 5 December.",
        ],
      },
      {
        titulo: 'Categories of personal data',
        subtitulo: true,
        parrafos: [
          'The data processed are identification data, contact data and, where applicable, the data needed to manage payments and give access to the services offered. No special categories of personal data within the meaning of article 9 of the GDPR are processed.',
        ],
      },
      {
        titulo: 'Legal basis for processing',
        subtitulo: true,
        parrafos: [
          "The legal basis for processing personal data is the User's consent, the performance of a contract or pre-contractual measures, and compliance with applicable legal obligations. SpanishNook will ask for the User's express consent whenever it is required, especially for sending commercial or informational communications.",
          'The User may withdraw consent at any time, as easily as it was given, without affecting the lawfulness of processing carried out before the withdrawal. When processing is necessary to perform a contract or provide the services offered, withdrawing consent will not affect the continuity of the contracted service. Forms indicate which fields are mandatory because they are essential to manage the request or provide the service.',
        ],
      },
      {
        titulo: 'Purposes of processing',
        subtitulo: true,
        lista: [
          'Creating and managing user accounts.',
          'Giving access to live classes and courses.',
          'Managing payments through secure external platforms (Stripe).',
          'Administrative and support communication.',
        ],
        despues: [
          "Data may also be used for personalisation, operational and statistical purposes and for SpanishNook's own business activities, including storage and marketing studies to adapt the content offered to the User and to improve the quality, operation and navigation of the website.",
        ],
      },
      {
        titulo: 'Retention periods',
        subtitulo: true,
        parrafos: [
          'Personal data are kept only for the minimum time needed for the purposes of processing or until the User asks for them to be deleted. Users can delete their account at any time from their personal area; this deletes their data, except what must be kept by law (for example, invoicing data).',
        ],
      },
      {
        titulo: 'Recipients of personal data',
        subtitulo: true,
        parrafos: [
          'Data are not disclosed to third parties unless there is a legal obligation. To provide the service, SpanishNook uses the following providers, which act as data processors:',
        ],
        lista: [
          'Supabase: hosting of user accounts and the database (servers in the European Union, Paris).',
          'Vercel: hosting of the website.',
          'Stripe: payment processing. SpanishNook never has access to full card details.',
          'Google: sign-in with a Google account; Google Calendar and Google Meet for classes (your email may appear in the class invitation); Google Analytics, only if you accept analytics cookies.',
          'Resend: sending emails (booking confirmations, notices and account messages).',
        ],
        despues: [
          'Some of these providers may be located outside the European Economic Area. In all cases the appropriate safeguards under the GDPR apply (adequacy decisions or standard contractual clauses).',
        ],
      },
      {
        titulo: 'Data received from Google',
        subtitulo: true,
        parrafos: [
          'If you sign in with Google, we only receive your name, email address and profile picture. We use them solely to create your account, identify you when you sign in and contact you about your classes. We do not use them for advertising, we do not sell them and we do not share them with third parties other than the providers listed above. You can revoke access at any time from your Google account settings, and delete your SpanishNook account from your personal area.',
          "SpanishNook's use of information received from Google APIs complies with the Google API Services User Data Policy, including the Limited Use requirements.",
        ],
      },
      {
        titulo: 'Confidentiality and security of personal data',
        subtitulo: true,
        parrafos: [
          'The website uses an SSL certificate, so personal data are transmitted securely and confidentially: all transmission between the server and the User is encrypted.',
          'However, as the internet cannot be guaranteed to be impregnable, the Controller undertakes to inform the User without delay if a personal data breach occurs that is likely to result in a high risk to the rights and freedoms of natural persons.',
        ],
      },
      {
        titulo: 'Links to third-party websites',
        subtitulo: true,
        parrafos: [
          'The website may include links to third-party websites not operated by SpanishNook. Their owners have their own data protection policies and are responsible for their own files and privacy practices.',
        ],
      },
      {
        titulo: 'User rights',
        subtitulo: true,
        parrafos: [
          'The User may exercise at any time the rights of access, rectification, erasure, restriction, portability and objection by writing to info@spanishnook.com. If you consider that your rights have not been properly handled, you can lodge a complaint with the Spanish Data Protection Agency (AEPD: https://www.aepd.es/).',
        ],
      },
      {
        titulo: 'II. Acceptance and changes to the privacy policy',
        parrafos: [
          'The Controller reserves the right to modify this Privacy Policy at its own discretion or because of changes in legislation, case law or the doctrine of the Spanish Data Protection Agency. Changes or updates will not be notified explicitly to the User.',
          'Users are advised to check this page regularly to stay informed of the latest changes. This Privacy Policy has been adapted to the GDPR and to Spanish Organic Law 3/2018 of 5 December.',
        ],
      },
    ],
  },

  cookies: {
    titulo: 'Cookie Policy',
    metaTitulo: 'Cookie Policy | SpanishNook',
    metaDescripcion:
      'SpanishNook cookie policy: which cookies we use, what for and how to manage them.',
    intro: ['This page explains clearly how cookies are used on the website www.spanishnook.com.'],
    secciones: [
      {
        titulo: 'What cookies are',
        parrafos: [
          "Accessing this website may involve the use of cookies. Cookies are small files stored in the User's browser, on each device used to browse, that allow the website to remember certain information about the visit, such as preferences or technical data, in order to improve the browsing experience. Cookies do not harm the User's device or give access to personal information stored on it.",
        ],
      },
      {
        titulo: 'Types of cookies used',
        parrafos: ['This website uses the following types of cookies:'],
        lista: [
          'Technical or necessary cookies: they allow browsing the website and using its options and services, such as keeping your session open or remembering your class basket. They are necessary for the website to work and do not require the User’s consent.',
          'Preference cookies: they remember general settings such as the language you have chosen.',
          'Analytics cookies (Google Analytics): they measure activity on the website so it can be improved. They are only installed if the User accepts them in the cookie notice.',
        ],
      },
      {
        titulo: 'Consent to the use of cookies',
        parrafos: [
          'Cookies that can identify a person are considered personal data. Non-necessary cookies require the User’s prior consent, which is requested through a notice when accessing the website. The User can accept or reject them at any time.',
        ],
      },
      {
        titulo: 'How to disable or delete cookies',
        parrafos: [
          'The User can disable, reject or delete the cookies installed on their device through the settings of their browser (for example Chrome, Firefox, Safari or Edge).',
          'Disabling some cookies may affect how the website works.',
        ],
      },
    ],
  },

  condiciones: {
    titulo: 'Terms and Conditions',
    metaTitulo: 'Terms and Conditions | SpanishNook',
    metaDescripcion:
      'Terms and conditions for the online Spanish classes and courses of SpanishNook.',
    actualizado: 'Last updated: 2 January 2026',
    secciones: [
      {
        titulo: 'General information',
        parrafos: [
          'This document sets out the terms and conditions for contracting the services offered through www.spanishnook.com (the "Website"), owned by SpanishNook. The owner’s identification and contact details are available in the Legal Notice. Accessing, browsing and contracting services through the Website makes you a User (the "User") and implies full acceptance of these Terms and Conditions.',
          'These Terms may be modified. The User is responsible for checking them each time they access, browse or use the Website, as the terms in force at the time of purchasing products or services will apply. For any question about these Terms and Conditions, the User can contact the owner.',
        ],
      },
      {
        titulo: 'Purpose',
        parrafos: [
          'These terms govern the contracting of online educational services offered by SpanishNook, including among others:',
        ],
        lista: [
          'Private or one-to-one online classes.',
          'Conversation classes.',
          'Online courses or training programmes.',
        ],
      },
      {
        titulo: 'User requirements',
        parrafos: [
          'The User declares to be over 18 years old and to have sufficient legal capacity to contract the services offered, and is responsible for making good use of the Website.',
          'The User undertakes to provide truthful, up-to-date and complete information during the purchase process.',
        ],
      },
      {
        titulo: 'Purchase process',
        parrafos: [
          'Services are contracted through the Website by selecting the service and completing the payment. Once the payment is completed, the User will receive a confirmation by email.',
          'In some cases, access to the service or the scheduling of classes may be confirmed manually after the payment has been verified. Contracting implies express acceptance of these Terms and Conditions.',
        ],
      },
      {
        titulo: 'Prices and payment',
        parrafos: [
          'All prices on the Website are in euros (€) and include applicable taxes. Payment is made mainly through the secure Stripe payment gateway. SpanishNook does not store bank or credit card details.',
          'Exceptionally, and by prior agreement, payments may be accepted through other methods such as bank transfer, Bizum or Revolut. In those cases the same purchase, cancellation and refund terms apply.',
        ],
      },
      {
        titulo: 'Types of services and specific conditions',
      },
      {
        titulo: 'Subscription services',
        subtitulo: true,
        parrafos: ['Some SpanishNook services are offered as a recurring subscription.'],
        lista: [
          'The subscription is charged on a recurring basis according to the selected period.',
          'The User can cancel the subscription at any time to stop its automatic renewal.',
          'Cancelling does not entitle the User to a refund of amounts for a period that has already started.',
          'If the User does not attend a class or service within an active subscription, no refund or credit will be given for that unused class or service.',
          'Access to the service remains active until the end of the contracted period.',
        ],
      },
      {
        titulo: 'Private or one-to-one classes',
        subtitulo: true,
        parrafos: [
          'Private classes are personalised services booked for a specific User on a specific date and time.',
          'Because they are personalised, specific cancellation and withdrawal conditions apply, as detailed below.',
        ],
      },
      {
        titulo: 'Right of withdrawal',
        parrafos: [
          'In accordance with consumer legislation, the User has 14 calendar days from contracting the service to exercise the right of withdrawal, **only when the service has not started and is not linked to a specific date, time or period**. The right of withdrawal **does not apply in the following cases:**',
        ],
        lista: [
          'Private classes or personalised services with a confirmed date and time.',
          'Services that have started with the User’s express consent.',
          'Subscription services once the contracted period has started.',
        ],
        despues: [
          'For private classes or personalised services, the User acknowledges and accepts that, **by confirming the booking of a date and time**, the service is considered to have started for legal purposes, so **the right of withdrawal does not apply**.',
        ],
      },
      {
        titulo: 'Cancellations, refunds and credit system',
      },
      {
        titulo: 'Subscriptions',
        subtitulo: true,
        lista: [
          'No refunds are given for subscription periods that have already started.',
          'The User can cancel the automatic renewal of the subscription at any time.',
          'The cancellation takes effect at the end of the current period.',
        ],
      },
      {
        titulo: 'Private or one-to-one classes',
        subtitulo: true,
        parrafos: [
          'Private classes are personalised services booked for a specific User, so the following cancellation conditions apply:',
        ],
        lista: [
          'If the User cancels the class at least 24 hours in advance, they can receive an equivalent credit to use for future classes or services, or change the date.',
          'Cancellations made less than 24 hours in advance, and not attending the class, will count as a class given, with no right to credit or compensation (except for justified reasons).',
        ],
      },
      {
        titulo: 'Credits and exceptions',
        parrafos: [
          'As a general rule, **no automatic monetary refunds are made** once the service has started. In certain justified cases (force majeure, serious technical problems or other duly proven circumstances), SpanishNook may:',
        ],
        lista: [
          'Grant a credit for the corresponding amount, to be used for other services.',
          'Make a full or partial refund, processed manually.',
        ],
        despues: [
          'These exceptions will be assessed individually and must be requested in writing.',
        ],
      },
      {
        titulo: 'How to make a request',
        parrafos: [
          'Requests for cancellation, changes, credit or refunds must be sent by email and include at least:',
        ],
        lista: [
          'Full name',
          'Email address used for the purchase',
          'Service purchased',
          'Date of the affected class(es) or period(s)',
          'Reason for the request',
        ],
        despues: ['SpanishNook may ask for additional documentation in justified cases.'],
      },
      {
        titulo: 'Liability',
        parrafos: [
          'SpanishNook does not guarantee specific learning results, as these depend on the User’s effort, dedication and personal circumstances. Nor will it be responsible for:',
        ],
        lista: [
          'Third-party technical failures (external platforms, internet connection, third-party software).',
          'Incidents caused by force majeure.',
          'Misuse of the content by the User.',
        ],
      },
      {
        titulo: 'Intellectual property',
        parrafos: [
          'All materials provided by SpanishNook are for the User’s personal and educational use. Reproducing, distributing or exploiting them without express permission is prohibited.',
        ],
      },
      {
        titulo: 'Changes to these terms',
        parrafos: [
          'SpanishNook reserves the right to modify these Terms and Conditions at any time. Changes take effect from the date they are published on the Website.',
        ],
      },
      {
        titulo: 'Applicable law and jurisdiction',
        parrafos: [
          'These terms are governed by Spanish law.',
          'In the event of a dispute, the parties submit to the Spanish courts, without prejudice to the rights of the User as a consumer.',
        ],
      },
      {
        titulo: 'Acceptance of the terms and conditions',
        parrafos: [
          'Contracting any of the services offered on the Website implies having read, understood and expressly accepted these Terms and Conditions. The User is advised to keep a copy of this document.',
          'The User declares that they have read and understood these terms before completing the purchase.',
        ],
      },
    ],
  },
};

export default legal;
