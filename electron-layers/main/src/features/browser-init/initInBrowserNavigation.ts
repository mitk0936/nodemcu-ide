import { shell } from "electron";

export const initInBrowserNavigation = (app: Electron.App) => {
  // Hook on web links open events
  app.on("web-contents-created", (_, contents) => {
    // This hooks into the <a href="..." target="_blank"> or window.open(...)
    contents.setWindowOpenHandler(({ url }) => {
      // Open all external links in user's default browser
      shell.openExternal(url);
      return {
        action: "deny",
      };
    });

    // for events like window.location.href = ....
    contents.on("will-navigate", (event, url) => {
      if (url !== contents.getURL()) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  });
};
