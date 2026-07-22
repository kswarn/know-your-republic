import { FileText, ScrollText } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import {
  CONSTITUTION_CITATION,
  CONSTITUTION_EDITIONS,
  CONSTITUTION_LAST_VERIFIED,
  CONSTITUTION_PARTS,
} from '../../../../content/constitution/constitution';
import { DomainShell } from '@/components/DomainShell';
import { LastVerified } from '@/components/LastVerified';
import { SourceLink } from '@/components/SourceLink';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'domain.laws' });
  return { title: t('title'), description: t('description') };
}

export default async function LawsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('domain.laws');
  const c = await getTranslations('constitution');

  return (
    <DomainShell title={t('title')} icon={ScrollText}>
      <div className="space-y-8">
        <p className="text-body whitespace-pre-line">{c('description')}</p>

        <section aria-labelledby="contents-heading">
          <h2 id="contents-heading" className="text-heading font-semibold">
            {c('contentsHeading')}
          </h2>
          <p className="text-small text-ink-muted mt-1">{c('contentsIntro')}</p>
          <div className="border-rule mt-3 overflow-x-auto border">
            <table className="text-small w-full border-collapse text-left">
              <thead>
                <tr className="border-rule bg-paper-raised border-b">
                  <th scope="col" className="p-3 font-medium">
                    {c('partColumn')}
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    {c('subjectColumn')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONSTITUTION_PARTS.map((row) => (
                  <tr key={row.part} className="border-rule border-b last:border-b-0">
                    <td className="p-3 align-top font-medium whitespace-nowrap">{row.part}</td>
                    <td className="p-3 align-top">{row.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="downloads-heading">
          <h2 id="downloads-heading" className="text-heading font-semibold">
            {c('downloadsHeading')}
          </h2>
          <p className="text-small text-ink-muted mt-1">{c('downloadsIntro')}</p>
          <div className="border-rule mt-3 overflow-x-auto border">
            <table className="text-small w-full border-collapse text-left">
              <thead>
                <tr className="border-rule bg-paper-raised border-b">
                  <th scope="col" className="p-3 font-medium">
                    {c('languageColumn')}
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    {c('fileColumn')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONSTITUTION_EDITIONS.map((edition) => (
                  <tr key={edition.languageCode} className="border-rule border-b last:border-b-0">
                    <td className="p-3 align-top font-medium">{edition.languageName}</td>
                    <td className="p-3 align-top">
                      <a
                        href={edition.fileUrl}
                        className="text-accent inline-flex items-center gap-1.5 underline underline-offset-2"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <FileText aria-hidden="true" className="size-4" />
                        {c('viewDownload')}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-meta text-ink-muted mt-2">{c('pendingLanguages')}</p>
        </section>

        <div className="border-rule space-y-2 border-t pt-4">
          <SourceLink citations={[CONSTITUTION_CITATION]} />
          <LastVerified date={CONSTITUTION_LAST_VERIFIED} />
        </div>
      </div>
    </DomainShell>
  );
}
