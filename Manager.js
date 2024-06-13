/** @param {NS} ns */
function multiscan(ns, server) {
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
function getThreads(ns, server) {
  // Get the max ram on a server; Get the Used Ram on a Server.
  // Floor the amount of unused ram to how many Grow/Weaken threads it can run(Hack threads use 1.7 ram)
  const serverStats = ns.getServer(server)
  let maxRam = serverStats.maxRam
  const usedRam = serverStats.ramUsed
  if (server == 'home') maxRam = maxRam - 512;

  // Temp using 2.45 just to calculate for Host hack while I finish the Larger block of code below
  const threads = Math.floor((maxRam - usedRam) / 2.45)
  return threads
}
function disLogs(ns) {
  ns.disableLog('ALL')
  ns.enableLog('exec')
}
function prepServer(ns, target, attackHostServerList, allowedThreads) {
  // Use all availible threads to reduce the threads on the weakest target into compliance.
}
function findAttackServers(ns, hostServers, allocatedThreads) {
  // Declare our list
  let serverList = []
  let sortedServerList = []

  for (const server of hostServers) {
    if (getThreads(ns, server) >= allocatedThreads && allocatedThreads != 0) {
      serverList.push({
        name: server,
        threadcount: allocatedThreads
      })
      allocatedThreads -= allocatedThreads
    } else if (getThreads(ns, server) == allocatedThreads && allocatedThreads != 0) {
      serverList.push({
        name: server,
        threadcount: allocatedThreads
      })
      allocatedThreads -= allocatedThreads
    } else if (getThreads(ns, server) < allocatedThreads && allocatedThreads != 0) {
      serverList.push({
        name: server,
        threadcount: getThreads(ns, server)
      })
      allocatedThreads -= getThreads(ns, server)
    }
  }
  for (let i = 0; i < serverList.length; i++) {
    const node = serverList[i]
    if (node.threadcount > 0) {
      sortedServerList.push(node)
    }
  }
  return (sortedServerList)
}
function attackServer(ns, target, hostServers, allowedThreads) {
  // We have found a target with less threads needed threads then our network has. launch an attack
  let attackHostServerList = findAttackServers(ns, hostServers, allowedThreads.total)
  //ns.tprint(attackHostServerList)
  //ns.tprint(target)
}
function bestTarget(ns, sortedTargetServers) {
  let target = 'n00dles'
  for (const server of sortedTargetServers) {
    let targetStats = ns.getServer(target)
    let serverStats = ns.getServer(server)
    let targetAttackViability = (targetStats.moneyMax / targetStats.hackDifficulty)
    let serverAttackViability = (serverStats.moneyMax / serverStats.hackDifficulty)
    if (targetAttackViability < serverAttackViability) {
      target = server
    }
  }
  return target;
}

export async function main(ns) {

  // Disable uneeded Logs
  disLogs(ns)

  while (true) {
    // First Declare our globals
    var network = multiscan(ns, 'home')
    var hostServers = []
    var targetServers = []

    // Check every server in the network.
    for (const server of network) {
      const serverStats = ns.getServer(server)
      // if we dont have root access, run the breakIn function (Line 25)
      if (!serverStats.hasAdminRights) ns.run('utils/breakIn.js', 1, server);
      else {
        // When we have root access get the server details

        // Re copy all scripts to servers in case there was an update
        if (!ns.fileExists('utils/route.js', server)) {
          ns.run('utils/scpFiles.js', 1, server)
        }

        // If we dont have a backdoor to the server and we can hack it. Flag it in the terminal
        if (!serverStats.backdoorInstalled && !serverStats.purchasedByPlayer && ns.getHackingLevel() >= serverStats.requiredHackingSkill) {
          ns.run('utils/route.js', 1, server)
        }
        // If the server needs more money or less security Prep it, Otherwise we can attack it
        if (serverStats.moneyMax > 0 && (serverStats.requiredHackingSkill < ns.getHackingLevel())) {
          targetServers.push(server)
        }
        // If the server has ram on it we can use it
        if (serverStats.maxRam > 0 && (ns.getServerRequiredHackingLevel(server) < (ns.getHackingLevel() / 3))) {
          hostServers.push(server)
        }
      }
    }

    // Sort the Target list by hacking difficulty.
    var sortedTargetServers = targetServers.sort((a, b) => {
      const requiredHackingA = ns.getServerRequiredHackingLevel(a)
      const requiredHackingB = ns.getServerRequiredHackingLevel(b)
      return requiredHackingA < requiredHackingB
    })

    // Basic setup for hacking while I patch code below
    for (const server of hostServers) {
      const target = bestTarget(ns, sortedTargetServers)
      let serverSec = ns.getServerMinSecurityLevel(target)
      let serverMaxSec = serverSec + 2
      let serverCash = ns.getServerMoneyAvailable(target)
      let serverMaxCash = ns.getServerMaxMoney(target)
      if (getThreads(ns, server) > 0) {
        if (ns.getServerSecurityLevel(target) > serverMaxSec) {
          ns.exec('basics/TargetWeaken.js', server, getThreads(ns, server), target)
        } else if (serverCash < serverMaxCash * .8) {
          ns.exec('basics/TargetGrow.js', server, getThreads(ns, server), target)
        } else {
          ns.exec('basics/TargetHack.js', server, getThreads(ns, server), target)
        }
      }
    }

    // For every server in the target list check if we have enough threads to run a batch attack
    for (const server of sortedTargetServers) {
      // Establish Basic Information about the server
      const serverStats = ns.getServer(server)
      let currentMoney = serverStats.moneyAvailable
      const maxMoney = serverStats.moneyMax
      const currentSecurity = serverStats.hackDifficulty
      const minSecurity = serverStats.minDifficulty
      if(currentMoney == 0) currentMoney = 1

      // Get our thread counts for each Step we need to preform
      const hackAmount = ns.hackAnalyze(server) * currentMoney
      const numGrowThreads = Math.ceil(ns.growthAnalyze(server, (maxMoney / currentMoney))) // Bug?
      const firstWeakenThreads = Math.ceil((currentSecurity - minSecurity) / .05)
      const hackThreads = Math.ceil((maxMoney * .1) / hackAmount)
      const secondWeakenThreads = Math.ceil((hackThreads / 25) + (numGrowThreads / 2))
      const totalThreads = numGrowThreads + firstWeakenThreads + hackThreads + secondWeakenThreads

      // See how many threads we can run on our current network
      var availibleNetworkThreads = 0
      for (const server of hostServers) {
        availibleNetworkThreads += getThreads(ns, server)
      }
      var allowedThreads = {
        total: totalThreads,
        numGrowThreads: numGrowThreads,
        firstWeakenThreads: firstWeakenThreads,
        secondWeakenThreads: secondWeakenThreads,
        hackThreads: hackThreads
      }

      // If we can run a full batch against the server Print the info to terminal
      if (totalThreads <= availibleNetworkThreads) {
        // Now that we have basic information and we can attack. Establish the target and send it to the attack Function
        const target = server
        let allocatedThreads = totalThreads
        attackServer(ns, target, hostServers, allowedThreads)
      } else { } // End the for loop here because there are no targets we can launch a batch against
    }
    // Run the prepServer script here against the weakest target.
    // we can only run prep against one server as it needs more threads then our network has access to.
    const target = sortedTargetServers[0]
    prepServer((ns, target, hostServers, allowedThreads))

    await ns.sleep(1000)
  }
}
