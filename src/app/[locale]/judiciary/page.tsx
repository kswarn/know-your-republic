import { Gavel } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { DomainShell } from "@/components/DomainShell";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "domain.judiciary" });
  return { title: t("title"), description: t("description") };
}

export default async function JudiciaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("domain.judiciary");

  return (
    <DomainShell title={t("title")} icon={Gavel} />
  );
}
