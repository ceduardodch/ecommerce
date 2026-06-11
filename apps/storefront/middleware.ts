import { NextRequest, NextResponse } from "next/server"

const brandHosts = new Set(["eter-niu.com", "www.eter-niu.com"])
const wellnessHosts = new Set([
  "bienestar.b2b.com.ec",
  "www.bienestar.b2b.com.ec",
  "bienestar.eter-niu.com",
  "www.bienestar.eter-niu.com",
])
const kitchenHosts = new Set([
  "cocina.b2b.com.ec",
  "www.cocina.b2b.com.ec",
  "cocina.eter-niu.com",
  "www.cocina.eter-niu.com",
])

// Activar solo cuando el DNS de eter-niu.com esté operativo (DOMAIN_PLAN.md D1).
const migrationRedirects = process.env.DOMAIN_MIGRATION_REDIRECTS === "true"
const legacyHostTargets: Record<string, string> = {
  "cocina.b2b.com.ec": "https://cocina.eter-niu.com",
  "www.cocina.b2b.com.ec": "https://cocina.eter-niu.com",
  "bienestar.b2b.com.ec": "https://bienestar.eter-niu.com",
  "www.bienestar.b2b.com.ec": "https://bienestar.eter-niu.com",
}

const wellnessBase =
  process.env.NEXT_PUBLIC_BIENESTAR_URL || "https://bienestar.b2b.com.ec"

function cleanHost(request: NextRequest) {
  return (request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase()
}

function withoutPrefix(pathname: string, prefix: string) {
  const value = pathname.slice(prefix.length)
  return value || "/"
}

export function middleware(request: NextRequest) {
  const host = cleanHost(request)
  const { pathname, search } = request.nextUrl

  if (migrationRedirects && legacyHostTargets[host]) {
    const url = new URL(`${pathname}${search}`, legacyHostTargets[host])
    return NextResponse.redirect(url, 301)
  }

  if (brandHosts.has(host)) {
    if (pathname === "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/marca"
      return NextResponse.rewrite(url)
    }

    if (pathname === "/marca") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  if (wellnessHosts.has(host)) {
    if (pathname === "/bienestar" || pathname.startsWith("/bienestar/")) {
      const url = request.nextUrl.clone()
      url.pathname = withoutPrefix(pathname, "/bienestar")
      return NextResponse.redirect(url)
    }

    if (pathname === "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/bienestar"
      return NextResponse.rewrite(url)
    }

    if (pathname === "/campanas" || pathname.startsWith("/campanas/")) {
      const url = request.nextUrl.clone()
      url.pathname = `/bienestar${pathname}`
      return NextResponse.rewrite(url)
    }

    if (pathname === "/feeds/meta/catalog.csv") {
      const url = request.nextUrl.clone()
      url.searchParams.set("vertical", "bienestar")
      return NextResponse.rewrite(url)
    }
  }

  if (kitchenHosts.has(host)) {
    if (pathname === "/bienestar" || pathname.startsWith("/bienestar/")) {
      const url = new URL(request.url)
      const target = new URL(wellnessBase)
      url.protocol = "https:"
      url.hostname = target.hostname
      url.port = ""
      url.pathname = withoutPrefix(pathname, "/bienestar")
      return NextResponse.redirect(url)
    }

    if (pathname === "/feeds/meta/catalog.csv") {
      const url = request.nextUrl.clone()
      url.searchParams.set("vertical", "cocina")
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|media/).*)",
  ],
}
