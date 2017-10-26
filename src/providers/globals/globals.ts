import { Injectable } from '@angular/core'
import { EnvConfig } from '../../app/environment'

export interface EnvironmentConfig {
  name: string
  hosts: string[]
  fbConfig: {
    functionsDomain: string
  }
}

@Injectable()
export class GlobalsProvider {
  config: EnvironmentConfig
  constructor() {
    this.config = EnvConfig.find((x) => {
      return x.hosts.indexOf(window.location.hostname) !== -1
    })
    console.log('using envConfig', this.config)
  }
  getEnv(): EnvironmentConfig {
    return this.config
  }
}
