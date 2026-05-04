export const DEFAULT_IMAGE_MODEL = 'gpt-image-1';

export const DEFAULT_IMAGE_SIZE = '1024x1024';

export const LAYOUTS = {
  '1x1': {
    hero: {width: 1536, height: 1024, x: -256, y: 0},
    product: {width: 830, height: 635, x: 97, y: 335},
    name: {font: 75, x: 145, y: 100},
    message: {font: 40, x: 45, y: 240}
  },
  '9x16': {
    hero: {width: 2880, height: 1920, x: -300, y: 0},
    product: {width: 960, height: 735, x: 60, y: 590},
    name: {font: 96, x: 55, y: 150},
    message: {font: 40, x: 75, y: 1765}
  },
  '16x9': {
    hero: {width: 1920, height: 1280, x: 0, y: -100},
    product: {width: 960, height: 735, x: 480, y: 235},
    name: {font: 96, x: 460, y: 150},
    message: {font: 40, x: 495, y: 1000}
  }
};

export const RATIOS = [
  {name: '1x1', width: 1024, height: 1024},
  {name: '9x16', width: 1080, height: 1920},
  {name: '16x9', width: 1920, height: 1080}
];
