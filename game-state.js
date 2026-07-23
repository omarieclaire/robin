/* Shared mutable game state — global so every module can read/write it. */
let W, H;
let grid;
let phase;
let clickSX = -1,
  clickSY = -1,
  clickPending = false;
const gs = document.getElementById("game-screen");
const overlay = document.getElementById("overlay"),
  ovTitle = document.getElementById("ov-title"),
  ovSub = document.getElementById("ov-sub"),
  ovHint = document.getElementById("ov-hint"),
  startBtn = document.getElementById("start-btn");
const helpOverlay = document.getElementById("help-overlay");
let audio;
let input = new Input();
let loop;
let _lastDt = 16;
let a2TN = null;
let a2PX, a2PY;
let hasPlayed = false;
const state = new State({ score: 0 });
const tmr = new Timer();
let FOODS = window.GAME_DATA.foods;
let D_INTERCOM_TICKER = [];
let s4Ug = 0;
let s4AlyScore = 0;
let s4PX2, s4PY2;
let _renderFrameSkip = 0;
const A1_PSX_RATIO = 0.5,
  A1_PSY_RATIO = 0.55;
const floats = [];
const sparks = [];
let chromaticT = 0;
let flashGoodT = 0,
  flashGoldT = 0;
