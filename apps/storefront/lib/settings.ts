import { cache } from "react";
import { CATALOG_REVALIDATE_SECONDS } from "./catalog";

/**
 * Configuración comercial publicable, servida por `ecommerce-tools` desde lo
 * que el dueño edita en Admin → CRM WhatsApp → Configuración.
 *
 * Solo trae lo que puede verse en la web: el número de cuenta bancaria NO sale
 * por este endpoint, se entrega únicamente por WhatsApp.
 *
 * Si tools no responde, se usan los valores base: la página de pagos nunca
 * queda en blanco por una caída del backend.
 */
export type CommerceSettings = {
  coupons: { cocina: string; bienestar: string };
  taxRate: number;
  whatsappSellerNumber: string;
  instagramUrl: string;
  payment: {
    transferEnabled: boolean;
    bankName: string;
    accountHolder?: string;
    taxId?: string;
    cardEnabled: boolean;
  };
};

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettings = {
  coupons: { cocina: "GRANITOHOY", bienestar: "BIENESTARHOY" },
  taxRate: 0.15,
  whatsappSellerNumber: "593987135207",
  instagramUrl: "https://instagram.com/eter.niu",
  payment: {
    transferEnabled: true,
    bankName: "Banco Pichincha",
    accountHolder: "Viky Johanna Saavedra Puebla — INFINITY IMPORTS",
    taxId: "1715523021001",
    cardEnabled: true,
  },
};

export const getCommerceSettings = cache(
  async function getCommerceSettings(): Promise<CommerceSettings> {
    const toolsUrl =
      process.env.TOOLS_API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_TOOLS_API_URL ||
      "http://localhost:8787";

    try {
      const headers: Record<string, string> = {};
      if (process.env.TOOLS_API_TOKEN) {
        headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`;
      }

      const response = await fetch(new URL("/tools/commerce-settings", toolsUrl), {
        next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["commerce-settings"] },
        headers,
      });
      if (!response.ok) throw new Error("tools unavailable");
      const data = (await response.json()) as Partial<CommerceSettings>;

      return {
        ...DEFAULT_COMMERCE_SETTINGS,
        ...data,
        coupons: { ...DEFAULT_COMMERCE_SETTINGS.coupons, ...(data.coupons || {}) },
        payment: { ...DEFAULT_COMMERCE_SETTINGS.payment, ...(data.payment || {}) },
      };
    } catch {
      return DEFAULT_COMMERCE_SETTINGS;
    }
  },
);
