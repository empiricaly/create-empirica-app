import React, { Component } from 'react'
import { Meteor } from "meteor/meteor";
import { Centered } from "meteor/empirica:core";

export default class Sorry extends Component {
    static stepName = "Sorry";

    render() {
        const { player, game } = this.props;
        let msg;
        switch (player.exitStatus) {
            case "gameFull":
                msg = "All games you are eligible for have filled up too fast...";
                break;
            case "gameLobbyTimedOut":
                msg = "There were NOT enough players for the game to start...";
                break;
            case "playerEndedLobbyWait":
                msg =
                    "You decided to stop waiting, we are sorry it was too long a wait.";
                break;
            default:
                msg = "Unfortunately the Game was cancelled...";
                break;
        }
        if (player.exitReason === "failedQuestion") {
            msg =
                "Unfortunately you did not meet the conditions required to play the game.";
        }
        // Only for dev
        if (!game && Meteor.isDevelopment) {
            msg =
                "Unfortunately the Game was cancelled because of failed to init Game (only visible in development, check the logs).";
        }
        return (
            <Centered>
                <div>
                    <h4>Sorry!</h4>
                    <p>Sorry, you were not able to play today! {msg}</p>
                    <p>
                        <strong>Please contact the researcher to see if there are more games available.</strong>
                    </p>
                </div>
            </Centered>
        );
    }
}