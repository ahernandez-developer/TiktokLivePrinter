import { ipcRenderer } from "electron";

async function api(route) {
  const control = require("./controllers/" + route.controller)[route.action];

  let response = await control(route.params);

  return response;
}

async function dispatch(route, callback) {
  ipcRenderer.send("api", {
    controller: route.controller,
    action: route.action,
    params: route.params,
  });

  ipcRenderer.on(
    "api/" + route.controller + "/" + route.action,
    async (e, r) => {
      callback(r);
    }
  );
}

export { api, dispatch };
