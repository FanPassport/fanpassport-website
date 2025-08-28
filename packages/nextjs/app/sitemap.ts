import clubsData from "../data/clubs.json";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fanpassport.xyz";

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/experiences`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/debug`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blockexplorer`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ];

  // Club routes - only the main club pages
  const clubRoutes = clubsData.clubs.map(club => ({
    url: `${baseUrl}/${club.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // API routes
  const apiRoutes = [
    {
      url: `${baseUrl}/api/clubs`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/api/experiences`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/api/nft`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/api/contract`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...clubRoutes, ...apiRoutes];
}
