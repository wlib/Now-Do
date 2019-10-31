import { contextDescription } from "../util.mjs";

import editContextCard from "./edit-context-card.mjs"
import buildContextList from "./build-context-list.mjs"
import { store, saveStore } from "../store.mjs";

export default context => {
  const card = document.createElement("section")

  const header = document.createElement("header")
  header.innerHTML = `
    <h1 contentEditable>${context.name}</h1>
    <div>⋮</div>
    <h2>${contextDescription(context)}</h2>
  `
  card.appendChild(header)

  const title = header.querySelector("h1")

  title.onkeyup = e => {
    context.name = title.innerText
    saveStore()
  }

  header.querySelector("div").onclick = e => {
    const container = document.querySelector("body > main")
    container.innerHTML = ""

    const editCard = editContextCard(context)
    container.appendChild(editCard)

    const fab = document.querySelector("body > footer > button")

    fab.innerText = "Done"
    fab.onclick = e => {
      editCard._save()
      buildContextList()
    }
  }

  const line = document.createElement("div")
  line.className = "line"
  card.appendChild(line)

  const main = document.createElement("main")
  main.innerHTML = context.tasks
    .map(task => `<p contentEditable>${task}</p>`)
    .join("\n")
  card.appendChild(main)

  main.onkeyup = e => {
    const tasks = [...main.children]
      .map(p => p.innerText.trim())
      .filter(x => /.+/.test(x))
    context.tasks = tasks
    saveStore()
  }

  const footer = document.createElement("footer")
  const addTaskButton = document.createElement("button")
  addTaskButton.innerHTML = "&#xFF0B;"
  footer.appendChild(addTaskButton)
  card.appendChild(footer)

  addTaskButton.onclick = e => {
    const newTask = document.createElement("p")
    newTask.contentEditable = true
    newTask.innerHTML = "&nbsp;"
    main.appendChild(newTask)

    const range = window.document.createRange()
    range.setStart(newTask, 0)
    range.setEnd(newTask, 0)

    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }

  return card
}
