import defaultTheme from './mongodb.js';

export default Object.assign({}, defaultTheme, {
  // Base colors
  paletteWhite: '#FFFFFF', // *
  paletteBlack: '#181A20', // *
  // Gray
  paletteGrayBase: '#848E9C',
  paletteGrayLight1: '#B7BDC6', // *
  paletteGrayLight2: '#EAECEF', // *
  paletteGrayLight3: '#F9FBFA',
  paletteGrayDark1: '#474D57', // *
  paletteGrayDark2: '#40464F', // *
  paletteGrayDark3: '#1C2D38',
  paletteGrayDark4: '#0B0E11', // *
  // Green
  paletteGreenBase: '#F0B90B', // *
  paletteGreenLight1: '#FCD535', // *
  paletteGreenLight2: '#FCF0C6', // *
  paletteGreenLight3: '#FAF3E0', // *
  paletteGreenDark1: '#EC8D42', // *
  paletteGreenDark2: '#B66C32', // *
  paletteGreenDark3: '#3C2601', // *
  // Purple
  palettePurpleBase: '#B45AF2',
  palettePurpleLight2: '#F1D4FD',
  palettePurpleLight3: '#F9EBFF',
  palettePurpleDark2: '#5E0C9E',
  palettePurpleDark3: '#2D0B59',
  // Blue
  paletteBlueBase: '#1F8DF9', // *
  paletteBlueLight1: '#0498ED', // *
  paletteBlueLight2: '#C3E7FE', // *
  paletteBlueLight3: '#E1F7FF', // *
  paletteBlueDark1: '#297FD4', // *
  paletteBlueDark2: '#15589a', // *
  paletteBlueDark3: '#0a2559', // *
  // Yellow
  paletteYellowBase: '#C99400', // *
  paletteYellowLight2: '#F0B90B', // *
  paletteYellowLight3: '#FEF7DB', // *
  paletteYellowDark2: '#B66C32', // *
  paletteYellowDark3: '#3C2601', // *
  // Red
  paletteRedBase: '#F6465D', // *
  paletteRedLight1: '#FF6960',
  paletteRedLight2: '#FFCDC7',
  paletteRedLight3: '#FFEAE5',
  paletteRedDark2: '#970606',
  paletteRedDark3: '#5B0000',
  // Links
  linkColor: ['palette-yellow-base', 'palette-yellow-light-2']
});
