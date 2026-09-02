# Política de dominios públicos

Toda URL visible para clientes, vendedores o administradores usa `eter-niu.com`.

| Uso | URL canónica |
| --- | --- |
| Marca | `https://eter-niu.com` |
| Cocina | `https://cocina.eter-niu.com` |
| Bienestar | `https://bienestar.eter-niu.com` |
| Administración | `https://admin.eter-niu.com` |
| Webhook actual de WhatsApp | `https://whatsapp-test.eter-niu.com` |

Los hosts públicos antiguos bajo `b2b.com.ec` solo se aceptan como entrada para
redirigir o migrar datos. El catálogo, el carrito, Vicky, las plantillas y el
CRM nunca deben mostrarlos ni enviarlos.

`npm run check:public-domains` revisa esta regla y también se ejecuta antes del
typecheck. El CRM normaliza las URLs al guardar, renderizar y enviar mensajes.

Los correos internos `@b2b.com.ec` no se cambian hasta que exista un buzón real
de Eter Niu. Los identificadores sintéticos de nuevos clientes sí usan
`@customers.eter-niu.com` y no reciben correo.
