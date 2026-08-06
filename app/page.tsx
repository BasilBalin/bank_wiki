import type { Metadata } from "next";
import WikiApp from "./WikiApp";

export const metadata: Metadata = {
  title: "Клиентская база УК — БанкВики",
  description:
    "Вводная страница о клиентах, событиях и жизненном цикле в управляющей компании.",
};

export default function Home() {
  return <WikiApp pageId="client-base" />;
}
