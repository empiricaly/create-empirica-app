# create-empirica-app

The easy way to create an Empirica app.

## Quick Start

```sh
npx create-empirica-app my-experiment
cd my-experiment
meteor
```

Then open [http://localhost:3000/](http://localhost:3000/) to see your experiment.

## Creating an App (more details)

You’ll need to have Node >= 8 on your local development machine.<br>
To create a new app, you may choose one of the following methods:

### npx

```sh
npx create-empirica-app my-experiment
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

### npm

```sh
npm init empirica-app my-experiment
```

_`npm init <initializer>` is available in npm 6+_

### Yarn

```sh
yarn create empirica-app my-experiment
```

_`yarn create` is available in Yarn 0.25+_

It will create a directory called `my-experiment` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-experiment
├── .meteor
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
├── client
│   ├── client.html
│   ├── client.css
│   └── client.js
└── server
    └── server.js
```

No configuration or complicated folder structures, just the files you need to build your app.  
Once the installation is done, you can open your project folder:

```sh
cd my-experiment
```

Inside the newly created project, you can run the standard `meteor` command to start you app locally:

### `meteor`

Runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.
