export function log(ctx: Record<string, unknown>, msg: string, extra?: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...ctx, msg, ...extra }))
}

export function logError(ctx: Record<string, unknown>, err: unknown, msg?: string) {
  console.error(JSON.stringify({
    ts:    new Date().toISOString(),
    level: 'error',
    ...ctx,
    msg:   msg ?? 'error',
    err:   err instanceof Error ? err.message : String(err),
  }))
}
