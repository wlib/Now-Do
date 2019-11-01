import { store, newContext } from "../store.mjs"
import { saveStore } from "../store.mjs"
import buildContextList from "./build-context-list.mjs"
import { getLocation } from "../util.mjs"

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

    <select>
      <option value="neither">Do not sort this context</option>
      <option value="time">Sort by time</option>
      <option value="location">Sort by location</option>
      <option value="both">Sort by both time and location</option>
    </select>

    <div class="time"></div>

    <div class="line"></div>

    <div class="location"></div>
  `
  const timeLocationSelect = card.querySelector("select")
  const time = card.querySelector("div.time")
  const location = card.querySelector("div.location")

  if (context.useTime && !context.useLocation)
    timeLocationSelect.value = "time"
  else if (!context.useTime && context.useLocation)
    timeLocationSelect.value = "location"
  else if (context.useTime && context.useLocation)
    timeLocationSelect.value = "both"
  else
    timeLocationSelect.value = "neither"

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
  
  startTime.onchange = e => {
    endTime.min = startTime.value
  }

  times.appendChild(startTime)
  times.appendChild(endTime)
  time.appendChild(times)

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
  time.appendChild(days)

  const setLocationButton = document.createElement("button")
  setLocationButton.innerHTML = "Use Current Location"
  location.appendChild(setLocationButton)

  setLocationButton.onclick = e => {
    getLocation()
      .then(l => Object.assign(context.location, l))
  }

  let timer
  setLocationButton.addEventListener("touchstart", e => {
    timer = setTimeout(() => {
      const l = prompt("Set coordinates", JSON.stringify(context.location, null, 2))
      Object.assign(context.location, JSON.parse(l))
    }, 3 * 1000)
  })
  setLocationButton.addEventListener("touchend", e => {
    if (timer)
      clearTimeout(timer)
  })

  card._save = () => {
    context.name = card.querySelector("header > h1").innerText
    
    if (timeLocationSelect.value == "time") {
      context.useTime = true
      context.useLocation = false
    } else if (timeLocationSelect.value == "location") {
      context.useTime = false
      context.useLocation = true
    } else if (timeLocationSelect.value == "both") {
      context.useTime = true
      context.useLocation = true
    } else {
      context.useTime = false
      context.useLocation = false
    }

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
