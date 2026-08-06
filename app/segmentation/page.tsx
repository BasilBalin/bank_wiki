import type { Metadata } from "next";
import WikiApp from "../WikiApp";

export const metadata: Metadata = {
  title: "Сегментация клиентской базы",
  description:
    "Как делить клиентскую базу УК на полезные для коммуникаций сегменты.",
};

export default function SegmentationPage() {
  return <WikiApp pageId="segmentation" />;
}
