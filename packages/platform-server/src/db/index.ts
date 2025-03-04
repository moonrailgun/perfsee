/*
Copyright 2022 ByteDance and/or its affiliates.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Config } from '../config'

import { mysqlEntities, DBService } from './service/mysql'
import { SnakeNamingStrategy } from './mysql/utils'

@Module({
  imports: [TypeOrmModule.forFeature(mysqlEntities)],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {
  static forRoot() {
    return [
      TypeOrmModule.forRootAsync({
        async useFactory(config: Config) {
          return {
            ...config.mysql,
            type: 'mysql',
            namingStrategy: new SnakeNamingStrategy(),
            entities: mysqlEntities,
            migrations: [],
            migrationsRun: false,
            synchronize: false,
            logging: process.env.LOG_DB ? 'all' : ['error'],
          }
        },
        inject: [Config],
      }),
    ]
  }
}

export { DBService, mysqlEntities }
export * from './mysql'
