# Empirica
Open source project to tackle the problem of long development cycles required to produce software to conduct multi-participant and real-time human experiments online.

## We are in Beta
This is a REAL beta - this means that you will be using a version of Empirica that is not yet ready for public release and still lacks proper documentation and examples. You should be prepared to find things which don't work perfectly, so please give us feedback on how to make them better. You can provide us with feedback by sending an email to hello@empirica.ly or by [creating an issue on GitHub](https://github.com/empiricaly/create-empirica-app/issues). The more feedback you give us, the better!

# create-empirica-app

The easy way to create an Empirica app.

## Quick Start

You’ll need to have Node.js >= 8 on your local development machine. See
[Usage](#usage) bellow if you don't have it installed.

```sh
npx create-empirica-app my-experiment
cd my-experiment
meteor
```

Then open http://localhost:3000/ to see your experiment.

## Usage

`create-empirica-app` requires Node.js >= 8. If you don't already have
Node.js 8+ setup, we recommend you use the official installer:
https://nodejs.org/en/download/.

Then you can simply run the following command, where `my-experiment` is the name
of the experiment you wish to create:

```sh
npx create-empirica-app my-experiment
```

It will create a directory called `my-experiment` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and
install the transitive dependencies:

```
my-experiment
├── .meteor
├── README.md
├── node_modules
├── package.json
├── package-lock.json
├── .gitignore
├── public
├── client
│   ├── main.html
│   ├── main.js
│   ├── main.css
│   ├── game
│   │   ├── Round.jsx
│   │   ├── PlayerProfile.jsx
│   │   ├── SocialExposure.jsx
│   │   ├── Task.jsx
│   │   ├── TaskResponse.jsx
│   │   ├── TaskStimulus.jsx
│   │   └── Timer.jsx
│   ├── intro
│   │   ├── Consent.jsx
│   │   ├── InstructionStepOne.jsx
│   │   ├── InstructionStepTwo.jsx
│   │   └── Quiz.jsx
│   └── outro
│       ├── ExitSurvey.jsx
│       └── Thanks.jsx
└── server
    ├── main.js
    ├── callbacks.js
    └── bots.js
```

No configuration or complicated folder structures, just the files you need to
build your app.  
Once the installation is done, you can open your project folder:

```sh
cd my-experiment
```

Inside the newly created project, you can run the standard `meteor` command to
start you app locally:

```sh
meteor
```

`meteor` runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.<br>
You will see the build errors in the console.
