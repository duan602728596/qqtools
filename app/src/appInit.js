{
  /* 窗口全屏 */
  const gui = require('nw.gui');
  const win = gui.Window.get();
  console.log(win);
  win.maximize();
}