import defaultTheme from './mongodb.js';

export default Object.assign({}, defaultTheme, {
  // Base colors
  paletteWhite: '#FFFFFF',
  paletteBlack: '#1E2C39', // *
  // Gray
  paletteGrayBase: '#3C5469', // *
  paletteGrayLight1: '#5A768F', // *
  paletteGrayLight2: '#B3C7DB', // *
  paletteGrayLight3: '#F3F5F8', // *
  paletteGrayDark1: '#334657', // *
  paletteGrayDark2: '#243442', // *
  paletteGrayDark3: '#21313F', // *
  paletteGrayDark4: '#17232E', // *
  // Green
  paletteGreenBase: '#0BA264', // *
  paletteGreenLight1: '#0BB06D', // *
  paletteGreenLight2: '#13C17B', // *
  paletteGreenLight3: '#2CE89C', // *
  paletteGreenDark1: '#14835C', // *
  paletteGreenDark2: '#0F6446', // *
  paletteGreenDark3: '#0F6446', // *
  // Purple
  palettePurpleBase: '#B45AF2',
  palettePurpleLight2: '#F1D4FD',
  palettePurpleLight3: '#F9EBFF',
  palettePurpleDark2: '#5E0C9E',
  palettePurpleDark3: '#2D0B59',
  // Blue
  paletteBlueBase: '#336FEE', // *
  paletteBlueLight1: '#3879F2', // *
  paletteBlueLight2: '#428BF9', // *
  paletteBlueLight3: '#62A1FF', // *
  paletteBlueDark1: '#2458C7', // *
  paletteBlueDark2: '#1F50BA', // *
  paletteBlueDark3: '#173D8D', // *
  // Yellow
  paletteYellowBase: '#FAB619', // *
  paletteYellowLight2: '#FED984', // *
  paletteYellowLight3: '#FEF7DB',
  paletteYellowDark2: '#8B6C21', // *
  paletteYellowDark3: '#5F4F24', // *
  // Red
  paletteRedBase: '#BB3340', // *
  paletteRedLight1: '#D53645', // *
  paletteRedLight2: '#EC4756', // *
  paletteRedLight3: '#FF7584', // *
  paletteRedDark2: '#87202C', // *
  paletteRedDark3: '#4C2832', // *
  // Links
  linkColor: ['palette-blue-base', 'palette-blue-light-2']
});
