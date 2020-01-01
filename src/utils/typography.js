import Typography from 'typography';

const typography = new Typography({
  baseFontSize: '16px',
  baseLineHeight: 1.64,
  headerFontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  bodyFontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  overrideStyles: ({ adjustFontSizeTo, rhythm }, options, styles) => ({
    h1: {
      ...adjustFontSizeTo('32px'),
      fontWeight: '400',
    },
    h2: {
      ...adjustFontSizeTo('28px'),
      fontWeight: '500',
    },
    h3: {
      ...adjustFontSizeTo('26px'),
      fontWeight: '600',
    },
    h4: {
      ...adjustFontSizeTo('22px'),
      fontWeight: '600',
    },
    h5: {
      ...adjustFontSizeTo('18px'),
      fontWeight: '700',
    },
  }),
});

export default typography;
