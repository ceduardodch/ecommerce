import { NextRequest, NextResponse } from "next/server"

const wellnessHosts = new Set([
  "bienestar.b2b.com.ec",
  "www.bienestar.b2b.com.ec",
])
const kitchenHosts = new Set([
  "cocina.b2b.com.ec",
  "www.cocina.b2b.com.ec",
])

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
  const { pathname } = request.nextUrl

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
      url.protocol = "https:"
      url.hostname = "bienestar.b2b.com.ec"
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
