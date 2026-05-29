# AI Radar - Production Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set in production
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set in production
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set in Supabase edge functions
- [ ] `OPENROUTER_API_KEY` - Optional, for AI features
- [ ] `RESEND_API_KEY` - Optional, for email digests
- [ ] `STRIPE_SECRET_KEY` - Optional, for subscriptions
- [ ] `STRIPE_WEBHOOK_SECRET` - Optional, for Stripe webhooks
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Optional, for Stripe UI

### Database
- [ ] Run all migrations
- [ ] Verify RLS policies are enabled
- [ ] Check indexes are created
- [ ] Verify backup schedule (automatic in Supabase)
- [ ] Test database connection

### Edge Functions
- [ ] Deploy all edge functions
- [ ] Test health endpoint: `/functions/v1/health`
- [ ] Verify API rate limits
- [ ] Test fallback data when APIs fail

### Security
- [ ] Verify RLS policies on all tables
- [ ] Check no sensitive data in client code
- [ ] Verify CORS headers are correctly set
- [ ] Test rate limiting
- [ ] Validate input sanitization

## Deployment

### Build
```bash
npm run build
```
- [ ] No build errors
- [ ] No TypeScript errors
- [ ] No ESLint errors (in production mode)

### Performance Checks
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90

### Bundle Size
```
Route (app)                              Size     First Load JS
┌ ○ /                                    ~170 kB  ~250 kB
```
- [ ] First Load JS < 300 kB
- [ ] No duplicate dependencies
- [ ] Images optimized

### API Endpoints
- [ ] Test all API routes
- [ ] Verify error handling
- [ ] Check rate limiting
- [ ] Test fallback behavior

## Post-Deployment

### Monitoring
- [ ] Set up health check monitoring
- [ ] Configure alert thresholds
- [ ] Set up error tracking (Sentry, Logflare, etc.)
- [ ] Enable Supabase logs

### Backup Verification
- [ ] Supabase automatic backups enabled
- [ ] Test restore procedure
- [ ] Document backup schedule

### Performance Monitoring
- [ ] Set up Lighthouse CI
- [ ] Monitor Core Web Vitals
- [ ] Track API response times
- [ ] Monitor database query performance

### Security Audit
- [ ] Review error messages (no sensitive data)
- [ ] Verify HTTPS everywhere
- [ ] Check security headers
- [ ] Review rate limit effectiveness

## Maintenance

### Daily Tasks
- [ ] Check health endpoint
- [ ] Review error logs
- [ ] Monitor API usage

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Update dependencies (security patches)

### Monthly Tasks
- [ ] Full security audit
- [ ] Review backup integrity
- [ ] Update API keys if needed
- [ ] Review rate limit thresholds

## Rollback Plan

### Quick Rollback
1. Revert to previous deployment version
2. Clear CDN cache
3. Verify database migrations are backward compatible
4. Test critical user flows

### Full Rollback
1. Restore database from backup
2. Revert all code changes
3. Re-deploy previous version
4. Clear all caches
5. Verify all services

## Monitoring Endpoints

| Endpoint | Purpose | Frequency |
|----------|---------|-----------|
| `/functions/v1/health` | Basic health check | Every 60s |
| `/functions/v1/api-news` | News data | Every hour |
| `/functions/v1/refresh-data` | Data refresh | Every hour |
| `/functions/v1/ai-automation` | AI content | Every 6 hours |
| `/functions/v1/daily-digest` | Email digest | Daily at 8am UTC |

## Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time | < 200ms | > 500ms |
| Database Query Time | < 50ms | > 200ms |
| Lighthouse Score | > 90 | < 85 |
| Error Rate | < 0.1% | > 1% |
| Uptime | > 99.9% | < 99% |

## Cost Optimization

- [ ] Review API usage and costs
- [ ] Enable caching for static data
- [ ] Optimize database queries
- [ ] Review image sizes
- [ ] Monitor Stripe webhook calls

## Support Documentation

- [ ] Document all environment variables
- [ ] Create runbook for incidents
- [ ] Document API endpoints
- [ ] Create user documentation
- [ ] Document admin features

---

## Quick Reference Commands

```bash
# Build
npm run build

# Start production server
npm run start

# Deploy edge functions
# (Done via Supabase MCP tools)

# Check logs
# (Via Supabase Dashboard)

# Run migrations
# (Done via Supabase MCP tools)

# Health check
curl https://YOUR_PROJECT.supabase.co/functions/v1/health
```

---

Last Updated: 2025-05-28
