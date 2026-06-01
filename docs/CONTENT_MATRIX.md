# Content Matrix - Eter Niu Verticales

Esta matriz define que material real de cocina queda aprobado para la web, como alimenta ventas, Pixel/CRM y WhatsApp, y que material queda fuera para una futura campana separada.

## Assets Aprobados Para Cocina

| Source original                                                        | Archivo publicado                                                                                         | Seccion                     | Producto                | Angulo comercial                                                                                        | Evento CRM         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| `data/biblioteca/Contenido eter niu 2/VID_20260517_170202_268_bsl.mp4` | `apps/storefront/public/media/hero-cocina.mp4` + `photo-hero-cocina.jpg`                                  | Hero                        | Wok 32 cm               | Producto real en cocina real; presenter con wok y CTA a cupon                                           | `video_interest`   |
| `data/biblioteca/Contenido eter niu 2/VID_20260517_174632_892_bsl.mp4` | `apps/storefront/public/media/detalle-wok.mp4` + `photo-detalle-wok.jpg`                                  | Visto en redes / ficha wok  | Wok 32 cm               | Tapa, interior granito, base y marca MGC visibles                                                       | `video_interest`   |
| `data/biblioteca/Contenido eter niu 2/VID_20260520_133153_246_bsl.mp4` | `apps/storefront/public/media/receta-wok.mp4` + `photo-receta-wok.jpg`                                    | Visto en redes / ficha wok  | Wok 32 cm               | Salteado de vegetales y uso familiar con menos aceite                                                   | `video_interest`   |
| `data/biblioteca/Contenido eter niu 2/VID-20260304-WA0022.mp4`         | `apps/storefront/public/media/uso-diario-gas.mp4` + `photo-uso-diario-gas.jpg`                            | Visto en redes / ficha olla | Olla 18 cm / Olla 20 cm | Olla trabajando en hornilla de gas y contexto de uso diario                                             | `video_interest`   |
| `data/biblioteca/Contenido eter niu 3/VID_20260307_165921_101_bsl.mp4` | `apps/storefront/public/media/set-mgc.mp4` + `photo-product-set-granito.jpg` + `photo-editorial-mesa.jpg` | Prueba de linea MGC         | Wok 32 cm / Olla 20 cm  | Set completo como referencia visual de la linea MGC; no publicarlo como producto si no esta en WhatsApp | `video_interest`   |
| `olla-ideal-quiz`                                                      | `photo-product-olla-20.jpg`                                                                               | Home                        | Productos estrella      | Recomendar por personas, ciudad, uso y presupuesto                                                      | `quiz_completed`   |
| `club-cocina-saludable`                                                | `photo-product-utensilios.jpg`                                                                            | Home / guia                 | Productos estrella      | Guia, cupon y recordatorios de cuidado/recompra                                                         | `guide_downloaded` |

## Fotos De Producto

| Archivo publicado               | Uso                            | Nota                                                                                  |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| `photo-hero-cocina.jpg`         | Hero y fallback de video       | Poster real del video de cocina con presenter y wok.                                  |
| `photo-receta-wok.jpg`          | Wok 32 cm, receta y feed Meta  | Frame real del salteado.                                                              |
| `photo-product-set-granito.jpg` | Prueba visual de linea MGC     | Frame real del set sobre mesa; no usar como producto vendible si no esta en WhatsApp. |
| `photo-product-olla-24.jpg`     | Asset historico/referencial    | No usar como producto activo si la olla 24 no aparece en el catalogo real.            |
| `photo-product-olla-20.jpg`     | Olla 18 cm / 20 cm y feed Meta | Stills de producto MGC; no afirmar tamano visual si no se confirma en foto.           |
| `photo-detalle-wok.jpg`         | Sarten/wok y detalle material  | Reemplaza el antiguo placeholder de huevo hasta tener prueba real.                    |
| `photo-uso-diario-gas.jpg`      | Uso diario en hornilla         | Reemplaza el antiguo placeholder de limpieza hasta tener video real de limpieza.      |

## Excluidos De Esta Web

| Tipo de asset                                          | Estado                 | Motivo                                                                               |
| ------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------ |
| Yoga / wellness / accesorios no cocina                 | `future_wellness_site` | No mezclar con la promesa central de cocina saludable.                               |
| Decoracion / lifestyle sin producto de cocina          | `future_wellness_site` | Puede servir para otra landing, pero baja claridad comercial en esta tienda.         |
| Botellas, bowls y productos no relacionados con cocina | `wellness_site`        | Publicar en `bienestar.b2b.com.ec`, no en cocina.                                    |
| Pruebas de huevo/queso o limpieza no disponibles       | `pending_real_asset`   | No publicar copy ni slot que prometa una demostracion no mostrada por el asset real. |

## Vertical Bienestar

`bienestar.b2b.com.ec` separa los productos no cocina sin crear otro repo ni duplicar CRM. Los anuncios de bienestar deben apuntar a `https://bienestar.b2b.com.ec/campanas/[slug]?sku=...`, igual que cocina usa `https://cocina.b2b.com.ec/campanas/[slug]?sku=...`.

| Tipo de asset                 | Archivo inicial        | Seccion                     | Producto piloto                                                                                                                                                                | Angulo comercial                             | Evento CRM                             |
| ----------------------------- | ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | -------------------------------------- |
| Hero bienestar                | `wellness-hero.svg`    | `bienestar.b2b.com.ec` hero | Vertical bienestar                                                                                                                                                             | Rutina diaria, pausa y movimiento            | `page_view` / `view_content`           |
| Termos / hidratacion          | `wellness-botella.svg` | Catalogo y landing SKU      | `BIEN-TERMO-SUS304-500` / `BIEN-TERMO-SUS304-1000`                                                                                                                             | Hidratacion diaria y oficina                 | `product_interest` / `whatsapp_opened` |
| Yoga / movimiento             | `wellness-mat.svg`     | Catalogo y landing SKU      | `BIEN-YOGA-MAT-SUEDE-4MM` / `BIEN-MEDITADOR-MANDALA-70` / `BIEN-PISTOLA-PERCUSION-PRO`                                                                                         | Pausa activa en casa                         | `product_interest` / `whatsapp_opened` |
| Hogar Zen / te                | `wellness-bowl.svg`    | Catalogo y landing SKU      | `BIEN-JUEGO-TE-AAA`                                                                                                                                                            | Ritual de te y regalo                        | `product_interest` / `whatsapp_opened` |
| Energia / sonido / decoracion | `wellness-aroma.svg`   | Catalogo y landing SKU      | `BIEN-CUENCO-BRONCE-8`, `BIEN-CUENCO-BRONCE-9`, `BIEN-TAMBOR-LENGUA-8-NOTAS`, `BIEN-CASCADA-HUMO-OM-GANESHA-TORRE`, `BIEN-PENDULO-7-CHAKRAS`, `BIEN-LAMPARA-SAL-HIMALAYA-10KG` | Ritual, sonido y ambiente sin claims medicos | `product_interest` / `whatsapp_opened` |
| Tesoros plata / acero         | `wellness-aroma.svg`   | Catalogo y landing SKU      | `BIEN-ARGOLLAS-PLATA-925`, `BIEN-DIJE-OM-PLATA-925`, `BIEN-AMULETO-HINDU-PLATA-925`                                                                                            | Accesorio y regalo                           | `product_interest` / `whatsapp_opened` |

Regla operativa: cuando existan fotos o videos reales de bienestar, reemplazar estos SVG por assets optimizados en `apps/storefront/public/media` y mantener metadata `vertical=bienestar`, `productInterestSku`, `campaignSlug`, `utm_*`, `fbclid` y `leadId`.

## Reglas De Publicacion

- No publicar testimonios sin aprobacion explicita de nombre, ciudad, producto y permiso de uso.
- No usar claims medicos absolutos. Usar "opcion sin teflon", "alternativa a antiadherentes tradicionales", "menos aceite" y "eleccion informada".
- Si se menciona PFOA, PFAS o PTFE como "libre de", debe existir certificacion del proveedor.
- Cada CTA de video o ficha debe conservar producto, SKU, precio, diametro, placement, `leadId`, fuente, cupon `GRANITOHOY`, envio gratis, pagos y compatibilidad para OpenClaw/CRM.
- Cada evento de quiz, video, guia o ficha debe incluir cuando aplique `journeyStage`, `householdPeople`, `city`, `videoSlot`, `productInterestSku`, `recommendedSku`, `couponClaimed`, `paymentMethodsShown`, `freeShippingShown`, `stoveCompatibilityShown` y `followupSequence`.
- Vicky/OpenClaw debe usar `GET /tools/ai-context/customer/:phone?leadId=<Lead>` antes de responder si el mensaje de WhatsApp incluye `Lead`.
- Si el mensaje empieza con `Hola, quiero la olla de granito {producto}.`, Vicky debe responder con ese producto, assets disponibles, precio, envio gratis y formas de pago antes de abrir un menu.
