# {{appName}}

_This project was generated with [create-empirica-app](https://github.com/empiricaly/create-empirica-app)._

*Add a description of your Empirica app*

# Running this App Locally

## General  Setup
If you haven't already:

- Install `Node.js` and `npm` here: [https://nodejs.org/en/](https://nodejs.org/en/)
- Install `Meteor` here: [https://www.meteor.com/install](https://www.meteor.com/install)

## Preparing this app

If you have just downloaded, pulled, or cloned this app, you should run this in the command line to install all the Node packages:

```
meteor npm install
```

## Launching the app

You can now run the app on your local machine with:

```
meteor
```
This can take a few minutes.

This will start the app that you can access as a participant:
[https:/localhost:3000/](https:/localhost:3000/)

You can access the admin panel here:
[https:/localhost:3000/admin](https:/localhost:3000/admin)

Log in with the *username* and *password* provided in the command line.

## Loading the factors and treatments

To use the app, you usually need to use treatments and factors. Some might be prepared in a `.yaml` file (e.g., `factors.yaml`). In the **admin panel**:
- click on the **Configuration** button
- click on **import**
- select the `.yaml` file you want to import the factors and treatments from
- wait a few seconds for the factors and treatments to be imported

## Testing the app

To run a game create a new `batch` with the games of treatments you want to use and click start on the batch.

Open a player tab by going to [https:/localhost:3000/](https:/localhost:3000/) or clicking on **open app**.

The player that you open with [https:/localhost:3000/](https:/localhost:3000/) is cached on your browser. Whenever you start a game with this player, your local app will keep that information. To play again there are multiple things you can do:
- Click on the **Reset current session** button on the header of a tab with your player to reset this player, and create a new game for this player to join.
- Click on the **New Player** button on the header of a tab with your player to open a new tab with a different player (you will see the id of that player in the title of the tab).
- Go to the **Players** tab in the admin panel and retire players that have finished or cancelled.

**The app will hot reload as you save changes to your code.**

# Structure of the App

## Client

All code in the `/client` directory will be ran on the client. The entry point
for your app on the client can be found in `/client/main.js`. In there you will
find more details about how to customize how a game _Round_ should be rendered,
what _Consent_ message and which _Intro Steps_ you want to present the players
with, etc.

The HTML root of you app in `/client/main.html` shouldn't generally be changed
much, other than to update the app's HTML `<head>`, which contains the app's
title, and possibly 3rd party JS and CSS imports.

All styling starts in `/client/main.less`, and is written in
[LESS](http://lesscss.org/), a simple superset of CSS. You can also add a plain
CSS files in `/client`.

The `/client/game`, `/client/intro`, `/client/exit` directories all contain
[React](https://reactjs.org/) components, which compose the UI of your app.
If you are new to React, we recommend you try out the official
[React Tutorial](https://reactjs.org/tutorial/tutorial.html).

## Server

Server-side code all starts in the `/server/main.js` file. In that file, we set
an important Empirica integration point, the `Empirica.gameInit`, which allows
to configure each game as they are initiated by Empirica.

From there we import 2 other files. First the `/server/callback.js` file, which
contains all the possible callbacks used in the lifecycle of a game. These
callbacks, such as `onRoundEnd`, offer powerful ways to add logic to a game in a
central point (the server), which is often preferable to adding all the logic on
the client.

Finally, the /server/bots.js file is where you can add bot definitions to your app.

## Public

The `/public` is here to host any static assets you might need in the game, such
as images. For example, if you add an image at `/public/my-logo.jpeg`, it will
be available in the app at `http://localhost:3000/my-logo.jpeg`.

# Learn more

- Empirica Website: [https://empirica.ly/](https://empirica.ly/)
- Empirica documentation: [https://docs.empirica.ly/](https://docs.empirica.ly/)
- Meteor Tutorial: [https://www.meteor.com/tutorials/react/creating-an-app](https://www.meteor.com/tutorials/react/creating-an-app)
- React Tutorial: [https://reactjs.org/tutorial/tutorial.html](https://reactjs.org/tutorial/tutorial.html)
- LESS Intro: [http://lesscss.org/#overview](http://lesscss.org/#overview)
- JavaScript Tutorial: [https://javascript.info/](https://javascript.info/)
