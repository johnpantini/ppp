import defaultTheme from './tinkoff.js';

export default Object.assign({}, defaultTheme, {
  // Base colors
  paletteWhite: '#FFFFFF',
  paletteBlack: '#181A20',
  // Gray
  paletteGrayBase: '#707A8A',
  paletteGrayLight1: '#B7BDC6',
  paletteGrayLight2: '#EAECEF',
  paletteGrayLight3: '#F5F5F5',
  paletteGrayDark1: '#474d57',
  paletteGrayDark2: '#252930',
  paletteGrayDark3: '#20262d',
  paletteGrayDark4: '#181E25',
  // Green (yellow)
  paletteGreenBase: '#C99400',
  paletteGreenLight1: '#F0B90B',
  paletteGreenLight2: '#FCD535',
  paletteGreenLight3: '#FFEF87',
  paletteGreenDark1: '#A37200',
  paletteGreenDark2: '#8D5F02',
  paletteGreenDark3: '#6A4403',
  // Purple (green)
  palettePurpleBase: '#1CD264',
  palettePurpleLight2: '#4EE088',
  palettePurpleLight3: '#85F2BE',
  palettePurpleDark2: '#0ECB81',
  palettePurpleDark3: '#03A66D',
  // Blue
  paletteBlueBase: '#328DFD',
  paletteBlueLight1: '#5CA7F7',
  paletteBlueLight2: '#82C1FC',
  paletteBlueLight3: '#AAD8FD',
  paletteBlueDark1: '#1773EB',
  paletteBlueDark2: '#1D53AB',
  paletteBlueDark3: '#153263',
  // Yellow
  paletteYellowBase: '#F0B90B',
  paletteYellowLight2: '#FCD535',
  paletteYellowLight3: '#FFEF87',
  paletteYellowDark2: '#C99400',
  paletteYellowDark3: '#A37200',
  // Red
  paletteRedBase: '#E33B54',
  paletteRedLight1: '#F6465D',
  paletteRedLight2: '#FF707E',
  paletteRedLight3: '#FF99A0',
  paletteRedDark1: '#CF304A',
  paletteRedDark2: '#A81E3A',
  paletteRedDark3: '#82112B',
  // Links
  linkColor: ['palette-yellow-dark-2', 'palette-yellow-light-2'],
  // Buy and sell
  positive: ['palette-purple-dark-2', 'palette-purple-base'],
  negative: ['palette-red-dark-1', 'palette-red-light-1'],
  buy: ['palette-purple-dark-2', 'palette-purple-base'],
  sell: ['palette-red-dark-1', 'palette-red-light-1'],
  buyHover: ['palette-purple-base', 'palette-purple-light-2'],
  sellHover: ['palette-red-base', 'palette-red-base'],
  // Charts
  chartUpColor: ['palette-purple-dark-2', 'palette-purple-dark-2'],
  chartDownColor: ['palette-red-light-1', 'palette-red-light-1'],
  chartBorderUpColor: ['palette-purple-dark-2', 'palette-purple-dark-2'],
  chartBorderDownColor: ['palette-red-light-1', 'palette-red-light-1'],
  chartWickUpColor: ['palette-purple-dark-2', 'palette-purple-dark-2'],
  chartWickDownColor: ['palette-red-light-1', 'palette-red-light-1']
});
