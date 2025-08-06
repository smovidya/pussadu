import { Dialog as DialogPrimitive } from "bits-ui";

import Close from "./dialog-close.svelte";
import Window from "./dialog-window.svelte";
import Maximize from "./dialog-maximize.svelte";
import Minimize from "./dialog-miminize.svelte";
import Overlay from "./dialog-overlay.svelte";
import Root from "./dialog-root.svelte";
import Titlebar from "./dialog-titlebar.svelte";
import Body from "./dialog-body.svelte";

const Portal = DialogPrimitive.Portal;

export {
  Root,
  Body,
  Portal,
  Window,
  Overlay,
  Close,
  Maximize,
  Minimize,
  Titlebar
};