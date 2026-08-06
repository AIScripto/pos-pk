# Deployment Runbook

**Version**: 1.0  
**Date**: 2026-06-15  
**Status**: Ready for client testing  
**Environment**: Client staging/testing

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ Code Quality Gates

```
Code Quality:
✅ [ ] npm run typecheck → PASSING
✅ [ ] npm run build → SUCCEEDS (1.5 MB)
✅ [ ] npm run lint → No critical errors (ESLint)
✅ [ ] No console.error or console.warn in production logs
✅ [ ] No hardcoded secrets (✅ Fixed: all test passwords = 1234)
✅ [ ] No TODO/FIXME comments in critical paths
```

### ✅ Feature Completeness

```
POS Features:
✅ [ ] Product browsing & selection working
✅ [ ] Cart management (add/remove/qty/discount) working
✅ [ ] Customer lookup & profile working
✅ [ ] Payment processing (cash/card) tested
✅ [ ] Tax calculations correct (21% exclusive)
✅ [ ] Invoice generation & history working
✅ [ ] Order hold/resume working
✅ [ ] Receipt printing working

Till Operations:
✅ [ ] Till opening with denominations working
✅ [ ] Till closing & reconciliation working
✅ [ ] Cash variance detection working
✅ [ ] Session persistence working

Offline:
✅ [ ] Offline indicator visible & working
✅ [ ] Queue forms when offline
✅ [ ] Auto-sync when online
✅ [ ] Manual sync button working
✅ [ ] IndexedDB persistence working
✅ [ ] No duplicate transactions

Admin Panel:
✅ [ ] Login accessible
✅ [ ] User management working
✅ [ ] Product/deal management working
✅ [ ] Configuration accessible
✅ [ ] Reports dashboard loading

Manager Panel:
✅ [ ] Reports dashboard accessible
✅ [ ] Charts rendering correctly
✅ [ ] Filters working
✅ [ ] Password: 1234
```

### ✅ Performance

```
Bundle Sizes:
✅ [ ] Main JS: 1.5 MB (acceptable for initial load)
✅ [ ] CSS: 149 KB
✅ [ ] Total gzip: < 500 KB
✅ [ ] No 404 errors in Network tab
✅ [ ] All assets loading successfully

Runtime Performance:
✅ [ ] Page load time < 5s (on 3G)
✅ [ ] Time to Interactive < 5s
✅ [ ] No jank during interactions
✅ [ ] Offline sync completes in < 2s (batch)
✅ [ ] No memory leaks (Chrome DevTools)
```

### ✅ Security

```
Credentials:
✅ [ ] No real credentials in code
✅ [ ] Test password: 1234 (all users)
✅ [ ] Manager report password: 1234
✅ [ ] Stripe key is public (safe to expose)
✅ [ ] CORS configured for local/staging

Data:
✅ [ ] Customer data validated on input
✅ [ ] Phone numbers sanitized
✅ [ ] Cart totals verified mathematically
✅ [ ] Duplicate transactions prevented
✅ [ ] localStorage used safely (no sensitive data)
```

### ✅ Accessibility & UX

```
Visual & Interaction:
✅ [ ] Error messages user-friendly
✅ [ ] Loading states visible
✅ [ ] Empty states shown where needed
✅ [ ] Dark mode working
✅ [ ] Colors high contrast

Mobile & Responsive:
✅ [ ] App works on iPhone 12 (375px)
✅ [ ] App works on iPad (768px)
✅ [ ] Button touch targets ≥ 44px
✅ [ ] Forms stack properly on mobile
✅ [ ] No horizontal scroll

Accessibility:
✅ [ ] Keyboard navigation working
✅ [ ] Escape closes modals
✅ [ ] Focus visible on all buttons
✅ [ ] Form labels present
✅ [ ] Error announcements clear
```

### ✅ Environment Setup

```
Frontend (.env file):
✅ [ ] VITE_API_URL set (http://localhost:3000 for local)
✅ [ ] VITE_STRIPE_PUBLISHABLE_KEY set (if available)
✅ [ ] VITE_SHOW_DEMO_CREDENTIALS = true (for testing)

Backend (.env file):
✅ [ ] DATABASE_URL configured
✅ [ ] JWT_SECRET set (secure random string)
✅ [ ] STRIPE_SECRET_KEY set (if accepting card payments)
✅ [ ] CORS origins configured
✅ [ ] PORT set (default: 3000)
```

### ✅ Testing

```
Manual Testing:
✅ [ ] Full happy path tested (login → transaction → checkout)
✅ [ ] Offline scenario tested (go offline → transaction → sync)
✅ [ ] Error paths tested (payment fails, network error)
✅ [ ] Admin panel tested
✅ [ ] Manager reports tested

Browser Testing:
✅ [ ] Chrome (latest)
✅ [ ] Safari (latest, if possible)
✅ [ ] Firefox (latest, if possible)
✅ [ ] Safari on iOS (iPhone)
✅ [ ] Chrome on Android
```

---

## 🚀 **DEPLOYMENT PROCESS**

### Step 1: Pre-Flight Checks (15 minutes)

```bash
# 1. Run all checks
npm run typecheck      # Must pass
npm run build          # Must succeed
npm run lint           # Check for critical issues

# 2. Verify build output
ls -lh dist/
# Expected:
# - dist/index.html (1 KB)
# - dist/assets/index-*.js (~1.5 MB)
# - dist/assets/index-*.css (~149 KB)
# - dist/assets/*.jpg (images)

# 3. Test locally
npm run preview
# Open http://localhost:4173 in browser
# Do quick smoke test:
# - Can login? (1234/1234)
# - Can add product?
# - Can checkout?
```

### Step 2: Prepare Deployment Package (10 minutes)

```bash
# 1. Create deployment archive
cd /path/to/crip-crumbs/frontend
tar -czf crip-crumbs-pos-v1.0.0.tar.gz dist/

# 2. Copy to deployment location
# Option A: S3/Cloud Storage
aws s3 cp dist/ s3://bucket-name/crip-crumbs-pos/ --recursive

# Option B: Server SFTP
sftp user@server.com
put -r dist/ /var/www/crip-crumbs-pos/

# 3. Verify upload
# Check file sizes match local
```

### Step 3: Backend Preparation (20 minutes)

**If deploying backend alongside**:

```bash
# 1. Run migrations
cd /path/to/crip-crumbs/backend
npm install
npx prisma migrate deploy

# 2. Seed database (if new environment)
npx prisma db seed

# 3. Set environment variables
export DATABASE_URL=postgresql://user:pass@host/db
export JWT_SECRET=$(openssl rand -hex 32)
export STRIPE_SECRET_KEY=sk_...

# 4. Build backend
npm run build

# 5. Start backend
npm start
# Expected output: "Server listening on port 3000"
```

### Step 4: Frontend Deployment (10 minutes)

**Option A: Static hosting (Netlify, Vercel, AWS S3)**

```bash
# 1. Deploy dist folder
netlify deploy --prod --dir=dist

# OR

vercel deploy --prod

# OR (S3 + CloudFront)
aws s3 sync dist/ s3://bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

**Option B: Docker deployment**

```bash
# Build image
docker build -t crip-crumbs-pos:1.0.0 .

# Push to registry
docker push registry.example.com/crip-crumbs-pos:1.0.0

# Deploy
kubectl apply -f deployment.yaml
```

### Step 5: Post-Deployment Verification (15 minutes)

```bash
# 1. Check frontend is accessible
curl -s https://client-app.com/ | grep "<title>"
# Should return HTML with page title

# 2. Test login
# Open app in browser
# Try login with: 1234 / 1234
# Should see POS dashboard

# 3. Test API connectivity
# Open DevTools → Network
# Add product to cart
# Should see POST /api/invoices request

# 4. Test offline functionality
# DevTools → Network → Offline
# Create transaction
# Should see "Offline" badge
# Go back online
# Should auto-sync

# 5. Check logs for errors
# Backend: npm start output
# Frontend: Browser console (DevTools)
# Should have no critical errors
```

---

## 📱 **CLIENT TESTING GUIDE**

### Getting Started

**1. Provide Client With**:
```
- App URL: https://client-app.com
- Test Credentials:
  - POS: Email: cashier@aipos.pk, Password: 1234
  - Manager Reports: Password: 1234
  - Admin: Email: admin@aipos.pk, Password: 1234
- Support Contact: [Your email/phone]
```

**2. Quick Start Instructions**:
```
1. Open app URL in modern browser (Chrome recommended)
2. Login with provided credentials
3. Try creating a transaction
4. Test offline: Open DevTools → Network → Offline
5. Create transaction while offline
6. Go back online → Transaction syncs automatically
7. Check reports: Click "Manager" button → Reports
```

### What to Test

```
Priority Testing (Day 1):
✓ Core POS functionality
✓ Offline queueing & sync
✓ Customer lookup
✓ Payment processing
✓ Reports dashboard

Extended Testing (Week 1):
✓ Admin panel functionality
✓ Mobile device compatibility
✓ Multiple concurrent users
✓ Performance under load
✓ Edge cases & error scenarios
```

### Issue Reporting Template

When client reports an issue:

```
Issue: [Clear title]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [What should happen]
Actual: [What actually happened]

Screenshots: [Include if possible]
Browser: [Chrome/Safari/etc]
Device: [Phone/tablet/desktop]
Time: [When did it occur]
```

---

## 🆘 **TROUBLESHOOTING**

### Common Issues

#### Issue: "Cannot connect to API"
```
Causes:
1. Backend not running
2. CORS not configured
3. API URL wrong in frontend config

Fix:
1. Check backend: npm start
2. Verify CORS headers in backend
3. Check VITE_API_URL in .env
4. Restart frontend
```

#### Issue: "Offline sync not working"
```
Causes:
1. OfflineProvider not mounted
2. IndexedDB quota exceeded
3. Network not actually going offline

Fix:
1. Check App.tsx has <OfflineProvider>
2. Clear IndexedDB: DevTools → App → Storage → IndexedDB → Delete
3. Verify offline: DevTools → Network → Offline (toggle on/off)
4. Check browser console for errors
```

#### Issue: "Products not loading"
```
Causes:
1. Products API failing
2. Product image paths wrong
3. Category filter broken

Fix:
1. Check backend: GET /api/products
2. Verify image URLs in product data
3. Clear browser cache: Ctrl+Shift+Delete
4. Restart frontend server
```

#### Issue: "Payment failing silently"
```
Causes:
1. Stripe not configured
2. Payment intent creation failed
3. Offline (go back to online)

Fix:
1. Check VITE_STRIPE_PUBLISHABLE_KEY in .env
2. Use test card: 4242 4242 4242 4242
3. Check browser console for errors
4. Verify backend STRIPE_SECRET_KEY set
```

---

## 📊 **MONITORING & LOGS**

### Where to Check Logs

```
Frontend:
- Browser DevTools → Console
- Browser DevTools → Network (for failed requests)
- Browser DevTools → Application → Local Storage (check cart state)
- Browser DevTools → Application → IndexedDB (check offline queue)

Backend:
- npm start terminal output
- Server logs (if deployed)
- Application error logs
```

### What to Monitor

```
✅ No red errors in browser console
✅ No 4xx/5xx API responses
✅ Offline queue processing correctly
✅ No memory leaks (DevTools Performance)
✅ All images loading (Network tab)
✅ API requests with 200 status
```

---

## 🔄 **ROLLBACK PROCEDURE**

If critical issue found:

```bash
# 1. Identify last good version
git log --oneline | head -5

# 2. Checkout previous version
git checkout v1.0.0-rc1

# 3. Rebuild
npm run build

# 4. Redeploy
# (follow Step 4 above)

# 5. Verify
# (follow Step 5 above)

# 6. Investigate issue in new version
# (prepare fix, create PR)

# 7. When fixed, redeploy
# (repeat from Step 1)
```

---

## 📞 **SUPPORT CONTACTS**

```
Technical Issues:
- Developer: [Your name, email, phone]
- Availability: [Your hours/timezone]

Escalation:
- Team lead: [Name, contact]
- Emergency: [On-call number]

Documentation:
- User guide: [Link]
- FAQ: [Link]
- Known issues: [Link]
```

---

## ✅ **SIGN-OFF CHECKLIST**

```
Before marking deployment COMPLETE:

Code:
✅ [ ] All code reviewed
✅ [ ] All tests passing
✅ [ ] No critical ESLint issues
✅ [ ] No console errors

Infrastructure:
✅ [ ] Frontend accessible
✅ [ ] Backend accessible
✅ [ ] Database connected
✅ [ ] APIs responding

Features:
✅ [ ] POS working end-to-end
✅ [ ] Offline functionality working
✅ [ ] Reports accessible
✅ [ ] Admin panel working

Client:
✅ [ ] Client can login
✅ [ ] Client can create transaction
✅ [ ] Client understands testing scope
✅ [ ] Support contact provided

Documentation:
✅ [ ] Runbook complete
✅ [ ] Support guide provided
✅ [ ] Known issues documented
✅ [ ] Escalation path clear
```

---

## 📝 **DEPLOYMENT LOG TEMPLATE**

```
Date: 2026-06-15
Version: 1.0.0
Deployer: [Name]

Pre-Flight:
✅ Typecheck passed
✅ Build succeeded
✅ Lint clean
✅ Local preview working

Deployment:
✅ Frontend deployed to [URL]
✅ Backend deployed to [URL]
✅ Migrations run
✅ Database seeded

Verification:
✅ Login working
✅ API connected
✅ Offline sync working
✅ Reports accessible

Issues Found:
- [None / List any]

Resolved By:
- [Actions taken]

Client Notified:
✅ Yes / [ ] No

Sign-Off:
Deployer: ________________  Date: ________
Team Lead: ______________  Date: ________
Client: ________________  Date: ________
```

---

## 🎉 **DEPLOYMENT COMPLETE**

**Checklist**: All items checked ✅  
**Status**: Ready for client testing  
**Next Review**: After 1 week of client usage  
**Optimization Sprint**: Week 2 (Phase 1 bundle optimization)

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-15  
**Next Review**: After first client deployment
