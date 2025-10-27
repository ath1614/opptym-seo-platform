import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opptym.com'
  const lastModified = new Date()

  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/docs`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/seo-tips`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/privacy-policy`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/terms-of-service`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/refund-policy`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ]
}