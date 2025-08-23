# 🌐 Custom Domain Setup for ClinIQ

## 🎯 **Domain Registration Guide**

### **Recommended Domains for ClinIQ:**

| Domain | Cost/Year | Why Choose |
|--------|-----------|------------|
| **cliniq.com** | ~$12-15 | ⭐ Most professional, easy to remember |
| **cliniq.info** | ~$8-10 | ✅ Cost-effective, good for information |
| **cliniq.app** | ~$15-20 | ✅ Modern, app-focused |
| **cliniq.health** | ~$25-30 | ✅ Industry-specific, premium |
| **cliniq.tech** | ~$12-15 | ✅ Tech-focused, modern |

---

## 🏷️ **Step 1: Register Your Domain**

### **Option A: Namecheap (Recommended - Low Cost)**
1. Go to [Namecheap.com](https://namecheap.com)
2. Search for your preferred domain (e.g., `cliniq.com`)
3. Add to cart and checkout
4. **Enable these features:**
   - ✅ Privacy Protection (free)
   - ✅ Auto-renewal
   - ✅ DNS Management

### **Option B: GoDaddy**
1. Go to [GoDaddy.com](https://godaddy.com)
2. Search for your domain
3. **Note:** Usually more expensive than Namecheap

### **Option C: Google Domains**
1. Go to [domains.google](https://domains.google)
2. Search for your domain
3. **Note:** Now part of Squarespace

---

## 🚀 **Step 2: Deploy to Vercel**

### **Deploy Your App:**
```bash
# 1. Login to Vercel
vercel login

# 2. Deploy (first time)
vercel

# 3. Set environment variables in Vercel dashboard
# Go to Project Settings > Environment Variables

# 4. Deploy to production
vercel --prod
```

### **Environment Variables to Set in Vercel:**
```
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_key
VITE_REVERIE_API_ID=your_reverie_id
VITE_REVERIE_API_KEY=your_reverie_key
VITE_APP_ENVIRONMENT=production
VITE_APP_NAME=ClinIQ
```

---

## 🔧 **Step 3: Configure Custom Domain**

### **In Vercel Dashboard:**
1. Go to your project dashboard
2. Click **"Settings"** tab
3. Click **"Domains"** in the left sidebar
4. Click **"Add Domain"**
5. Enter your domain (e.g., `cliniq.com`)
6. Click **"Add"**

### **DNS Configuration:**

#### **For Namecheap:**
1. Go to Namecheap dashboard
2. Click **"Domain List"**
3. Click **"Manage"** next to your domain
4. Go to **"Advanced DNS"** tab
5. Add these records:

```
Type: A Record
Name: @
Value: 76.76.19.19
TTL: Automatic

Type: CNAME Record
Name: www
Value: cname.vercel-dns.com
TTL: Automatic
```

#### **For GoDaddy:**
1. Go to GoDaddy dashboard
2. Click **"DNS"** for your domain
3. Add these records:

```
Type: A Record
Name: @
Value: 76.76.19.19
TTL: 600

Type: CNAME Record
Name: www
Value: cname.vercel-dns.com
TTL: 600
```

---

## 🔒 **Step 4: SSL Certificate**

### **Automatic SSL Setup:**
- ✅ Vercel automatically provides SSL certificates
- ✅ HTTPS will be enabled automatically
- ✅ No additional cost

### **Verify SSL:**
1. Wait 5-10 minutes for DNS propagation
2. Visit `https://yourdomain.com`
3. Check for the green padlock in browser

---

## 📧 **Step 5: Email Setup (Optional)**

### **Professional Email Options:**

#### **Option A: Google Workspace**
- Cost: $6/month per user
- Professional: `admin@cliniq.com`
- Includes Gmail, Drive, Calendar

#### **Option B: Microsoft 365**
- Cost: $6/month per user
- Professional: `admin@cliniq.com`
- Includes Outlook, Teams, Office

#### **Option C: Zoho Mail**
- Cost: $1/month per user
- Professional: `admin@cliniq.com`
- Good for small businesses

---

## 🎨 **Step 6: Branding & SEO**

### **Update Your App:**
```javascript
// Update title and meta tags in index.html
<title>ClinIQ - AI-Powered Healthcare Assistant</title>
<meta name="description" content="Modern AI-powered healthcare assistant for multilingual medical consultations, documentation, and analysis.">
```

### **Add Favicon:**
1. Create a professional favicon (32x32, 16x16)
2. Place in `public/favicon.ico`
3. Update `index.html`:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
```

---

## 📊 **Step 7: Analytics Setup**

### **Google Analytics (Free):**
1. Go to [Google Analytics](https://analytics.google.com)
2. Create account and property
3. Add tracking code to your app:

```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **Vercel Analytics (Free):**
```bash
npm install @vercel/analytics
```

```javascript
// Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

// Add inside your app component
<Analytics />
```

---

## 🔍 **Step 8: SEO Optimization**

### **Meta Tags:**
```html
<!-- Add to index.html -->
<meta name="keywords" content="healthcare, AI, medical, consultation, speech recognition, multilingual">
<meta name="author" content="ClinIQ">
<meta property="og:title" content="ClinIQ - AI Healthcare Assistant">
<meta property="og:description" content="Modern AI-powered healthcare assistant">
<meta property="og:image" content="https://cliniq.com/og-image.png">
<meta property="og:url" content="https://cliniq.com">
<meta name="twitter:card" content="summary_large_image">
```

### **Sitemap:**
Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cliniq.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cliniq.com/consultation</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**DNS Not Propagating:**
- Wait 24-48 hours for full propagation
- Use [whatsmydns.net](https://whatsmydns.net) to check
- Clear browser cache

**SSL Certificate Issues:**
- Wait 5-10 minutes after DNS setup
- Check Vercel dashboard for SSL status
- Contact Vercel support if needed

**Domain Not Working:**
- Verify DNS records are correct
- Check Vercel domain settings
- Ensure domain is added to Vercel project

---

## 💰 **Total Cost Breakdown**

| Service | Cost/Year | Notes |
|---------|-----------|-------|
| **Domain** | $12-15 | cliniq.com |
| **Hosting** | $0 | Vercel free tier |
| **SSL Certificate** | $0 | Free with Vercel |
| **Email** | $0-72 | Optional |
| **Analytics** | $0 | Google Analytics free |
| **Total** | **$12-87/year** | Very cost-effective! |

---

## 🎯 **Final Checklist**

- [ ] Domain registered
- [ ] App deployed to Vercel
- [ ] Custom domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Analytics setup
- [ ] SEO meta tags added
- [ ] Favicon uploaded
- [ ] Email configured (optional)

---

## 🚀 **Next Steps**

1. **Register your domain** (recommend cliniq.com)
2. **Deploy to Vercel** using the commands above
3. **Configure DNS** as shown
4. **Set up analytics** for tracking
5. **Test everything** thoroughly

Your professional ClinIQ application will be live at `https://cliniq.com`! 🎉
