#!/usr/bin/env node

const toolsUrl = process.env.TOOLS_API_URL || "http://localhost:8787"
const token = process.env.TOOLS_API_TOKEN
const checkoutId = process.env.DATAFAST_RESULT_CHECKOUT_ID
const resourcePath = process.env.DATAFAST_RESULT_RESOURCE_PATH

function requireToken() {
  if (!token) {
    throw new Error("Set TOOLS_API_TOKEN. Do not pass Datafast access tokens to this script.")
  }
}

async function request(path, init = {}) {
  requireToken()
  const response = await fetch(`${toolsUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  })
  const body = await response.json().catch(async () => ({
    raw: await response.text().catch(() => ""),
  }))
  if (!response.ok) {
    throw new Error(`${response.status} ${JSON.stringify(body)}`)
  }
  return body
}

function sanitizeResult(result) {
  return {
    status: result.status,
    code: result.code,
    description: result.description,
    reference: result.reference,
    amount: result.amount,
    paymentBrand: result.paymentBrand,
    paymentId: result.paymentId,
    ndc: result.ndc,
    authorizationCode: result.authorizationCode,
  }
}

if (checkoutId) {
  const params = new URLSearchParams({ id: checkoutId })
  if (resourcePath) params.set("resourcePath", resourcePath)
  const result = await request(`/tools/datafast/result?${params.toString()}`, {
    method: "GET",
  })
  console.log(JSON.stringify({ ok: true, kind: "result", result: sanitizeResult(result) }, null, 2))
} else {
  const checkout = await request("/tools/datafast/checkout", {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          title: "Eter Niu Certificacion",
          sku: "CERT-DATAFAST-001",
          quantity: 1,
          unitPrice: 29.99,
        },
      ],
      customer: {
        givenName: "Test",
        middleName: "Sandbox",
        surname: "Eter",
        email: "test@eter-niu.com",
        phone: "0999999999",
        idNumber: "9999999999",
        street: "Av. Test 123",
        city: "Guayaquil",
        countryCode: "EC",
      },
    }),
  })
  console.log(
    JSON.stringify(
      {
        ok: true,
        kind: "checkout",
        reference: checkout.reference,
        checkoutId: checkout.checkoutId,
        amount: checkout.amount,
        provider: checkout.provider,
        env: checkout.env,
        widgetHost: new URL(checkout.widgetUrl).origin,
        widgetUrl: checkout.widgetUrl,
      },
      null,
      2,
    ),
  )
}
