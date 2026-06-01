# Content Matrix - Eter Niu Verticales

Esta matriz define que material real de cocina queda aprobado para la web, como alimenta ventas, Pixel/CRM y WhatsApp, y que material queda fuera para una futura campana separada.

## Assets Aprobados Para Cocina

| Source original | Archivo publicado | Seccion | Producto | Angulo comercial | Evento CRM |
| --- | --- | --- | --- | --- | --- |
| `data/biblioteca/Contenido eter niu 2/VID_20260517_170202_268_bsl.mp4` | `apps/storefront/public/media/hero-cocina.mp4` + `photo-hero-cocina.jpg` | Hero | Wok 32 cm / Set MGC | Producto real en cocina real; presenter con wok y CTA a cupon | `video_interest` |
| `data/biblioteca/Contenido eter niu 2/VID_20260517_174632_892_bsl.mp4` | `apps/storefront/public/media/detalle-wok.mp4` + `photo-detalle-wok.jpg` | Visto en redes / ficha wok | Wok 32 cm / Sarten wok 28 cm | Tapa, interior granito, base y marca MGC visibles | `video_interest` |
| `data/biblioteca/Contenido eter niu 2/VID_20260520_133153_246_bsl.mp4` | `apps/storefront/public/media/receta-wok.mp4` + `photo-receta-wok.jpg` | Visto en redes / ficha wok | Wok 32 cm | Salteado de vegetales y uso familiar con menos aceite | `video_interest` |
| `data/biblioteca/Contenido eter niu 2/VID-20260304-WA0022.mp4` | `apps/storefront/public/media/uso-diario-gas.mp4` + `photo-uso-diario-gas.jpg` + `photo-product-olla-24.jpg` | Visto en redes / ficha olla 24 | Olla 24 cm familiar | Olla trabajando en hornilla de gas y contexto de uso diario | `video_interest` |
| `data/biblioteca/Contenido eter niu 3/VID_20260307_165921_101_bsl.mp4` | `apps/storefront/public/media/set-mgc.mp4` + `photo-product-set-granito.jpg` + `photo-editorial-mesa.jpg` | Combos / ficha set | Set MGC granito | Set completo sobre mesa, piezas visibles y oportunidad de combo | `video_interest` |
| `olla-ideal-quiz` | `photo-product-olla-24.jpg` | Home | Productos estrella | Recomendar por personas, ciudad, uso y presupuesto | `quiz_completed` |
| `club-cocina-saludable` | `photo-product-utensilios.jpg` | Home / guia | Productos estrella | Guia, cupon y recordatorios de cuidado/recompra | `guide_downloaded` |

## Fotos De Producto

| Archivo publicado | Uso | Nota |
| --- | --- | --- |
| `photo-hero-cocina.jpg` | Hero y fallback de video | Poster real del video de cocina con presenter y wok. |
| `photo-receta-wok.jpg` | Wok 32 cm, receta y feed Meta | Frame real del salteado. |
| `photo-product-set-granito.jpg` | Set MGC, combos y feed Meta | Frame real del set sobre mesa. |
| `photo-product-olla-24.jpg` | Olla 24 cm y feed Meta | Stills de olla MGC en uso; no afirmar tamano visual si no se confirma en foto. |
| `photo-product-olla-20.jpg` | Olla 20 cm y feed Meta | Stills de producto MGC; no afirmar tamano visual si no se confirma en foto. |
| `photo-detalle-wok.jpg` | Sarten/wok y detalle material | Reemplaza el antiguo placeholder de huevo hasta tener prueba real. |
| `photo-uso-diario-gas.jpg` | Uso diario en hornilla | Reemplaza el antiguo placeholder de limpieza hasta tener video real de limpieza. |

## Excluidos De Esta Web

| Tipo de asset | Estado | Motivo |
| --- | --- | --- |
| Yoga / wellness / accesorios no cocina | `future_wellness_site` | No mezclar con la promesa central de cocina saludable. |
| Decoracion / lifestyle sin producto de cocina | `future_wellness_site` | Puede servir para otra landing, pero baja claridad comercial en esta tienda. |
| Botellas, bowls y productos no relacionados | `future_wellness_site` | Reservar para categoria/campana separada si se decide venderlos. |
| Pruebas de huevo/queso o limpieza no disponibles | `pending_real_asset` | No publicar copy ni slot que prometa una demostracion no mostrada por el asset real. |

## Vertical Bienestar

`bienestar.b2b.com.ec` separa los productos no cocina sin crear otro repo ni duplicar CRM. Los anuncios de bienestar deben apuntar a `https://bienestar.b2b.com.ec/campanas/[slug]?sku=...`, igual que cocina usa `https://cocina.b2b.com.ec/campanas/[slug]?sku=...`.

| Tipo de asset | Archivo inicial | Seccion | Producto piloto | Angulo comercial | Evento CRM |
| --- | --- | --- | --- | --- | --- |
| Hero bienestar | `wellness-hero.svg` | `bienestar.b2b.com.ec` hero | Vertical bienestar | Rutina diaria, pausa y movimiento | `page_view` / `view_content` |
| Botella / hidratacion | `wellness-botella.svg` | Catalogo y landing SKU | `BIEN-BOTELLA-TERMICA-750` | Hidratacion diaria y oficina | `product_interest` / `whatsapp_opened` |
| Mat / movimiento | `wellness-mat.svg` | Catalogo y landing SKU | `BIEN-MAT-YOGA-ANTIDESLIZANTE` | Pausa activa en casa | `product_interest` / `whatsapp_opened` |
| Bowl / mesa consciente | `wellness-bowl.svg` | Catalogo y landing SKU | `BIEN-BOWL-CERAMICA-RITUAL` | Desayuno consciente y regalo | `product_interest` / `whatsapp_opened` |
| Aroma / pausa en casa | `wellness-aroma.svg` | Catalogo y landing SKU | `BIEN-KIT-AROMA-CALMA` | Ritual de pausa sin claims medicos | `product_interest` / `whatsapp_opened` |

Regla operativa: cuando existan fotos o videos reales de bienestar, reemplazar estos SVG por assets optimizados en `apps/storefront/public/media` y mantener metadata `vertical=bienestar`, `productInterestSku`, `campaignSlug`, `utm_*`, `fbclid` y `leadId`.

## Reglas De Publicacion

- No publicar testimonios sin aprobacion explicita de nombre, ciudad, producto y permiso de uso.
- No usar claims medicos absolutos. Usar "opcion sin teflon", "alternativa a antiadherentes tradicionales", "menos aceite" y "eleccion informada".
- Si se menciona PFOA, PFAS o PTFE como "libre de", debe existir certificacion del proveedor.
- Cada CTA de video o ficha debe conservar producto, SKU, precio, diametro, placement, `leadId`, fuente, cupon `GRANITOHOY`, envio gratis, pagos y compatibilidad para OpenClaw/CRM.
- Cada evento de quiz, video, guia o ficha debe incluir cuando aplique `journeyStage`, `householdPeople`, `city`, `videoSlot`, `productInterestSku`, `recommendedSku`, `couponClaimed`, `paymentMethodsShown`, `freeShippingShown`, `stoveCompatibilityShown` y `followupSequence`.
- Vicky/OpenClaw debe usar `GET /tools/ai-context/customer/:phone?leadId=<Lead>` antes de responder si el mensaje de WhatsApp incluye `Lead`.
- Si el mensaje empieza con `Hola, quiero la olla de granito {producto}.`, Vicky debe responder con ese producto, assets disponibles, precio, envio gratis y formas de pago antes de abrir un menu.
