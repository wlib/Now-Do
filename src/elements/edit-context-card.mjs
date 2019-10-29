import { store, newContext } from "../store.mjs"
import { saveStore } from "../store.mjs"

export default context => {
  if (!context) {
    context = newContext()
    store.push(context)
  }

  const card = document.createElement("section")

  card.innerHTML = `
    <header>
      <h1 contenteditable>${context.name}</h1>
    </header>

    <div class="line"></div>
  `

  const times = document.createElement("div")
  times.className = "times"

  context.time.startTime = new Date(context.time.startTime)
  context.time.endTime = new Date(context.time.endTime)

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
