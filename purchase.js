/** @param {NS} ns */
function getPlayerMoney(ns) { // Keeps 200k avalible for my to buy a ToR router
  const playerMoney = ns.getServerMoneyAvailable('home') - 200000
  return playerMoney
}
//HackNet Purchases
function hacknetfunc(ns) {
  let currentnodes = ns.hacknet.numNodes()
  if (currentnodes == 0) {
    if (getPlayerMoney(ns) >= ns.hacknet.getPurchaseNodeCost(0)) {
      ns.hacknet.purchaseNode(0)
    }
  } else {
    for (let i = 0; i < currentnodes; i++) {
      const hacknetNodeStats = ns.hacknet.getNodeStats(i)
      // Hacknet 'Level' Block; 200 is the max level for a node
      if (hacknetNodeStats.level == 1) { //When its lvl 1 go to 10.
        if (ns.hacknet.getLevelUpgradeCost(i, 9) <= getPlayerMoney(ns)) {
          ns.hacknet.upgradeLevel(i, 9)
        }
      } else if (hacknetNodeStats.level < 200) { // Upgrade Levels by 10s
        if (ns.hacknet.getLevelUpgradeCost(i, 10) <= getPlayerMoney(ns)) {
          ns.hacknet.upgradeLevel(i, 10)
        }
      }
      // Hacknet 'Ram' Block; 64gb is the max ram for a node
      if (hacknetNodeStats.ram < 64 && ns.hacknet.getRamUpgradeCost(i) < getPlayerMoney(ns)) {
        ns.hacknet.upgradeRam(i)
      }
      // Hacknet 'Core' Block; 16 cores is the max for a node
      if (hacknetNodeStats.cores < 16 && ns.hacknet.getCoreUpgradeCost(i) < getPlayerMoney(ns)) {
        ns.hacknet.upgradeCore(i)
      }
      //Purchase New Node Block
      if (ns.hacknet.getPurchaseNodeCost(i + 1) < getPlayerMoney(ns) && currentnodes < 14) {
        ns.hacknet.purchaseNode(i + 1)
      }
    }
  }
}
//Server Purchases
function serverPurchaseFunc(ns) {
  const serversowned = ns.getPurchasedServers()
  const serverPrefix = 'server-'
  if (serversowned.length == 0 && getPlayerMoney(ns) > ns.getPurchasedServerCost(4)) ns.purchaseServer(serverPrefix + String(serversowned.length), 4)
  for (const server of serversowned) {
    const pserverstats = ns.getServer(server)
    if (serversowned.length < 25) {
      if (ns.getPurchasedServerCost(4) < getPlayerMoney(ns)) {
        ns.purchaseServer(serverPrefix + String(serversowned.length), 4)
      }
    }
    if (pserverstats.maxRam < ns.getPurchasedServerMaxRam() / 128 && ns.getPurchasedServerUpgradeCost(server, pserverstats.maxRam * 2) < getPlayerMoney(ns)) {
      ns.upgradePurchasedServer(server, pserverstats.maxRam * 2)
    }
  }
}
export async function main(ns) {
  /**
   * things to add here eventually, A Hacknet Server purchase script(Once I figure out what those are),
   * my stockmarket purchase script.
   */
  while (true) {
    serverPurchaseFunc(ns)
    hacknetfunc(ns)
    await ns.sleep(1000)
  }
}
