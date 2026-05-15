# Deployment Setup Guide

## Railway (Backend)

URL: https://railway.app/project/...
Login → Project → Variables → Add

### Required Variables
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres.hinyheneofcedgyazcoi:ContextSheild18@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `REDIS_URL` | `rediss://default:gQAAAAAAARkNAAIgcDI5MDdkMTdkMmEzM2Q0Y2I4YWUxNzc1MjQ2NTQxMTFmYQ@star-corgi-71949.upstash.io:6379` |
| `JWT_SECRET_KEY` | `contextshield-production-secret-2025-v1` |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `480` |
| `CORS_ORIGINS` | `["https://context-shield-protection.vercel.app","http://localhost:5173"]` |
| `RESEND_API_KEY` | `re_REPLACE_ME` |
| `ALERT_EMAIL` | `alerts@example.com` |
| `HMAC_SECRET` | `contextshield-production-hmac-secret` |
| `DEBUG` | `False` |
| `ENVIRONMENT` | `production` |

**After setting vars:** Railway auto-restarts the service.

**Verify:** `curl https://web-production-4831a.up.railway.app/api/v1/auth/login -d "username=admin@meridian-mfg.com&password=ContextShield2025!"`

## Vercel (Frontend)

URL: https://vercel.com/.../context-shield/settings/environment-variables

### Required Variables
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://web-production-4831a.up.railway.app/api/v1` |
| `VITE_WS_URL` | `wss://web-production-4831a.up.railway.app/ws/live` |

**After setting vars:** Trigger redeploy via Vercel dashboard → Deployments → Redeploy latest.

**Verify:** Open https://context-shield-protection.vercel.app and log in.
