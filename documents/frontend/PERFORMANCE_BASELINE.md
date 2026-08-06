# Performance Baseline & Optimization Roadmap

**Baseline Date**: 2026-06-14  
**Build**: Production build with offline sync + validation schemas

---

## 📊 Current Metrics

### Bundle Size

| Metric | Size | Gzip | Target | Status |
|--------|------|------|--------|--------|
| **Main JS** | 1,498 KB | 399 KB | < 1000 KB | ⚠️ Over |
| **CSS** | 149 KB | 23 KB | < 100 KB | ⚠️ Over |
| **Images** | 185 KB | - | < 200 KB | ✅ OK |
| **Total** | 1,832 KB | 422 KB | < 1500 KB | ⚠️ Monitor |

### Core Web Vitals (Estimated)

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| LCP (Largest Contentful Paint) | ~2.5s | < 2.5s | ⚠️ Monitor |
| FID (First Input Delay) | < 100ms | < 100ms | ✅ Good |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.1 | ✅ Good |
| Time to Interactive | ~3.5s | < 3s | ⚠️ Needs improvement |

### Network Requests

```
Initial Page Load:
- HTML: 1 request
- Main JS: 1 request (1.5 MB)
- CSS: 1 request (149 KB)
- Images: 6 requests (185 KB)
- Total: 9 requests, 1.8 MB

After Click (Manager Reports):
- Lazy chunk: 1 request (3.3 KB)
- API calls: Varies

Offline queue operations:
- IndexedDB: ~50 read/write ops per sync batch
- Network: 1 batch request (instead of 20 individual)
```

---

## 🔍 Bundle Composition Analysis

### Top Dependencies by Size

```
Main Chunk Contents (estimated):
├─ React + React-DOM: ~150 KB (gzip)
├─ Radix UI (20 packages): ~100 KB (gzip)
├─ TanStack React Query: ~50 KB (gzip)
├─ Tailwind CSS: ~40 KB (gzip)
├─ Recharts (charts): ~45 KB (gzip)
├─ Socket.io client: ~35 KB (gzip)
├─ Stripe JS: ~30 KB (gzip)
├─ App code (components, contexts): ~200 KB (unminified)
└─ Other dependencies: ~200 KB (gzip)
```

### What's NOT Code-Split

❌ All admin pages bundled with main chunk (even if not accessed)
❌ Manager reports panel is lazy (✅ good), but others aren't
❌ Heavy libraries loaded upfront:
  - Recharts (not needed until /manager page)
  - Socket.io (not needed until /kitchen page)
  - All Radix UI components (even unused ones)

---

## 🎯 Optimization Roadmap

### Phase 1: Code-Splitting (1-2 hours) ⭐ PRIORITY

**Target**: Reduce main chunk to < 1300 KB

#### 1.1 Lazy-Load Admin Section
```typescript
// Before: All admin pages in main bundle
import AdminUsers from './pages/admin/AdminUsers';

// After: Load on demand
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
```

**Impact**: -400-500 KB from main chunk  
**Cost**: Minimal (add Suspense boundary)

#### 1.2 Lazy-Load Kitchen Page
```typescript
const KitchenPage = lazy(() => import('./pages/KitchenPage'));
// Also lazy-load: socket.io-client, OrderProvider
```

**Impact**: -100 KB + defer socket.io  
**Cost**: Low

#### 1.3 Lazy-Load Heavy Charts
```typescript
// Recharts only needed on /manager
const ManagerReportDashboard = lazy(() => import('...'));
```

**Impact**: -45 KB  
**Cost**: Already done ✅

---

### Phase 2: Dependency Optimization (1-2 hours)

**Target**: Reduce main chunk to < 1200 KB

#### 2.1 Tree-Shake Unused Radix UI
Currently bundling all 20 Radix packages, but only using 15.

**Action**: Run build analyzer, identify unused imports
**Impact**: -20-30 KB

#### 2.2 Replace Recharts with Lightweight Alternative (Optional)
- Current: Recharts 45 KB (gzip)
- Alternative: Nivo (50 KB), or custom with D3 (20 KB)
- **Cost**: High (breaking changes to chart API)
- **Decision**: Defer unless client demands lighter charts

#### 2.3 Optimize Socket.io Bundle
- Current: socket.io-client 35 KB
- Lazy-load only for /kitchen page
- **Impact**: -35 KB from initial load
- **Effort**: Medium (conditional provider)

---

### Phase 3: Advanced Optimizations (3-4 hours)

**Target**: < 1000 KB (production goal)

#### 3.1 Code Minification & Compression
- Enable source map removal in production
- Configure Vite terser options
- **Impact**: -5-10% additional

#### 3.2 Cache-Busting Strategy
- Add webpack-bundle-analyzer for detailed insights
- Implement CDN caching for chunks
- **Impact**: Faster repeat visits

#### 3.3 Service Worker Optimization
- Cache common assets
- Precache critical routes
- **Impact**: -50% load time on repeat visits

#### 3.4 Image Optimization
- Currently 185 KB for 6 images
- Compress further with ImageOptim
- Consider WebP format
- **Impact**: -30-40 KB

---

## 📈 Performance Optimization Priority Matrix

| Initiative | Effort | Impact | Priority |
|-----------|--------|--------|----------|
| Lazy-load admin | 1h | 400 KB | 🔴 DO FIRST |
| Lazy-load kitchen | 1h | 100 KB | 🟡 HIGH |
| Tree-shake Radix | 30m | 30 KB | 🟡 HIGH |
| Image compression | 15m | 40 KB | 🟡 HIGH |
| Source maps removal | 30m | 10 KB | 🟡 HIGH |
| Socket.io lazy-load | 1h | 35 KB | 🟡 HIGH |
| Recharts alternative | 3h | 45 KB | 🟢 LOW (optional) |
| Service Worker | 2h | 50% repeat | 🟢 LATER |

---

## 🚀 Recommended Next Steps

### Week 1 (Client Testing)
- [ ] Bundle size monitoring in place ✅
- [ ] Monitor real-world performance with client
- [ ] Collect Core Web Vitals data

### Week 2 (Performance Sprint)
- [ ] **IMPLEMENT Phase 1**: Code-split admin & kitchen
- [ ] Target: 1.3 MB → 1.0 MB
- [ ] Estimated effort: 3-4 hours

### Week 3+ (Advanced)
- [ ] Phase 2: Dependency optimization
- [ ] Phase 3: Service Worker caching
- [ ] Target: < 800 KB + 50% faster repeats

---

## 📊 Monitoring & Tracking

### Build-Time Checks
Create a CI check that fails if:
```
Main chunk > 1.5 MB
CSS bundle > 200 KB
Total > 2 MB
```

### Runtime Metrics (In Browser)
Track with Sentry/LogRocket:
- Page load time
- Time to interactive
- JavaScript execution time
- Memory usage (on lower-end devices)

### Test Plan
```
✅ Test on 3G network (Chrome DevTools)
✅ Test on low-end device (Moto G4 simulation)
✅ Test on high-end device (iPhone 12)
✅ Measure LCP, FID, CLS
✅ Verify offline queue performs well
```

---

## 🔐 Bundle Size History

| Date | Main | CSS | Total | Notes |
|------|------|-----|-------|-------|
| 2026-06-14 | 1498 KB | 149 KB | 1647 KB | Baseline with validation |
| - | - | - | - | - |
| - | - | - | - | - |

---

## 💡 Pro Tips

1. **Use Chrome DevTools → Network**: Sort by size, see what's being loaded
2. **Build Analyzer**: `npm run build -- --mode analyze` (when plugin added)
3. **Lighthouse**: Run in Chrome DevTools → Lighthouse tab
4. **Mobile Testing**: Test on actual device, not just DevTools simulation

---

## 📞 Questions?

For bundle questions, check:
- `src/App.tsx` - Route configuration
- `vite.config.ts` - Build configuration
- `.bundlebudget.json` - Size targets
- `package.json` - Dependency list

---

**Next Review**: After Phase 1 implementation (~2026-06-21)
