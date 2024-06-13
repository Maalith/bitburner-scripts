/** @param {NS} ns */
export async function main(ns) {
  // get the details of the server
  const server = ns.args[0]
  const serverStats = ns.getServer(server)
  if (ns.fileExists("BruteSSH.exe", 'home') && !serverStats.sshPortOpen) ns.brutessh(server);
  if (ns.fileExists("FTPCrack.exe", 'home') && !serverStats.ftpPortOpen) ns.ftpcrack(server);
  if (ns.fileExists("relaySMTP.exe", 'home') && !serverStats.smtpPortOpen) ns.relaysmtp(server);
  if (ns.fileExists("HTTPWorm.exe", 'home') && !serverStats.httpPortOpen) ns.httpworm(server);
  if (ns.fileExists("SQLInject.exe", 'home') && !serverStats.sqlPortOpen) ns.sqlinject(server);
  if (serverStats.numOpenPortsRequired <= serverStats.openPortCount) ns.nuke(server);
  if (ns.hasRootAccess(server)) ns.tprint('Succesfully opened ' + server)
}
