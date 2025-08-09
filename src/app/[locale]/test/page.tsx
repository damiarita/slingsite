import { getDictionary, Locale } from "@/i18n/lib";

export default async function ImageCompressionPage({ params }: {params:Promise<{locale:Locale}>}) {
  const {locale} = await params;
  const dictionary = await getDictionary(locale);
  return (
    <div className="container mx-auto px-4 py-8">
      {dictionary.navigation.imageCompressor}
    </div>
  );
}