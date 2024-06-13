/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    let target = ns.getHostname()
    let serverSec = ns.getServerMinSecurityLevel(target)
    let serverMaxSec = serverSec + 1
    let serverCash = ns.getServerMoneyAvailable(target)
    let serverMaxCash = ns.getServerMaxMoney(target)
    if (ns.getServerSecurityLevel(target) > serverMaxSec) {
      await ns.weaken(target)
    } else if (serverCash < serverMaxCash * .8) {
      await ns.grow(target)
    } else {
      await ns.hack(target)
      //await ns.sleep(4500)
    }
  }
}
