const optionList = [
  {
    name: 'help',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'action',
    type: String,
    defaultValue: 'lines',
    typeLabel: '{bold.green lines}',
    defaultOption: true,
    description: 'Do you want to draw your fishies in a spiral or as a set of lines? {bold lines OR spiral}'
  },
  {
    name: 'destination',
    alias: 'd',
    type: String,
    typeLabel: '{bold.green /out}',
    defaultValue: 'out',
    description: 'Destination folder for the output png\'s'
  },
  {
    name: 'framerate',
    type: Number,
    defaultValue: 1,
    typeLabel: '{bold.green 1}',
    description: 'How many frames per second will you want when stitching together output images?'
  },
  {
    name: 'duration',
    type: Number,
    defaultValue: 1,
    typeLabel: '{bold.green 1}',
    description: 'How many seconds long will you want the resulting video to be?'
  },
  {
    name: 'width',
    alias: 'w',
    type: Number,
    defaultValue: 2000,
    typeLabel: '{bold.green 2000}',
    group: 'drawing',
    description: 'Width of output image, in px'
  },
  {
    name: 'height',
    alias: 'h',
    type: Number,
    defaultValue: 2000,
    typeLabel: '{bold.green 2000}',
    group: 'drawing',
    description: 'Height of output image, in px'
  },
  {
    name: 'bgcolor',
    alias: 'b',
    type: String,
    defaultValue: '0,0,0',
    typeLabel: '{bold.green 0,0,0}',
    group: 'drawing',
    description: 'Background color of the output images in R,G,B, e.g. 255,255,255'
  },
  {
    name: 'fishcolor',
    alias: 'c',
    type: String,
    defaultValue: '255,255,255',
    typeLabel: '{bold.green 255,255,255}',
    group: 'drawing',
    description: 'Color of the fishies in R,G,B, e.g. 255,0,0'
  },
  {
    name: 'steps',
    alias: 's',
    type: Number,
    defaultValue: 25,
    typeLabel: '{bold.green 25}',
    group: 'drawing',
    description: 'Number of complete sections of spiral in the image if drawing spiral or number of lines if drawing lines. {bold use a positive integer}'
  },
  {
    name: 'startingradius',
    alias: 'r',
    type: Number,
    defaultValue: 40,
    typeLabel: '{bold.green 40}',
    group: 'drawing',
    description: 'Radius of the innermost spiral section, if drawing spiral.'
  },
  {
    name: 'spiralseparation',
    alias: 'l',
    type: Number,
    defaultValue: 30,
    typeLabel: '{bold.green 30}',
    group: 'drawing',
    description: 'Distance from one spiral section to the next, if drawing spiral.'
  },
  {
    name: 'lineseparation',
    type: Number,
    defaultValue: 40,
    typeLabel: '{bold.green 40}',
    group: 'drawing',
    description: 'Distance from one line to the next, if drawing lines.'
  },
  {
    name: 'fidelity',
    type: Number,
    defaultValue: 10,
    typeLabel: '{bold.green 10}',
    group: 'drawing',
    description: 'How crisp should the lines/fishies be? Only applies to the "lines" drawings. Lower values will be crisper but take longer to draw. {bold positive integers}'
  },
  {
    name: 'noiseoctave',
    alias: 'n',
    type: Number,
    defaultValue: 1000,
    typeLabel: '{bold.green 1000}',
    group: 'drawing',
    description: 'Noisiness of the noise. Lower values equal more noisy. {bold only positive numbers}'
  },
  {
    name: 'noiseseed',
    type: Number,
    defaultValue: Math.random(),
    typeLabel: '{bold.green random}',
    group: 'drawing',
    description: 'Seed for the noise algorithm. This is random every time unless specified. The value used is printed to the console. {bold values from 0 to 1}'
  },
  {
    name: 'displacement',
    alias: 'x',
    type: Number,
    defaultValue: 200,
    typeLabel: '{bold.green 200}',
    group: 'drawing',
    description: 'How much should the noise effect a given point? Higher values have a greater impact. {bold can use negative or positive values}'
  },
];

const helpMenu = [
  { header: 'Draw Fishies', content: "Use the options below to draw some {blue fishies}. The default value for each option is shown in {bold.green green}. Output .png's will go to the '/out' folder by default. These images will be overwritten with the same naming pattern every time you run the script, so copy or save them if you don't want to lose them (or set a new output path using the options below)! To stitch these images together into an output video, I recommend the tool {bold ffmpeg}." },
  { header: 'Options', optionList },
  {
    header: 'Examples',
    content: [
      {
        desc: '1. Basic usage will output fish drawn as lines to the "/out" folder in this directory. ',
        example: '$ node draw',
      },
      {
        desc: '2. To draw a spiral instead, include the word "spiral." ',
        example: '$ node draw spiral',
      },
      {
        desc: '3. Switching the output folder to "/fishies" ',
        example: '$ node draw -d fishies',
      },
      {
        desc: '4. Drawing a red background color with black fish. ',
        example: '$ node draw -b 255,0,0 -c 0,0,0',
      },
    ]
  },
];

module.exports = { optionList, helpMenu };
