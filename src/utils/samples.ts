// Photos the image pages offer to try the tool without your own files. Both
// are from Wikimedia Commons; CC BY needs the credit shown wherever they are
// (SampleCredit, under the files and the results).
export const samplePhotos = [
  {
    url: '/samples/cardamom-buns.jpg',
    fileName: 'cardamom-buns.jpg',
    title: 'Cardamom buns',
    author: 'W.carter',
    source: 'https://commons.wikimedia.org/wiki/File:Cardamom_buns.jpg',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  {
    url: '/samples/winter-in-tatry-mountains.jpg',
    fileName: 'winter-in-tatry-mountains.jpg',
    title: 'Winter in Tatry Mountains - Poland',
    author: 'Radek Kucharski',
    source:
      'https://commons.wikimedia.org/wiki/File:Winter_in_Tatry_Mountains_-_Poland.jpg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
];

export async function fetchSamplePhotos(): Promise<File[]> {
  return Promise.all(
    samplePhotos.map(async ({ url, fileName }) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      return new File([await response.blob()], fileName, {
        type: 'image/jpeg',
      });
    }),
  );
}
