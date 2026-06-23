# Guía de Preparación para la Defensa - Proyecto UEPV

Esta guía ha sido diseñada para servirte como base conceptual y técnica durante tu defensa. Siguiendo las recomendaciones de tu tutor, la presentación se enfocará en ideas clave soportadas por gráficos, diagramas y demostraciones prácticas en lugar de bloques densos de texto.

---

## 1. Estructura de Diapositivas (Qué Mostrar y Qué Decir)

### Diapositiva 1: Introducción
*   **Apoyo Visual:** Logotipo del Colegio UEPV y título del proyecto.
*   **Texto sugerido (mínimo):** "Modernización del control de asistencia y comunicación académica mediante tecnología web, móvil y biométrica."
*   **Concepto a explicar con tus palabras:** 
    *   Presenta brevemente al colegio UEPV.
    *   Explica que en la actualidad, la seguridad estudiantil y la comunicación oportuna entre la institución y la familia son vitales.
    *   Este proyecto une la biometría (seguridad física) con la nube (accesibilidad inmediata).

### Diapositiva 2: Planteamiento del Problema
*   **Apoyo Visual:** Foto de un cuaderno de asistencia manual, carpetas apiladas o un flujo confuso en papel.
*   **Texto sugerido (mínimo):**
    *   Control manual propenso a errores.
    *   Retrasos y ausencias no notificados a tiempo.
    *   Licencias falsificables y falta de centralización.
*   **Concepto a explicar con tus palabras:**
    *   El método tradicional de registrar asistencia con lapicero quita tiempo valioso de clase y no avisa al padre si el alumno llegó o no.
    *   Las licencias (justificaciones) suelen ser notas de papel falsificables o llamadas telefónicas que no quedan registradas formalmente.

### Diapositiva 3: Objetivos
*   **Apoyo Visual:** Iconos de engranaje (sistema), huella digital (biometría), web (administración) y celular (padres).
*   **Texto sugerido (mínimo):**
    *   *General:* Automatizar la gestión de asistencia y centralizar la comunicación escolar.
    *   *Específicos:* Integrar biometría digital, desarrollar portal de administración web y proveer app móvil con alertas push en tiempo real.
*   **Concepto a explicar con tus palabras:**
    *   El objetivo no es solo digitalizar, sino crear un ecosistema donde el colegio registre la asistencia biométricamente y el padre de familia reciba esa información instantáneamente en su bolsillo.

### Diapositiva 4: Justificación
*   **Apoyo Visual:** Iconos de escudo/protección (social) y nube/tecnología (técnica).
*   **Texto sugerido (mínimo):**
    *   *Social:* Tranquilidad para padres y control para directivos.
    *   *Tecnológico:* Arquitectura híbrida (Cloud + Edge) y biometría escalable.
*   **Concepto a explicar con tus palabras:**
    *   *Social/Práctica:* Saber que un estudiante ingresó al colegio reduce la ansiedad de los padres.
    *   *Técnica:* Demostramos que es posible combinar procesamiento local de hardware con servicios globales en la nube de forma económica y segura.

### Diapositiva 5: Ingeniería de Proyecto - Arquitectura de Software
*   **Apoyo Visual:** El diagrama de la arquitectura híbrida (puedes usar el siguiente esquema mental o dibujarlo):
    *   `[Navegador/App Móvil]` <--> `[Vercel Serverless (Next.js)]` <--> `[Supabase (PostgreSQL Cloud)]`
    *   `[PC del Colegio]` <--> `[Lector DigitalPersona WebSocket]` <--> `[Microservicio local AFIS Python]`
*   **Texto sugerido (mínimo):**
    *   *Control centralizado:* Vercel & Supabase.
    *   *Procesamiento en el borde (Edge):* Lector de huellas y motor AFIS en Python local.
*   **Concepto a explicar con tus palabras:**
    *   Explica la arquitectura híbrida: la base de datos y la web están en la nube (Supabase y Vercel) para que sean accesibles desde cualquier lugar.
    *   Sin embargo, el lector físico de huellas y la comparación de plantillas biométricas (AFIS) se procesan en la computadora local del colegio. ¿Por qué? Por privacidad (las huellas no viajan por internet en bruto) y porque el lector físico necesita interactuar directamente con el hardware del PC.

### Diapositiva 6: Ingeniería de Proyecto - Flujo de Datos
*   **Apoyo Visual:** Diagrama secuencial de una asistencia:
    1.  Estudiante pone huella.
    2.  Lector captura y el script local de Python compara (AFIS).
    3.  Al haber coincidencia, se envía una petición segura a la API web.
    4.  La base de datos registra la asistencia.
    5.  Se dispara la notificación Firebase (FCM).
    6.  El teléfono del tutor vibra.
*   **Texto sugerido (mínimo):** "Flujo síncrono de verificación y notificación instantánea."
*   **Concepto a explicar con tus palabras:**
    *   Guía al jurado a través del flujo. Destaca que la notificación tarda apenas un par de segundos desde el instante en que el alumno pone el dedo en el sensor hasta que el celular del padre vibra.

### Diapositiva 7: Pruebas y Calidad
*   **Apoyo Visual:** Captura de pantalla de código compilando limpiamente o un escudo de seguridad.
*   **Texto sugerido (mínimo):**
    *   Seguridad: Protección contra fuerza bruta (bloqueo de cuentas).
    *   Robustez: Validaciones estrictas con Zod y tipado seguro con TypeScript.
    *   Integridad: Middleware de protección de rutas y endpoints APIs.
*   **Concepto a explicar con tus palabras:**
    *   Hemos blindado el sistema. Si alguien intenta adivinar una contraseña (fuerza bruta), la cuenta se bloquea por 15 minutos tras 5 intentos fallidos (tanto en web como en la app móvil).
    *   Usamos TypeScript y Zod en los formularios para garantizar que no entren datos basura a la base de datos (por ejemplo, números de teléfono inválidos o nombres con símbolos).

### Diapositiva 8: Conclusiones
*   **Apoyo Visual:** Icono de check verde grande o foto de un estudiante entrando sonriente al colegio.
*   **Texto sugerido (mínimo):**
    *   Viabilidad técnica de la biometría híbrida.
    *   Impacto directo en la comunicación familiar y escolar.
    *   Base sólida para futuras integraciones.
*   **Concepto a explicar con tus palabras:**
    *   Cumplimos todos los objetivos. El sistema es real, está desplegado y funciona.
    *   Demostramos que un colegio con recursos estándar puede implementar soluciones tecnológicas avanzadas sin costos prohibitivos de infraestructura.

---

## 2. Guión para la Demostración en Vivo (Live Demo)

Durante la demostración, mantén la calma y sigue este orden lógico para mostrar el sistema corriendo:

1.  **Paso 1: Portal Web (Admin/Docente)**
    *   Inicia sesión en la plataforma desplegada en Vercel.
    *   Muestra el Dashboard principal con el banner dinámico y resalta cómo cambia la vista dependiendo del rol del usuario.
    *   Entra a la sección de alumnos para mostrar que los datos están cargados en tiempo real desde Supabase.
2.  **Paso 2: Registro de Asistencia**
    *   *Si estás defendiendo en local con el lector:* Pide a alguien o haz tú mismo la prueba poniendo el dedo en el lector biométrico. Muestra cómo la pantalla del sistema local detecta y registra el ingreso.
    *   *Si estás defendiendo en producción pura:* Registra una asistencia de forma **manual** como Docente o Administrador (el sistema exige rol autorizado para esto).
3.  **Paso 3: Recepción Móvil (Tutor)**
    *   Muestra tu celular físico (proyectado por Scrcpy/Vysor) o el emulador de Android.
    *   Enseña al jurado la notificación push emergente que llegó en tiempo real diciendo *"Se registró asistencia para [Nombre del Estudiante]..."* con la fecha y hora correctas.
    *   Abre la app y entra al historial para ver la lista consolidada de asistencias.
4.  **Paso 4: Solicitud de Licencia**
    *   Desde la app móvil, crea una solicitud de licencia para el día de hoy con una justificación (ej: cita médica) y adjunta un archivo de prueba (imagen/pdf).
    *   Vuelve al portal Web del Administrador, ve a la bandeja de Licencias Pendientes y muestra cómo la solicitud aparece al instante.
    *   Prueba el flujo aprobando o rechazando la licencia y muestra cómo la app del tutor se actualiza visualmente.

---

## 3. Preguntas de Defensa Frecuentes y Cómo Responderlas

### Q1: ¿Por qué optaron por una arquitectura híbrida (Vercel en la nube + AFIS local) en lugar de subir todo a la nube?
*   **Respuesta Clave:** *"Por dos razones fundamentales: limitación física del hardware y privacidad de datos. El lector biométrico USB requiere acceso directo a los puertos e interfaces del sistema operativo local (no puede comunicarse con un servidor en la nube directamente a través de una página web estándar por restricciones de seguridad del navegador). Además, procesar las huellas dactilares a nivel local (Edge Computing) garantiza que las plantillas biométricas confidenciales de los estudiantes nunca viajen expuestas por internet, cumpliendo con políticas de privacidad de datos."*

### Q2: Si la conexión a internet del colegio se cae, ¿el lector de huellas sigue funcionando?
*   **Respuesta Clave:** *"El microservicio de lectura y reconocimiento biométrico (AFIS) seguirá respondiendo en la red local del colegio porque corre de forma independiente. Sin embargo, para persistir la asistencia en la base de datos centralizada de Supabase y disparar las alertas push a los celulares de los padres, sí se requiere conexión a internet. En caso de caída de internet, la recomendación de mejora a futuro es almacenar las asistencias localmente de forma temporal en un búfer (SQLite local) y sincronizarlas automáticamente en lote cuando la conexión se restablezca."*

### Q3: ¿Por qué la lectura biométrica no se incluyó en la aplicación móvil?
*   **Respuesta Clave:** *"La app móvil está diseñada exclusivamente para los tutores (padres de familia) para que consulten reportes e ingresen licencias desde sus hogares. La captura biométrica es un proceso institucionalizado que se realiza físicamente en la puerta del colegio utilizando una PC de control asignada por la administración escolar, por lo cual pertenece lógicamente al portal de escritorio."*

### Q4: ¿Cómo se protegen las credenciales de los usuarios en la base de datos?
*   **Respuesta Clave:** *"Las contraseñas de los usuarios nunca se guardan en texto plano en la base de datos de Supabase. Utilizamos el algoritmo de hashing seguro **BCrypt** en el servidor para encriptarlas antes de guardarlas. Además, el flujo de autenticación del portal web está respaldado por tokens de sesión firmados mediante **NextAuth (JWT)**, y las llamadas de la app móvil están protegidas mediante un token de portador (Bearer JWT) enviado en la cabecera de las peticiones HTTP."*
