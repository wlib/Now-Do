import { contextDescription } from "../util.mjs";

import editContextCard from "./edit-context-card.mjs"
import buildContextList from "./build-context-list.mjs"
import { store, saveStore } from "../store.mjs";

export default context => {
  const card = document.createElement("section")

  let timer
  card.addEventListener("touchstart", e => {
    timer = setTimeout(() => {
      if (confirm(`Are you sure you want to delete ${context.name}?`)) {
        store.splice(store.indexOf(context), 1)
        saveStore()
        buildContextList()
      }
    }, 3/4 *1000)
  })
  card.addEventListener("touchend", e => {
    if (timer)
      clearTimeout(timer)
  })

  const header = document.createElement("header")
  header.innerHTML = `
    <h1>${context.name}</h1>
    <h2>${contextDescription(context)}</h2>
  `
  card.appendChild(header)

  header.onclick = e => {
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
      .map(p => p.innerText)
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

    const range = window.document.createRange();
    range.setStart(newTask, 0);
    range.setEnd(newTask, 0);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  return card
}
