import buildContextList from "./build-context-list.mjs"

buildContextList()

if ("serviceWorker" in navigator) 
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/service-worker.js")
  )
