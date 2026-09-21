import { PolyMod, MixinType } from "https://cdn.polymodloader.com/cb/polytrackmods/PolyModLoader/0.6.3/PolyTypes.js";

const probe = (channel) => `
  if (null != e.userControls) {
    let g = globalThis.cinputviewer;
    if (void 0 === g) g = globalThis.cinputviewer = { ch: new BroadcastChannel(${JSON.stringify(channel)}), last: -1, age: 0 };
    const p = (r.up ? 1 : 0) | (r.right ? 2 : 0) | (r.down ? 4 : 0) | (r.left ? 8 : 0);
    if (p !== g.last || ++g.age > 500) ((g.last = p), (g.age = 0), g.ch.postMessage(p));
  }
`;

class InputViewerMod extends PolyMod {
  preInit = (pml) => {
    const channel = "inputviewer-" + Math.random().toString(36).slice(2);
    pml.registerSimWorkerMixin({ type: MixinType.INSERT, token: "function n(e, r) {", func: probe(channel) });

    const diag = (globalThis.inputviewer = { channel, messages: 0 });
    let widget, root;
    const mount = () => {
      if (root?.isConnected) return true;
      const parent = document.querySelector(".game-ui");

      if (!parent || parent.querySelector(".input-visualizer-ui")) return false;
      widget = new (pml.getFromPolyTrack("Df"))(parent);
      root = parent.lastElementChild;
      return true;
    };

    new MutationObserver(mount).observe(document.getElementById("ui"), { childList: true });

    new BroadcastChannel(channel).onmessage = ({ data }) => {
      diag.messages++;
      if (mount()) widget.update({ up: data & 1, right: data & 2, down: data & 4, left: data & 8 });
    };
  };
}

export const polyMod = new InputViewerMod();
