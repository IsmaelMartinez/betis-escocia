import { create } from 'storybook/internal/theming';

export default create({
  base: 'light',

  colorPrimary: '#00A651', // Betis Green
  colorSecondary: '#FFD700', // Gold Accent

  // UI
  appBg: 'white',
  appBorderColor: '#00A651',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: 'black',
  textInverseColor: 'rgba(255,255,255,0.9)',

  // Toolbar colors
  barTextColor: 'white',
  barSelectedColor: '#FFD700',
  barBg: '#00A651',

  // Form colors
  inputBg: 'white',
  inputBorder: 'silver',
  inputTextColor: 'black',
  inputBorderRadius: 4,

  brandTitle: 'Betis Storybook',
  brandUrl: 'https://www.betis.com', // Replace with actual URL
  brandImage: '/images/logo_no_texto.jpg', // Path to your logo in the public folder
  brandTarget: '_self',
});
