import ogImage from "@/assets/og-image.jpg";
import logo from "@/assets/h!logo.png";
import { CONTACT_EMAIL, SOCIALS } from "@/data/hideas";

/** The live address. Link previews and search engines need full URLs, not paths. */
export const SITE_URL = "https://hideas.ca";
export const SITE_NAME = "Hideas Socials and Ceremony";
export const SITE_DESCRIPTION =
  "Intimate gatherings, curated social events and small private ceremonies in Vancouver and Central BC.";

export const SERVICE_AREAS = ["Vancouver", "Kelowna", "West Kelowna", "Lake Country", "Vernon"];

const OG_IMAGE_URL = `${SITE_URL}${ogImage}`;

/** Title, description and the matching Open Graph / Twitter tags for one page. */
export function pageMeta({
  title,
  description,
  path = "/",
  shareTitle = title,
}: {
  title: string;
  description: string;
  path?: string;
  /** The shorter title shown on link previews in messages and social apps. */
  shareTitle?: string;
}) {
  const url = `${SITE_URL}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "en_CA" },
    { property: "og:url", content: url },
    { property: "og:title", content: shareTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: OG_IMAGE_URL },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Guests in headphones meditating together in a forest clearing" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: shareTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE_URL },
  ];
}

/** Structured data telling search engines who Hideas is and which towns it serves. */
export const LOCAL_BUSINESS_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Hideas",
  alternateName: SITE_NAME,
  description:
    "Hideas hosts curated social events and small private plant medicine ceremonies across British Columbia, from Vancouver to Central BC.",
  url: SITE_URL,
  logo: `${SITE_URL}${logo}`,
  image: OG_IMAGE_URL,
  email: CONTACT_EMAIL,
  address: { "@type": "PostalAddress", addressRegion: "BC", addressCountry: "CA" },
  areaServed: SERVICE_AREAS.map((name) => ({
    "@type": "City",
    name,
    containedInPlace: { "@type": "AdministrativeArea", name: "British Columbia" },
  })),
  sameAs: SOCIALS.filter((s) => s.label !== "WhatsApp").map((s) => s.href),
});
