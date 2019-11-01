export const newContext = () => ({
  name: "New Context",
  time: {
    startTime: new Date(0,0,0, 0, 0),
    endTime:   new Date(0,0,0, 0, 0),
    days: []
  },
  location: {
    lat: undefined,
    lon: undefined
  },
  useTime: false,
  useLocation: false,
  tasks: []
})

const persistGet = (key, defaultValue) =>
  JSON.parse( localStorage.getItem(key) ) || defaultValue

const persistSet = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value))

export let store = persistGet("contexts", [])
  .map(context => {
    context.time.startTime = new Date(context.time.startTime)
    context.time.endTime = new Date(context.time.endTime)
    return context
  })

export const saveStore = () =>
  persistSet("contexts", store)

