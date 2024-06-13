/** @param {NS} ns */
export async function main(ns) {
  // Create an empty list to add servers to as we find them
  let serverList = [];
  // define a new function that we can call locally
  function scanning(server) {
    // create a scan of the current server
    let currentScan = ns.scan(server);
    // if the server is in the list, Ignore it. Otherwise add it to the serverList and scan it
    // Server list acts as a 'global' for this new scan.
    // Creating a function which scans everything it hasnt seen. Leading to 'seeing' everything.
    currentScan.forEach(server => {
      if (!serverList.includes(server)) {
        serverList.push(server);
        scanning(server);
      }
    })
  }
  // initilize the first scan
  scanning(server);
  // Return the List
  return serverList;
}
