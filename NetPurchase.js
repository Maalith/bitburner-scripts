/** @param {NS} ns */
export async function main(ns) {
  const lvlGoal = 200
  const ramGoal = 64
  const coreGoal = 16

  while (true) {
    // SERVER NODES
    let servercount = ns.getPurchasedServers().length
    if (servercount == 0 && (ns.getPurchasedServerCost(8)) < (ns.getServerMoneyAvailable('home') * .05)) {
      ns.purchaseServer(('pServer-' + servercount), 8)
    }
    servercount = ns.getPurchasedServers().length
    if ((ns.getPurchasedServerCost(8)) < (ns.getServerMoneyAvailable('home') * .05) && servercount != 25) {
      ns.purchaseServer(('pServer-' + servercount), 8)
    }
    for (let i = 0; i < servercount; i++) {
      let nodeRam = ns.getServerMaxRam('pServer-' + i)
      const maxRam = ns.getPurchasedServerMaxRam() / 32
      if (nodeRam < maxRam && (ns.getPurchasedServerUpgradeCost('pServer-' + i, nodeRam *= 2)) < (ns.getServerMoneyAvailable('home') * .05)) {
        ns.upgradePurchasedServer('pServer-' + i, nodeRam *= 2)
      }
    }


    // HACK NET NODES
    if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes() && ns.hacknet.getPurchaseNodeCost() < (ns.getServerMoneyAvailable('home') * .05)) {
      ns.hacknet.purchaseNode()
    }
    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
      if (ns.hacknet.numNodes() == 0 && ns.hacknet.getPurchaseNodeCost() < (ns.getServerMoneyAvailable('home') * .05)) {
        ns.hacknet.purchaseNode()
      }
      else {
        const nodeStats = ns.hacknet.getNodeStats(i)
        if ((ns.hacknet.getLevelUpgradeCost(i)) < (ns.getServerMoneyAvailable('home') * .05) && nodeStats.level < lvlGoal) {
          ns.hacknet.upgradeLevel(i)
        }
        if (ns.hacknet.getRamUpgradeCost(i) < (ns.getServerMoneyAvailable('home') * .05) && nodeStats.ram < ramGoal) {
          ns.hacknet.upgradeRam(i)
        }
        if (ns.hacknet.getCoreUpgradeCost(i) < (ns.getServerMoneyAvailable('home') * .05) && nodeStats.cores < coreGoal) {
          ns.hacknet.upgradeCore(i)
        }
      }
    }
    await ns.sleep(1000)
  }
}
