# Probuyer Integration Docs (Copy-Friendly)

Use this document to share with the Probuyer team.

---

## Quick Summary

- Probuyer must first confirm API key ownership (`api_key` + `email`).
- IMEI checks and order-history calls should use the short-lived `confirmation_token`.
- If an API key is revoked/regenerated in imeicheck2, Probuyer must unlink immediately.
- Probuyer must **not** auto-link a new key; user must manually relink.

---

## Step 1 — Confirm Key Ownership

**Endpoint**

`POST /api/external/init`

**Request (JSON)**

```json
{
  "api_key": "<your-api-key>",
  "email": "<your-registered-email>"
}
```

**Response (JSON)**

```json
{
  "success": true,
  "confirmed": true,
  "email": "user@example.com",
  "confirmation_token": "<short-lived-token>",
  "expires_in": 600
}
```

---

## Step 2 — Run IMEI Check

**Endpoint**

`POST /api/external/imei-check`

**Single IMEI request (JSON)**

```json
{
  "confirmation_token": "<short-lived-token>",
  "service_id": 1,
  "imei": "359998765432100"
}
```

**Bulk request (max 50 IMEIs) (JSON)**

```json
{
  "confirmation_token": "<short-lived-token>",
  "service_id": 1,
  "imeis": ["359998765432100", "359998765432101"]
}
```

**Success response example (JSON)**

```json
{
  "success": true,
  "order_id": 12345,
  "status": "completed",
  "results": [
    {
      "imei": "359998765432100",
      "status": "completed",
      "result": "Find My iPhone: ON\nModel: iPhone 15 Pro",
      "object": { "fmiOn": true, "model": "iPhone 15 Pro (A3104)" }
    }
  ],
  "charged": 0.01,
  "balance": 4.37
}
```

---

## Step 3 — Fetch Probuyer Order History

**Endpoint**

`POST /api/external/orders`

**Request (JSON)**

```json
{
  "confirmation_token": "<short-lived-token>",
  "limit": 25
}
```

**Response (JSON)**

```json
{
  "success": true,
  "total": 1,
  "orders": [
    {
      "order_id": 12345,
      "request_source": "probuyer",
      "status": "completed",
      "service_name_at_order": "Find My iPhone",
      "price_used": 0.01
    }
  ]
}
```

---

## Step 4 — Revoke Webhook (Unlink Required)

If user revokes or regenerates an API key in imeicheck2, a webhook can notify Probuyer to unlink immediately.

**Webhook payload (JSON)**

```json
{
  "event": "imeicheck2.api_key.revoked",
  "triggered_at": "2026-03-15T18:00:00.000Z",
  "user_id": 123,
  "email": "user@example.com",
  "key_id": 456,
  "key_label": "probuyer integration",
  "reason": "manual_revoke | regenerated",
  "revoked_at": "2026-03-15T18:00:00.000Z"
}
```

**Optional security header**

`x-probuyer-secret: <shared-secret>`

**Important rule**

After revoke/regenerate, Probuyer must unlink and require manual relink by user.
No automatic relinking is allowed.

---

## Notes

- Use the same numeric `service_id` values shown in IMEI Check UI.
- Pricing follows account tier rules (registered / premium / pro).
- `confirmation_token` is short-lived and should be refreshed via `/api/external/init` when expired.
