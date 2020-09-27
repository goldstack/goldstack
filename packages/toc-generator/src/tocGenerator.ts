export interface Heading {
  title: string;
  id: string;
  subheadings: Heading[];
}

const generateLevel = (
  root: cheerio.Cheerio,
  level: number,
  $: cheerio.Root
): Heading[] => {
  const headings = root
    .find(`h${level}`)
    .add(root.filter(`h${level}`))
    .toArray();
  if (headings.length === 0) {
    return [];
  }
  return headings.map((heading, idx) => {
    const headingEl = $(heading);
    let id = headingEl.attr('id');
    if (!id) {
      id = $(headingEl.children('span').toArray()[0]).attr('id');
    }

    if (!id) {
      console.warn('Generating heading without id: ', headingEl.text().trim());
    }

    let headerChildren: cheerio.Cheerio;
    if (idx < headings.length - 1) {
      headerChildren = headingEl.nextUntil($(headings[idx + 1]));
    } else {
      headerChildren = headingEl.nextAll();
    }

    return {
      title: headingEl.text().trim(),
      id: id || 'unknown',
      subheadings: generateLevel(headerChildren, level + 1, $),
    };
  });
};

export const generateToc = ($: cheerio.Root): Heading[] => {
  return generateLevel($.root(), 2, $);
};
