# Mejoras de Vicky y continuidad del carrito

## Alcance

Primer bloque de la revisión del 7 de septiembre de 2026, desarrollado sobre
`release` (`4c2aadf`). No cambia precios, impuestos, proveedores de pago,
credenciales, campañas, CI ni configuración de Coolify.

- Vicky mantiene el contexto completo entre rondas de herramientas con
  `store: false`, incluyendo razonamiento cifrado. No usa `previous_response_id`.
- Las herramientas se ejecutan en orden. Una llamada exitosa repetida con los
  mismos argumentos reutiliza su resultado dentro del turno, sin crear otro carrito.
  Los errores permiten corregir argumentos o cotizar antes de volver a intentar.
- Una respuesta vacía de la IA genera un aviso interno y una respuesta breve de
  respaldo. Un resultado de envío `ok: false` se trata como fallo.
- Se vuelve a comprobar si un vendedor tomó el caso antes de enviar una respuesta.
- El carrito y el pago comparten nombre y ciudad. Las ediciones del pago también
  se conservan al volver al carrito. Se persisten únicamente esos datos básicos,
  como en el almacenamiento de carrito existente.
- El formulario de pago tiene etiquetas asociadas, autocompletado, teclado de
  email/teléfono y ciudad requerida. Espera a cargar el carrito antes de mostrar
  el importe. No modifica la creación del checkout ni los cálculos de cobro.

## Recepción y recuperación de WhatsApp

`whatsapp-inbox.json` se guarda en el volumen definido por `TOOLS_DATA_DIR`,
con permisos de archivo 0600. El webhook confirma recepción después de guardar
el mensaje. Si la escritura falla, devuelve un error para que Meta pueda reintentar.

El consumidor procesa una conversación a la vez y hasta cuatro clientes en
paralelo. Estados internos: `queued`, `processing`, `completed` y `review`.
Las escrituras se serializan y reemplazan el archivo de forma atómica.

Al reiniciar:

- Un mensaje pendiente se procesa.
- Uno que estaba en ejecución pasa a revisión humana: pudo haber creado un
  carrito o enviado una respuesta antes del reinicio. No se repiten esos efectos.
- Un aviso al CRM que falló se vuelve a intentar cada cinco segundos.
- Se respetan los IDs del archivo anterior `whatsapp-webhook-dedupe.json` para
  evitar reenvíos durante la actualización. No se borra ese archivo.

El texto y la referencia de medios se retiran del registro cuando termina la
atención o se confirma el aviso al CRM. Al recibir mensajes nuevos se purgan
registros finalizados de más de siete días. Los pendientes se conservan hasta
atenderlos. El archivo contiene datos de clientes: no debe subirse a Git ni
mostrarse en logs públicos.

La implementación requiere **una sola instancia consumidora** por volumen.
No es una cola distribuida. Antes de escalar a varias réplicas, mover el inbox a
un almacenamiento con bloqueo compartido. No garantiza exactamente un envío en
un fallo de red ambiguo; esos casos se dejan a una persona.

Si el archivo no puede leerse o está corrupto, el servicio falla al arrancar en
lugar de descartar la cola. Si falla una escritura durante el consumo, se detiene
el consumidor y registra `whatsapp_inbox_storage_failed`. Corregir el acceso al
volumen y reiniciar; conservar el archivo para recuperar los casos.

## Dónde ve el vendedor un fallo

Los eventos `human_handoff` de `whatsapp_recovery` crean una nota interna en
la bandeja WhatsApp y marcan la conversación como no leída. Conservan el vendedor
asignado y el modo actual. La nota explica el fallo y muestra la consulta recibida.
No se envía al cliente ni se incorpora al historial de mensajes de Vicky.

Ante un envío no confirmado o un reinicio durante la atención, revisar mensajes,
cotizaciones y carritos antes de reenviar o crear un pedido. Usar «Tomar caso»
para pausar a Vicky cuando corresponda y «Liberar a Vicky» al terminar.

## Validación local

- Herramientas: 149 pruebas aprobadas, incluidas continuidad de contexto,
  herramientas en orden, duplicados, reinicio, fallos y toma por vendedor.
- Backend: 97 pruebas aprobadas, incluidas notas internas de recuperación y
  prevención de duplicados de esas notas.
- Tienda: 47 pruebas aprobadas.
- Chequeo de tipos de los tres paquetes aprobado por separado.
- Navegador local, datos ficticios: agregar producto, escribir nombre y ciudad,
  avanzar al pago, editar ciudad, regresar al carrito y volver al pago. Datos
  conservados, ocho campos con nombre accesible, vista móvil de 390 × 844.
- No se enviaron mensajes reales ni se inició un checkout DataFast.

Los conteos difieren de la revisión inicial porque aquella se hizo sobre
`fix/confirmar-baja-una-vez`, una rama posterior a la base de `release`.

## Antes de publicar

Reconciliar de forma autorizada las correcciones posteriores de `main` y de la
rama de baja; esta tarea no las fusiona. Verificar el flujo real en staging con
Meta, la API de IA y DataFast. La prueba de herramientas usa respuestas simuladas
de proveedor y no sustituye esa verificación.

Quedan para otro bloque: unificar consentimiento, filtros y claridad del
catálogo, métricas comerciales y actualizar la documentación histórica. El
escáner general de dominios sigue detectando URLs antiguas en datos locales;
no se modificaron pedidos históricos para hacer pasar esa comprobación.

Referencia del contrato de contexto:
[documentación oficial de OpenAI](https://developers.openai.com/api/docs/guides/conversation-state).
