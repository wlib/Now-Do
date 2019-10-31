const locationRelevance = (context, currentLocation) => {
  const latDistance = context.location.lat - currentLocation.lat
  const lonDistance = context.location.lon - currentLocation.lon
  const distance = (latDistance ** 2 + lonDistance ** 2) ** (1 / 2)

  return Math.floor(context.location.radius / distance)
}

const timeRelevance = (context, currentTime = new Date()) => {
  const relevance = {
    beforeDay: false,
    withinDay: false,
    beforeTime: false,
    withinTime: false
  }

  // Absolute stupidity starts here
  if (context.time.date) {
    if (
      context.time.date.getDate() == currentTime.getDate() &&
      context.time.date.getMonth() == currentTime.getMonth()
    ) {
      relevance.withinDay = true
      if (
        context.time.startTime.getHours() > currentTime.getHours() ||
          (context.time.startTime.getHours() == currentTime.getHours() &&
          context.time.startTime.getMinutes() > currentTime.getMinutes())
      ) {
        relevance.beforeTime = true
      } else if (
        context.time.endTime.getHours() > currentTime.getHours() ||
          (context.time.endTime.getHours() == currentTime.getHours() &&
          context.time.endTime.getMinutes() > currentTime.getMinutes())
      ) {
        relevance.withinTime = true
      }
    } else if (
      context.time.date.getDate() > currentTime.getDate() &&
      context.time.date.getMonth() > currentTime.getMonth()
    ) {
      relevance.beforeDay = true
    }
  } else {
    if (context.time.days.includes(currentTime.getDay()) || context.time.days.length == 0) {
      relevance.withinDay = true
      if (
        context.time.startTime.getHours() > currentTime.getHours() ||
          (context.time.startTime.getHours() == currentTime.getHours() &&
          context.time.startTime.getMinutes() > currentTime.getMinutes())
      ) {
        relevance.beforeTime = true
      } else if (
        context.time.endTime.getHours() > currentTime.getHours() ||
          (context.time.endTime.getHours() == currentTime.getHours() &&
          context.time.endTime.getMinutes() > currentTime.getMinutes())
      ) {
        relevance.withinTime = true
      }
    }
  }

  if (relevance.beforeDay) {
    return 0
  } else if (relevance.withinDay) {
    if (relevance.beforeTime) {
      return 1
    } else if (relevance.withinTime) {
      return 2
    }
  } else {
    return 0
  }
}

const contextRelevance = (context, currentLocation, currentTime) => {
  if (context.timeAndOrLocation == "time")
    return timeRelevance(context, currentTime)
  if (context.timeAndOrLocation == "location")
    return locationRelevance(context, currentLocation)
  if (context.timeAndOrLocation == "and")
    return timeRelevance(context, currentTime) * locationRelevance(context, currentLocation)
  if (context.timeAndOrLocation == "or")
    return timeRelevance(context, currentTime) + locationRelevance(context, currentLocation)
  else
    return 0
}

export const sortContexts = (contexts, currentLocation, currentTime) =>
  contexts
    .sort((a, b) => contextRelevance(b, currentLocation, currentTime) -
                    contextRelevance(a, currentLocation, currentTime))

const daysToString = days => {
  if (days.length == 0 || days.length == 7)
    return ""
  else
    return " on " + days
      .map(i => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i])
      .join(", ")
}

const timeToString = context => {
  return context.time.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
  + " to " +
  context.time.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
}

export const contextDescription = context => {
  if (context.timeAndOrLocation == "time")
    return `${timeToString(context)}${daysToString(context.time.days)}`
  if (context.timeAndOrLocation == "location")
    return "At given location"
  if (context.timeAndOrLocation == "and")
    return `At given location from ${timeToString(context)}${daysToString(context.time.days)}}`
  if (context.timeAndOrLocation == "or")
    return `At given location or from ${timeToString(context)}${daysToString(context.time.days)}`
  else
    return "Tap to add a time and/or location"
}
