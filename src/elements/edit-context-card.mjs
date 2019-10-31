import { store, newContext } from "../store.mjs"
import { saveStore } from "../store.mjs"
import buildContextList from "./build-context-list.mjs"

export default context => {
  let isNew = false
  if (!context) {
    isNew = true
    context = newContext()
    store.push(context)
  }

  const card = document.createElement("section")

  card.innerHTML = `
    <header>
      <h1 contentEditable>${context.name}</h1>
      <div style="color:red">⊗</div>
    </header>

    <div class="line"></div>
  `

  const deleteButton = card.querySelector("header > div")

  if (isNew) {
    deleteButton.style.display = "none"
  } else {
    deleteButton.onclick = e => {
      if (confirm(`Are you sure you want to delete ${context.name}?`)) {
        store.splice(store.indexOf(context), 1)
        saveStore()
        buildContextList()
      }
    }
  }

  const times = document.createElement("div")
  times.className = "times"

  const startTime = document.createElement("input")
  startTime.type = "time"
  startTime.value = context.time.startTime.toLocaleTimeString("en-US", { hour12: false, hour: "numeric", minute: "numeric" })
  
  const endTime = document.createElement("input")
  endTime.type = "time"
  endTime.value = context.time.endTime.toLocaleTimeString("en-US", { hour12: false, hour: "numeric", minute: "numeric" })
  
  times.appendChild(startTime)
  times.appendChild(endTime)
  card.appendChild(times)

  const days = document.createElement("div")
  days.className = "days"
  "SMTWTFS"
    .split("")
    .map((c, i) => {
      const day = document.createElement("span")
      day.dataset.dayIndex = i
      day.innerText = c

      if (context.time.days.includes(i))
        day.className = "selected"

      day.onclick = e => {
        if (day.className == "selected")
          day.className = ""
        else
          day.className = "selected"
      }

      return day
    })
    .map(day => days.appendChild(day))
  card.appendChild(days)

  card._save = () => {
    context.name = card.querySelector("header > h1").innerText
    
    context.time.startTime.setHours( parseInt(startTime.value.substring(0, 2)) )
    context.time.startTime.setMinutes( parseInt(startTime.value.substring(3, 5)) )
    context.time.endTime.setHours( parseInt(endTime.value.substring(0, 2)) )
    context.time.endTime.setMinutes( parseInt(endTime.value.substring(3, 5)) )

    context.time.days = [...days.children]
      .filter(day => day.className == "selected")
      .map(day => parseInt(day.dataset.dayIndex))

    saveStore()
  }

  return card
}
