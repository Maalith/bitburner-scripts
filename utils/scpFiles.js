/** @param {NS} ns */
export async function main(ns) {
  const server = ns.args[0]
  ns.scp('basics/HostHack.js', server, 'home')
  ns.scp('basics/TargetHack.js', server, 'home')
  ns.scp('basics/TargetGrow.js', server, 'home')
  ns.scp('basics/TargetWeaken.js', server, 'home')
  ns.scp('perm_attack.js', server, 'home')
  ns.scp('route.js', server, 'home')
}
