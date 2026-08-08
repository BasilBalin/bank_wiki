import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WikiApp from "../WikiApp";
import {
  FOUNDATION_PAGE_IDS,
  FOUNDATION_PAGES,
  isFoundationPageId,
} from "../foundation-content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return FOUNDATION_PAGE_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isFoundationPageId(slug)) return {};
  const page = FOUNDATION_PAGES[slug];

  return {
    title: page.title,
    description: page.summary,
  };
}

export default async function FoundationPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isFoundationPageId(slug)) notFound();

  return <WikiApp pageId={slug} />;
}
