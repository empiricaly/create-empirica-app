import Empirica from "meteor/empirica:core";
import "./bots.js";
import "./callbacks.js";

// gameInit is where the structure of a game is defined.
// Just before every game starts, once all the players needed are ready, this
// function is called with the treatment and the list of players.
// You must then add rounds and stages to the game, depending on the treatment
// and the players. You can also get/set initial values on your game, players,
// rounds and stages (with get/set methods), that will be able to use later in
// the game.
Empirica.gameInit(game => {
  game.players.forEach((player, i) => {
    player.set("avatar", `/avatars/jdenticon/${player._id}`);
    player.set("score", 0);
  });

  _.times(10, i => {
    const round = game.addRound();
    round.addStage({
      name: "response",
      displayName: "Response",
      durationInSeconds: 120
    });
  });
});

// ====================
// ADVANCED CONFIGURATION
//
// Everything beyond this point are advanced options to change only
// with full understanding of how things work.
// ====================

// onAssign is an advanced escape hatch to perform custom assignment of players
// to batches and games. By default, players are assigned randomly to
// not-yet-running games in the first batch that still has games available.
// By default, if the games are all full, we over-assign games, and the first
// players done with Intro Steps and waiting in the lobby will be selected to
// start the game and the overflow players will be directly sent to the Exit
// Steps with the player.exitState === "gameFull". This assignment method allows
// to start games as soon as possible by bringing in more players than there are
// spots in game.
// Actually, instead of sending players directly to the Exit Steps, if the game
// they were assigned to does start before they have reached the lobby, we do
// try to assign them to the next available batch, in a game with the same
// treatment, if such a game exists. This is done in the default implementation
// of the preGameInit callback which can also be overridden.
//
// batches: all running batches that still have open games that are not yet
//          running, in order of batch running time.
// batches.$.games: all games of a given batch
// batches.$.games.$.treatment: treatment for game
// batches.$.games.$.assign(): will assign the current player to the game
// player: the player to assign to a game
Empirica.onAssign((batches, player) => {
  // Batches will always contain at least one batch. If there are no batches
  // left by this point, the player will be automatically sent to the Exit Steps
  // with player.exitStatus === "noBatchesLeft".
  const batch = batches[0];

  // Let's first try to find games for which their assigned players isn't above
  // the number of expected players
  let availableGames = batch.games.filter(
    game => game.treatment.playerCount > game.players.length
  );

  // If no games still have "availability", just fill any game
  if (availableGames.length === 0) {
    availableGames = batch.games;
  }

  // Try to assign proportially to total expected playerCount
  const gamesPool = [];
  for (const game of availableGames) {
    for (let i = 0; i < game.treatment.playerCount; i++) {
      gamesPool.push(game);
    }
  }
  const game = _.sample(gamesPool);

  // In this assignment model, we always assign to the first batch, in any of
  // the remaining unstarted games, with over-assignment.
  // In other assignment models, you could try to go through multiple batches
  // and never do over-assigning.
  game.assign();
});

// onPreGameInit is where player move from the lobby into the game. At this
// point, there are enough players ready (playerCount players have finished the
// intro steps) you can choose to start or not the game.
//
// game: the game that is starting
// game.players: players that are ready, having finished the intro steps and
//               that are in the lobby
// game.start(): start the game now. If the game is not started, this callback
//               will be called again when another player is ready, if there are
//               still ones that are not ready, and this is not triggered by a
//               lobby timeout.
// game.notReadyPlayers: players that are NOT ready yet, and that would by
//                       default no be participating in the game. You can choose
//                       to try and reassign these players to another game with
//                       the batches object.
// batches: all running batches that still have open games that are not yet
//          running, in order of batch running time.
// batches.$.games: all games of a given batch
// batches.$.games.$.treatment: treatment for game
// batches.$.games.$.assign(player): will assign the given player to the game
// isLobbyTimeout: is set to true if this callback was triggered by a lobby
//                 timeout, and it will not be called again (you should either
//                 start the game or send all players to the exit).
Empirica.onPreGameInit((game, batches, isLobbyTimeout) => {
  // We will try to reassign players that were not yet ready to a new game in
  // the same or subsequent batch, with the same treatment.
  for (player of game.notReadyPlayers) {
    let assigned = false;
    for (batch of batches) {
      // First we only want to reassign to games with the same treatment
      const possibleGames = batch.games.filter(g =>
        _.isEqual(game.treatment, g.treatment)
      );

      // If no game with the same treatment, go to next batch
      if (possibleGames.length === 0) {
        continue;
      }

      // Let's try to find games for which their assigned players isn't above
      // the number of expected players
      let availableGames = possibleGames.filter(
        g => g.treatment.playerCount > g.players.length
      );

      // If no games still have "availability", just fill any game
      if (availableGames.length === 0) {
        availableGames = batch.games;
      }

      // Try to assign proportially to total expected playerCount
      const gamesPool = [];
      for (const game of availableGames) {
        for (let i = 0; i < game.treatment.playerCount; i++) {
          gamesPool.push(game);
        }
      }
      const game = _.sample(gamesPool);

      // In this assignment model, we always assign to the first batch, in any of
      // the remaining unstarted games, with over-assignment.
      // In other assignment models, you could try to go through multiple batches
      // and never do over-assigning.
      game.assign(player);
      assigned = true;
      break;
    }

    if (!assigned) {
      player.exit("gameFull");
    }
  }

  game.start();
});
