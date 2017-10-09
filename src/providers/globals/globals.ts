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
    this.config = EnvConfig
  }
  getEnv(): EnvironmentConfig {
    return this.config
  }
}
