export const getLocation = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(x => resolve({ lat: x.coords.latitude, lon: x.coords.longitude }), reject)
  )

const locationRelevance = (context, currentLocation) => {
  const earthRadius = 6371000 // Meters
  const latDistance = Math.PI / 180 * (context.location.lat - currentLocation.lat)
  const lonDistance = Math.PI / 180 * (context.location.lon - currentLocation.lon)
  const a = Math.sin(latDistance/2) * Math.sin(latDistance/2) +
            Math.cos(Math.PI / 180 * currentLocation.lat) * Math.cos(Math.PI / 180 * context.location.lat) *
            Math.sin(lonDistance/2) * Math.sin(lonDistance/2)
  const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return 100000 / distance
}

const daysAway = (currentDayIndex, targetDayIndex) => {
  if (currentDayIndex <= targetDayIndex)
    return targetDayIndex - currentDayIndex
  else
    return 7 - (currentDayIndex - targetDayIndex)
}

const timeRelevance = (context, currentTime = new Date()) => {
  let closestDayDistance
  if (context.time.days.length == 0)
    closestDayDistance = 0
  else
    closestDayDistance = Math.min(
      ...context.time.days
        .map(i => daysAway(currentTime.getDay(), i))
    )

  const minutesDistanceToStart = closestDayDistance * 24 * 60 * 60 +
    (currentTime.getHours() - context.time.startTime.getHours()) * 60 +
    (currentTime.getMinutes() - context.time.startTime.getMinutes())
  const minutesDistanceToEnd = closestDayDistance * 24 * 60 * 60 +
    (currentTime.getHours() - context.time.endTime.getHours()) * 60 +
    (currentTime.getMinutes() - context.time.endTime.getMinutes())

  if (minutesDistanceToStart <= 0 && minutesDistanceToEnd >= 0)
    return 10000
  else if (minutesDistanceToStart > 0)
    return 100 / minutesDistanceToStart
  else if (minutesDistanceToEnd < 0)
    return 0
}

const contextRelevance = (context, currentLocation, currentTime) => {
  if (context.useTime && !context.useLocation)
    return timeRelevance(context, currentTime)
  if (!context.useTime && context.useLocation)
    return locationRelevance(context, currentLocation)
  if (context.useTime && context.useLocation)
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
  else if (days.length == 2 && days.includes(0) && days.includes(6))
    return " on Weekends"
  else if (days.length == 5 && !days.includes(0) && !days.includes(6))
    return " on Weekdays"
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
  if (context.useTime && !context.useLocation)
    return `${timeToString(context)}${daysToString(context.time.days)}`
  if (!context.useTime && context.useLocation)
    return "At given location"
  if (context.useTime && context.useLocation)
    return `${timeToString(context)}${daysToString(context.time.days)} or at given location`
  else
    return "Not sorted by time or location"
}
