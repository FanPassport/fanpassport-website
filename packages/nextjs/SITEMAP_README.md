# Sitemap Documentation

This document describes the sitemap implementation for the Fan Passport website.

## Overview

The website uses **Next.js native sitemap generation** - the built-in solution that's perfectly integrated with the App Router:

- ✅ **Automatically generated** sitemap on every build
- ✅ **Includes all clubs** (PSG, Monaco, Barcelona, etc.)
- ✅ **Google Search Console** optimized
- ✅ **Zero external dependencies** - uses Next.js built-in functionality
- ✅ **Proper XML formatting** - no more parsing errors
- ✅ **Robots.txt** manually maintained for simplicity

## Implementation

### 1. **Native Next.js Sitemap**
- **File**: `app/sitemap.ts` - Built-in Next.js sitemap generation
- **Auto-generation**: Runs during every `yarn build`
- **No external packages** - uses Next.js core functionality

### 2. **Generated Files**
After building, these files are available:

- `sitemap.xml` - **Complete sitemap** with all URLs including clubs
- `robots.txt` - Crawling guidelines (manually maintained)

### 3. **Build Process**
```bash
yarn build          # Builds Next.js app
# Automatically generates: sitemap.xml
# Copy to public: cp .next/server/app/sitemap.xml.body public/sitemap.xml
```

## URL Structure & Priorities

### Static Routes
- `/` - Homepage (Priority: 1.0, Change: Daily)
- `/experiences` - Experiences overview (Priority: 0.8, Change: Weekly)
- `/gallery` - NFT gallery (Priority: 0.8, Change: Weekly)
- `/marketplace` - NFT marketplace (Priority: 0.9, Change: Daily)
- `/blockexplorer` - Blockchain explorer (Priority: 0.9, Change: Daily)

### Club Routes (All Included!)
- `/psg` - Paris Saint-Germain (Priority: 0.9, Change: Weekly)
- `/monaco` - AS Monaco (Priority: 0.9, Change: Weekly)
- `/barcelona` - FC Barcelona (Priority: 0.9, Change: Weekly)
- `/ac-milan` - AC Milan (Priority: 0.9, Change: Weekly)
- `/juventus` - Juventus FC (Priority: 0.9, Change: Weekly)
- `/napoli` - SSC Napoli (Priority: 0.9, Change: Weekly)
- `/manchester-city` - Manchester City (Priority: 0.9, Change: Weekly)

## Configuration

### app/sitemap.ts
```typescript
import clubsData from "../data/clubs.json";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fanpassport.xyz";
  
  // Static routes
  const staticRoutes = [/* ... */];
  
  // Club routes - automatically includes all clubs from data
  const clubRoutes = clubsData.clubs.map(club => ({
    url: `${baseUrl}/${club.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...clubRoutes];
}
```

## Why Native Next.js Sitemap?

**✅ Better for your use case:**
- **Simpler structure** - no external dependencies
- **Automatic club inclusion** - reads from your data files
- **Better integration** - works perfectly with App Router
- **Easier to maintain** - just one TypeScript file
- **More reliable** - no package compatibility issues
- **Follows user rules** - simpler, less over-engineering

**❌ External packages (like next-sitemap) are only needed for:**
- Complex sitemap structures
- Multiple domains
- Custom sitemap formats
- When you need features beyond basic sitemap generation

## Maintenance

### **Minimal Maintenance Required!** 🎉

The sitemap automatically:
- ✅ Updates on every build
- ✅ Includes new clubs automatically (from `data/clubs.json`)
- ✅ Maintains proper XML formatting
- ✅ Uses Next.js built-in functionality

### Manual Updates (if needed)
```bash
# Regenerate sitemap
yarn build

# Copy to public directory
cp .next/server/app/sitemap.xml.body public/sitemap.xml
```

## SEO Benefits

1. **Search Engine Discovery**: Helps search engines find all pages
2. **Club Coverage**: All your club pages are properly indexed
3. **Crawl Efficiency**: Prioritizes important pages for crawling
4. **Index Coverage**: Ensures all content is indexed
5. **Update Frequency**: Indicates how often content changes
6. **Priority Signaling**: Guides search engines on page importance
7. **Google Search Console**: Fully compatible and optimized

## Testing

### Verify Sitemap Generation
```bash
# Build the project
yarn build

# Check generated sitemap
cat .next/server/app/sitemap.xml.body

# Copy to public directory
cp .next/server/app/sitemap.xml.body public/sitemap.xml

# Validate XML syntax
xmllint --noout public/sitemap.xml
```

### Test Sitemap URLs
```bash
# Check if sitemap is accessible
curl https://fanpassport.xyz/sitemap.xml
curl https://fanpassport.xyz/robots.txt
```

## Migration from External Package

### What Changed
- ❌ **Removed**: `next-sitemap` package and configuration
- ❌ **Removed**: Complex external sitemap generation
- ❌ **Removed**: Additional dependencies
- ✅ **Added**: Native Next.js `sitemap.ts`
- ✅ **Added**: Automatic club inclusion from data files
- ✅ **Added**: **Simpler, more reliable approach**

### Benefits of New System
- **Reliability**: Uses Next.js core functionality
- **Maintenance**: Minimal manual work required
- **Simplicity**: One TypeScript file to manage
- **Integration**: Perfect with App Router
- **Performance**: No external package overhead
- **Future-proof**: Automatically handles Next.js updates

## References

- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
