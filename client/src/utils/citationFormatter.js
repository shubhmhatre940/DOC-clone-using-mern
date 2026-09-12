/**
 * Formats citations and bibliography entries based on APA, MLA, and Chicago styles.
 */

export function formatInTextCitation({ author = '', year = '', page = '', style = 'APA' }) {
  const cleanAuthor = author.trim() || 'Anonymous';
  const cleanYear = year.trim() || 'n.d.';
  const cleanPage = page.trim();

  switch (style) {
    case 'MLA':
      return `(${cleanAuthor}${cleanPage ? ` ${cleanPage}` : ''})`;
    case 'Chicago':
      return `(${cleanAuthor} ${cleanYear}${cleanPage ? `, ${cleanPage}` : ''})`;
    case 'APA':
    default:
      return `(${cleanAuthor}, ${cleanYear}${cleanPage ? `, p. ${cleanPage}` : ''})`;
  }
}

export function formatBibliographyEntry({
  author = '',
  title = '',
  year = '',
  source = '',
  url = '',
  style = 'APA'
}) {
  const cleanAuthor = author.trim() || 'Anonymous';
  const cleanTitle = title.trim() || 'Untitled Work';
  const cleanYear = year.trim() || 'n.d.';
  const cleanSource = source.trim();
  const cleanUrl = url.trim();

  switch (style) {
    case 'MLA': {
      // Author. Title. Publisher/Source, Year, URL.
      let entry = `${cleanAuthor}. *${cleanTitle}*.`;
      if (cleanSource) entry += ` ${cleanSource},`;
      entry += ` ${cleanYear}.`;
      if (cleanUrl) entry += ` ${cleanUrl}.`;
      return entry;
    }

    case 'Chicago': {
      // Author. Year. Title. Source. URL.
      let entry = `${cleanAuthor}. ${cleanYear}. *${cleanTitle}*.`;
      if (cleanSource) entry += ` ${cleanSource}.`;
      if (cleanUrl) entry += ` ${cleanUrl}.`;
      return entry;
    }

    case 'APA':
    default: {
      // Author. (Year). Title. Source. URL
      let entry = `${cleanAuthor} (${cleanYear}). *${cleanTitle}*.`;
      if (cleanSource) entry += ` ${cleanSource}.`;
      if (cleanUrl) entry += ` ${cleanUrl}`;
      return entry;
    }
  }
}
