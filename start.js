/** @param {NS} ns */
function fullScan(ns) {
  /**
   * Create a set with only 'home' in it.
   * for every server in that set we scan the server and add that list to the set. 
   * this creates hostname redundancy so at the end of this we then return a split and sorted version.
   */
  let foundServers = new Set(["home"]);
  for (const server of foundServers) ns.scan(server).forEach(adjacentServer => foundServers.add(adjacentServer));
  return [...foundServers].sort();
}
function crack(ns, server) {
  /**
   * When a server is sent the the function we collect the stats with getServer.
   * Using the info that command gives (I.E: ftpPortOpen, numOpenPortsRequired, ETC)
   * we check what ports are closed and if we have the files to open them.
   * When enough ports are open we execute Nuke.exe on the server to gain root access
   */
  const serverstats = ns.getServer(server)
  if (!serverstats.sshPortOpen && ns.fileExists("BruteSSH.exe", 'home')) ns.brutessh(server);
  else if (!serverstats.ftpPortOpen && ns.fileExists("FTPCrack.exe", 'home')) ns.ftpcrack(server);
  else if (!serverstats.smtpPortOpen && ns.fileExists("relaySMTP.exe", 'home')) ns.relaysmtp(server);
  else if (!serverstats.httpPortOpen && ns.fileExists("HTTPWorm.exe", 'home')) ns.httpworm(server);
  else if (!serverstats.sqlPortOpen && ns.fileExists("SQLInject.exe", 'home')) ns.sqlinject(server);
  if (serverstats.numOpenPortsRequired <= serverstats.openPortCount) ns.nuke(server);
}
export async function main(ns) {
  /**
   * Basic script with the sole purpose of cracking all servers in the game we can
   * we declare all servers in the game, for each one we check our access level
   * if we dont have root then "crack" it.
   * repeat every 10 seconds forever.
   */
  let network = fullScan(ns)
  while (true) {
    for (const server of network) {
      if (!ns.hasRootAccess(server)) crack(ns, server);
    }
    await ns.sleep(10000)
  }
}
