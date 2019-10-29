import contextCard from "./context-card.mjs"
import editContextCard from "./edit-context-card.mjs"

import { store } from "../store.mjs"
import { sortContexts } from "../util.mjs"

const buildContextList = () => {
  const container = document.querySelector("body > main")
  container.innerHTML = ""

  const currentLocation = { lat: 0, lon: 0 }
  const currentTime = new Date()

  sortContexts(store, currentLocation, currentTime)
    .map(contextCard)
    .map(card => container.appendChild(card))

  const fab = document.querySelector("body > footer > button")

  fab.innerHTML = "&#xFF0B;"
  fab.onclick = e => {
    container.innerHTML = ""

    const editCard = editContextCard()
    container.appendChild(editCard)

    fab.innerText = "Done"
    fab.onclick = e => {
      editCard._save()
      buildContextList()
    }
  }
}

export default buildContextList
