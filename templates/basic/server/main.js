import Empirica from "meteor/empirica:core";

import { init } from "./game/init.js";
import callbacks from "./game/callbacks.js";

Meteor.startup(() => {
  const {
    onGameEnd,
    onGameStart,
    onRoundEnd,
    onRoundStart,
    onSet,
    onChange,
    onAppend,
    onStageEnd,
    onStageStart
  } = callbacks;

  Empirica.Server({
    init,
    bots: [],
    onGameStart,
    onRoundStart,
    onStageStart,
    onSet,
    onAppend,
    onChange,
    onStageEnd,
    onRoundEnd,
    onGameEnd
  });
});
