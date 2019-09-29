# Starter for Chrome Extension via Angular

This is the lenne.Tech starter for new Chrome Extension via Angular. 
It's based on the [Angular Chrome Extension Scaffold Project](https://github.com/larscom/angular-chrome-extension) 
developed by [Lars Kniep](https://github.com/larscom).

The [development area of chrome](https://developer.chrome.com/extensions/getstarted) provides more information on 
developing extensions for Chrome.

## How to use/develop
- clone this repository
- run `npm install`
- run `npm start`
- goto: `chrome://extensions` in the browser and enable 'developer mode'
- press `Load unpacked` and target the folder `angular/dist`

The project is automatically being watched, any changes to the files will recompile the project.

**NOTE**: changes to the contentPage/backgroundPage requires you to reload the extension in `chrome://extensions`


## Build/package for production

- run `npm run build:production`
- upload `extension-build.zip` to the chrome webstore.
- (optional) you can also manually zip your extension, the production build will output to folder `angular/dist`

This will run a production build and will automatically zip it as a extension package in the root folder `./` named: 
`extension-build.zip`

**NOTE**: Do not forget to update the version number inside `manifest.json`

## Data and logic areas

The extension is divided into several areas:

- Angular App (SPA / PWA) that runs in a separate browser window (see `angular/src/`)
- Background script that runs even if the Angular App is not open (see `chrome/src/background.ts`)
- Site script that is integrated into the site when the corresponding URL is called (see `chrome/src/site.ts`)
- Chrome storage that holds the data ready in case the app or browser is closed 
(see ChromeHelper.getFromStorage and ChromeHelper.getFromStorage in `angular/src/app/core/helper/chrome.helper.ts`)

## Communication between the areas
Communication is organized via the `chrome.tabs` and `chrome.runtime` messages: 

- `chrome.tabs` is used to send messages to the site script.  
- `chrom.runtime` is used to send messages to the app and the background script.

Since `chrome.runtime` addresses both the app and the background script at the same time, they must check who a new 
message is intended for when they receive it. Differentiation can be made via the Enum ActionType
(see `src/app/core/enums/action-type.enum.ts`).

The recommended communication channels are:

- App => Background script
- App => Site script
- Background script => App
- Site script => Background script

Background => Site script is may be useful in some cases, but a communication from Site script => App can run empty if 
the app is not opened.

## Using extension as **New Tab**
If you decide to use `chrome_url_overrides` for the extension to take over the new tab page. 
You need to set the `base-href` inside `index.html` to `<base href="#/">` 

## Using extension via **PopUp**
Config `browser_action` in angular/src/manifest.json:

```
"browser_action": {
    "default_popup": "index.html",
    "default_title": "Angular Chrome Extension"
  },
```
and change handling in chorme/src/background.ts.

## Directories
- `src`: This folder contains the source code of the angular app.
- `chrome`: This folder contains the background & site script for the google chrome extension.

## Thanks

Many thanks to the developers of the 
[Angular Chrome Extension Scaffold Project](https://github.com/larscom/angular-chrome-extension)
and all the developers whose packages are used here.

## License

MIT - see LICENSE
