const noop = () => undefined;
console.log(`REACT_APP_SHOW_LOG = ${process.env.REACT_APP_SHOW_LOG}`)
console.log(`REACT_APP_RELEASE_DATE = ${process.env.REACT_APP_RELEASE_DATE}`)
export default (process.env.REACT_APP_SHOW_LOG==="true")?console.log:Object.fromEntries(Object.keys(console).map(key => [key, noop])).log;