# All I want for christmas

All I want for christmas is you by Mariah Carey but the volume is controlled by the proximity to Christmas. A project by [Levi](https://leviv.me) and [Amanda](https://amandayeh.com).

If you have any suggestions, feel free to open an issue or pull request!

If you're intrested in viewing our liscense for looking this song, please refer to [this document](http://bitly.com/98K8eH).

## Get started

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Deploying to the web

From the `main` branch, after pushing most recent changes, run `./deploy.sh`. The simple script is below:

```
# Build the application
npm run build

# Commit and push the changes
git add .
git commit -m "initial gh-pages commit"
git push origin gh-pages -f

# Deploy the code with the gh-pages module
node ./gh-pages.js
```
