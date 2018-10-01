import { render } from "react-dom";

import Empirica from "meteor/empirica:core";

import Round from "./game/Round";
import Consent from "./intro/Consent";
import InstructionStepOne from "./intro/InstructionStepOne";
import InstructionStepTwo from "./intro/InstructionStepTwo";
import Quiz from "./intro/Quiz";
import ExitSurvey from "./outro/ExitSurvey";
import Thanks from "./outro/Thanks";

Meteor.startup(() => {
  const { Routes } = Empirica.Client({
    // TODO Add documentation
    Consent,

    // Introduction pages to show before they play the game.
    // At this point they have been assigned a treatment. You can return
    // different instruction steps depending on the assigned treatment.
    introSteps(treatment) {
      const steps = [InstructionStepOne];
      if (treatment.playerCount > 1) {
        steps.push(InstructionStepTwo);
      }
      steps.push(Quiz);
      return steps;
    },

    // TODO Add documentation
    Round,

    // End of Game pages. These may vary depending on player or game information.
    // For example we can show the score of the user, or we can show them a
    // different message if they actually could not participate the game (timed
    // out), etc.
    // The last step will be the last page shown to user and will be shown to the
    // user if they come back to the website.
    // If you don't return anything, or do not define this function, a default
    // exit screen will be shown.
    exitSteps(game, player) {
      return [ExitSurvey, Thanks];
    }
  });

  render(Routes, document.getElementById("app"));
});
