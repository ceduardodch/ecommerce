# Content Matrix - Eter Niu Cocina

Esta matriz define que material real debe reemplazar los placeholders y como alimenta ventas, Pixel/CRM y WhatsApp.

## Videos Prioritarios

| Archivo | Seccion | Producto | Objetivo | Evento CRM |
| --- | --- | --- | --- | --- |
| `hero-cocina.mp4` | Hero | Wok 32 cm / Set MGC | Mostrar cocina real y deseo de compra | `video_interest` |
| `prueba-huevo.mp4` | Visto en redes | Olla 20 cm / Sarten wok 28 cm | Probar que no se pega | `video_interest` |
| `limpieza-rapida.mp4` | Visto en redes | Olla 24 cm / Utensilios | Probar limpieza y cuidado | `video_interest` |
| `receta-wok.mp4` | Visto en redes | Wok 32 cm | Mostrar receta familiar completa | `video_interest` |
| `olla-ideal-quiz` | Home | Productos estrella | Recomendar por personas, ciudad, uso y presupuesto | `quiz_completed` |
| `club-cocina-saludable` | Home / guia | Productos estrella | Guia, cupon y recordatorios de cuidado/recompra | `guide_downloaded` |

## Fotos Prioritarias

| Archivo sugerido | Uso | Requisito |
| --- | --- | --- |
| `photo-hero-cocina.jpg` | Hero y fallback | Cocina real, producto visible, comida fresca |
| `photo-product-olla-20.jpg` | Ficha y feed Meta | Olla 20 cm completa, sin recortes raros |
| `photo-product-olla-24.jpg` | Ficha y feed Meta | Olla 24 cm con escala familiar |
| `photo-product-set-granito.jpg` | Ficha y combos | Set completo sobre mesa limpia |
| `photo-receta-wok.jpg` | Wok 32 cm | Wok en uso con receta apetecible |

## Reglas De Publicacion

- No publicar testimonios sin aprobacion explicita de nombre, ciudad, producto y permiso de uso.
- No usar claims medicos absolutos. Usar "opcion sin teflon", "alternativa a antiadherentes tradicionales", "menos aceite" y "eleccion informada".
- Si se menciona PFOA, PFAS o PTFE como "libre de", debe existir certificacion del proveedor.
- Cada CTA de video o ficha debe conservar producto, SKU, precio, diametro, placement, `leadId`, fuente, cupon `GRANITOHOY`, envio gratis, pagos y compatibilidad para OpenClaw/CRM.
- Cada evento de quiz, video, guia o ficha debe incluir cuando aplique `journeyStage`, `householdPeople`, `city`, `videoSlot`, `productInterestSku`, `recommendedSku`, `couponClaimed`, `paymentMethodsShown`, `freeShippingShown`, `stoveCompatibilityShown` y `followupSequence`.
- Vicky/OpenClaw debe usar `GET /tools/ai-context/customer/:phone?leadId=<Lead>` antes de responder si el mensaje de WhatsApp incluye `Lead`.
- Si el mensaje empieza con `Hola, quiero la olla de granito {producto}.`, Vicky debe responder con ese producto, assets disponibles, precio, envio gratis y formas de pago antes de abrir un menu.
