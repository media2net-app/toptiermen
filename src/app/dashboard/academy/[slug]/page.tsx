import ModulePageClient from './ModulePageClient';

export const revalidate = 0;

export default function ModulePage({ params }: { params: { slug: string } }) {
  return <ModulePageClient initialModuleId={params.slug} />;
}
