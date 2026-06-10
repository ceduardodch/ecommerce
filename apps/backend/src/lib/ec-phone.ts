export type EcPhoneResult =
  | { phone: string; error?: undefined }
  | { phone?: undefined; error: string }

const EC_MOBILE_LENGTH = 9 // 9XXXXXXXX

export function normalizeEcPhone(raw: string | undefined | null): EcPhoneResult {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) {
    return { error: "telefono_vacio" }
  }

  const hadPlus = trimmed.startsWith("+")
  const digits = trimmed.replace(/\D/g, "")

  if (!digits) {
    return { error: "telefono_invalido" }
  }

  if (digits.startsWith("593")) {
    const local = digits.slice(3)
    if (local.length === EC_MOBILE_LENGTH || local.length === 8) {
      return { phone: `+593${local}` }
    }
    return { error: "telefono_ec_invalido" }
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return { phone: `+593${digits.slice(1)}` }
  }

  if (digits.startsWith("9") && digits.length === EC_MOBILE_LENGTH) {
    return { phone: `+593${digits}` }
  }

  if (hadPlus && digits.length >= 8 && digits.length <= 15) {
    return { phone: `+${digits}` }
  }

  return { error: "telefono_invalido" }
}

export function isNormalizedEcPhone(value: string) {
  return /^\+\d{8,15}$/.test(value)
}
