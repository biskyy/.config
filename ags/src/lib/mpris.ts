import Variable from "resource:///com/github/Aylur/ags/variable.js";

import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

const ignoredBusNames = ["org.mpris.MediaPlayer2.playerctld"];
export const PlayerSelected = Variable(-1);

Mpris.connect("player-added", (Mpris, busName) => {
  if (ignoredBusNames.includes(busName)) return;

  PlayerSelected.value = Mpris.players.length - 1;
});

Mpris.connect("player-changed", (Mpris, bus_name) => {
  if (ignoredBusNames.includes(bus_name)) return;

  PlayerSelected.value = Mpris.players.findIndex(
    (player) => player.bus_name === bus_name
  );
});

Mpris.connect("player-closed", () => {
  PlayerSelected.value--;

  while (ignoredBusNames.includes(Mpris.players[PlayerSelected.value].bus_name))
    PlayerSelected.value--;

  if (PlayerSelected.value < 0)
    for (let i = 0; i < Mpris.players.length; i++)
      if (!ignoredBusNames.includes(Mpris.players[i].bus_name)) {
        PlayerSelected.value = i;
        return;
      }
});
