import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";

const SECTIONS = [
  { href: "/me", key: "me" },
  { href: "/people", key: "people" },
  { href: "/laws", key: "laws" },
  { href: "/rights", key: "rights" },
  { href: "/judiciary", key: "judiciary" },
] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const site = await getTranslations("site");

  const links = SECTIONS.map(({ href, key }) => (
    <NavLink key={href} href={href}>
      {t(key)}
    </NavLink>
  ));

  return (
    <header className="border-rule relative border-b">
      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="text-brand text-heading font-semibold no-underline"
        >
          {site("name")}
        </Link>
        <nav aria-label={site("name")} className="flex items-center">
          <MobileNav
            links={links}
            languageSwitcher={<LanguageSwitcher />}
            menuLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
          />
        </nav>
      </div>
    </header>
  );
}
