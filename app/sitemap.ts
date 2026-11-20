import type { MetadataRoute } from "next";
import { privacyPolicyMeta } from "@/constants/privacy-policy";
import { siteConfig } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", privacyPolicyMeta.path].map((path) => ({
    url: new URL(path, siteConfig.url).href,
  }));
}
