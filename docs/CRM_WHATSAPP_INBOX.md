# Bandeja WhatsApp

La ruta de operación es `/app/crm-whatsapp/inbox`. Todos los usuarios del admin pueden ver la misma cola. Al usar **Tomar caso**, la conversación pasa a modo `human` y Vicky deja de responder hasta que alguien use **Liberar a Vicky**.

## Datos y retención

- Los adjuntos entrantes aceptados son imagen, PDF, audio y video de hasta 50 MB.
- `WHATSAPP_MEDIA_DIR` debe apuntar al montaje persistente `/app/data/whatsapp-media` del servicio `ecommerce-tools`.
- En Coolify, crear y montar el volumen persistente `crm-whatsapp-media` en esa ruta. No se guarda una copia externa por la decisión operativa actual.
- La tarea diaria de retención debe borrar mensajes y archivos con más de 24 meses y registrar la auditoría mínima. Antes de activarla en producción, validar la ruta y permisos del volumen en staging.

## Variables requeridas

- `WHATSAPP_MEDIA_DIR=/app/data/whatsapp-media`
- `WHATSAPP_MEDIA_MAX_BYTES=52428800`
- `CRM_WHATSAPP_MEDIA_MIN_FREE_BYTES=2147483648` para alerta por log cuando el volumen tenga menos de 2 GB libres.
- `WHATSAPP_AGENT_MODE=openai`
- `OPENAI_API_KEY` y, si se requiere otro modelo, `OPENAI_MODEL`
- `TOOLS_API_TOKEN` debe estar disponible tanto para `ecommerce-tools` como para el backend que envía respuestas manuales.

No configurar ni conservar variables de OpenClaw para este flujo. El webhook llama a Vicky por OpenAI y el envío sale por la Cloud API de Meta.

## Antes de promover

1. Aplicar la migración PostgreSQL en staging y comprobar upgrade, inserción, downgrade y re-upgrade.
2. Probar desde un número distinto: texto, imagen, PDF, audio, video, tomado por humano, liberado a Vicky, y estados `sent`, `delivered` y `read`.
3. Confirmar que el cliente ve el checkout DataFast y que el pago aprobado actualiza CRM.
4. Probar el espacio y permisos del volumen con un archivo menor y otro mayor de 50 MB.
