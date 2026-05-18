import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return [{ lang: 'uk' }, { lang: 'ru' }, { lang: 'en' }];
}

export default async function ToolsRedirectPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/studio`);
}
