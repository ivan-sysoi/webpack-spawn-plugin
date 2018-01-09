// @flow
import spawn from 'cross-spawn'
import taskkill from 'taskkill'
import treeKill from 'treekill'

type Options = {
  when: string,
  stdio: string,
}

const kill = pid => (
  process.platform === 'win32'
    ? taskkill(pid, { force: true, tree: true })
    : new Promise((resolve, reject) => {
      treeKill(pid, 'SIGKILL', (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(null);
        }
      });
    })
)

class SpawnPlugin {
  pid: any
  when: string
  args: any[]

  constructor(
    command: string,
    args: any[] = [],
    { when = 'done', stdio = 'inherit', ...options }: Options = {}
  ) {
    this.when = when
    this.args = [command, args, { stdio, ...options }]
  }

  apply(compiler: any) {
    compiler.plugin(this.when, () => {
      const promise = this.pid ? kill(this.pid) : Promise.resolve()
      const doSpawn = () => {
        const server = spawn(...this.args)
        this.pid = server.pid
      }
      promise.then(doSpawn).catch(doSpawn)
    })
  }
}

module.exports = SpawnPlugin
