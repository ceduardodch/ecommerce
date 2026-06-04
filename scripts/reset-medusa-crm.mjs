#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { Client } from "pg"

const CRM_TABLES = [
  "crm_customer_event",
  "conversational_order",
  "crm_customer_profile",
]

function argValue(name) {
  const prefix = `${name}=`
  const match = process.argv.find((arg) => arg.startsWith(prefix))
  return match ? match.slice(prefix.length) : undefined
}

function hasArg(name) {
  return process.argv.includes(name)
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-")
}

function quoteIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Invalid identifier: ${value}`)
  }
  return `"${value.replaceAll('"', '""')}"`
}

function csvCell(value) {
  if (value === null || value === undefined) return ""
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function toCsv(columns, rows) {
  return [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\n")
}

async function tableExists(client, table) {
  const result = await client.query("select to_regclass($1) as table_name", [
    table,
  ])
  return Boolean(result.rows[0]?.table_name)
}

async function countRows(client, table) {
  const result = await client.query(
    `select count(*)::int as count from ${quoteIdentifier(table)}`,
  )
  return Number(result.rows[0]?.count || 0)
}

async function tableColumns(client, table) {
  const result = await client.query(
    `
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = $1
      order by ordinal_position
    `,
    [table],
  )
  return result.rows.map((row) => row.column_name)
}

async function backupTable(client, table, outputDir) {
  const columns = await tableColumns(client, table)
  const result = await client.query(
    `select * from ${quoteIdentifier(table)} order by created_at asc, id asc`,
  )
  const jsonPath = path.join(outputDir, `${table}.json`)
  const csvPath = path.join(outputDir, `${table}.csv`)

  await writeFile(jsonPath, `${JSON.stringify(result.rows, null, 2)}\n`)
  await writeFile(csvPath, `${toCsv(columns, result.rows)}\n`)

  return {
    table,
    rows: result.rows.length,
    jsonPath,
    csvPath,
  }
}

async function main() {
  const databaseUrl =
    argValue("--database-url") || process.env.DATABASE_URL || ""
  const confirmReset = hasArg("--confirm-reset-crm")
  const outputDir =
    argValue("--backup-dir") ||
    path.join(process.cwd(), "data", "crm-backups", timestamp())

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Pass --database-url=... or set DATABASE_URL.",
    )
  }

  const client = new Client({
    connectionString: databaseUrl,
    application_name: "b2b-crm-reset",
  })

  await client.connect()

  try {
    for (const table of CRM_TABLES) {
      if (!(await tableExists(client, table))) {
        throw new Error(`Required CRM table does not exist: ${table}`)
      }
    }

    const before = Object.fromEntries(
      await Promise.all(
        CRM_TABLES.map(async (table) => [table, await countRows(client, table)]),
      ),
    )

    await mkdir(outputDir, { recursive: true })
    const backups = []
    for (const table of CRM_TABLES) {
      backups.push(await backupTable(client, table, outputDir))
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      action: confirmReset ? "backup_and_reset" : "backup_only_dry_run",
      tables: CRM_TABLES,
      countsBefore: before,
      backups,
      note:
        "Only B2B CRM tables are included. Medusa products, customers, users, regions and orders are not reset by this script.",
    }
    await writeFile(
      path.join(outputDir, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    if (!confirmReset) {
      console.log("CRM backup complete. Dry-run only; no rows were deleted.")
      console.log(JSON.stringify({ countsBefore: before, backupDir: outputDir }))
      return
    }

    await client.query("begin")
    await client.query(
      CRM_TABLES.map((table) => `truncate table ${quoteIdentifier(table)}`)
        .join("; "),
    )
    await client.query("commit")

    const after = Object.fromEntries(
      await Promise.all(
        CRM_TABLES.map(async (table) => [table, await countRows(client, table)]),
      ),
    )

    console.log("CRM reset complete.")
    console.log(
      JSON.stringify({
        countsBefore: before,
        countsAfter: after,
        backupDir: outputDir,
      }),
    )
  } catch (error) {
    await client.query("rollback").catch(() => undefined)
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
