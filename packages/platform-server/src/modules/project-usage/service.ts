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

import { Injectable } from '@nestjs/common'

import { DBService, Project, ProjectJobUsage, ProjectStorageUsage, ProjectUsagePack } from '@perfsee/platform-server/db'
import { Logger } from '@perfsee/platform-server/logger'
import { PrettyBytes } from '@perfsee/shared'

import { ProjectService } from '../project/service'

@Injectable()
export class ProjectUsageService {
  constructor(
    private readonly db: DBService,
    private readonly project: ProjectService,
    private readonly logger: Logger,
  ) {}

  async verifyUsageLimit(projectId: number) {
    const project = await this.project.loader.load(projectId)

    if (!project) {
      throw new Error(`No such project by id ${projectId}`)
    }

    const usage = await this.getProjectUsage(project)
    const limit = await this.getProjectUsageLimit(project)

    if (!limit) {
      throw new Error('Project has no usage pack.')
    }

    if (limit.jobCountMonthly !== -1 && usage.jobCount >= limit.jobCountMonthly) {
      throw new Error('Project job count usage in this month has exceeded.')
    }

    if (limit.jobDurationMonthly !== -1 && usage.jobDuration >= limit.jobDurationMonthly) {
      throw new Error('Project job duration time in this month has exceeded.')
    }

    if (limit.storageSize !== -1 && usage.storageSize >= limit.storageSize) {
      throw new Error('Project storage size has exceeded.')
    }

    return true
  }

  async getProjectUsage(project: Project) {
    const [year, month] = this.getDate()

    const jobUsage = await ProjectJobUsage.findOneBy({ projectId: project.id, year, month })
    const storageUsage = await ProjectStorageUsage.findOneBy({ projectId: project.id })

    return {
      jobCount: jobUsage?.jobCount ?? 0,
      jobDuration: jobUsage?.jobDuration ?? 0,
      storageSize: storageUsage?.storageSize ?? 0,
    }
  }

  getProjectUsageLimit(project: Project) {
    if (project.usagePackId) {
      return ProjectUsagePack.findOneByOrFail({ id: project.usagePackId })
    }

    return ProjectUsagePack.findOneByOrFail({ isDefault: true })
  }

  async recordStorageUsage(projectId: number, storage: number, remove = false) {
    const record = await ProjectStorageUsage.findOneBy({ projectId })

    if (record) {
      await this.db.connection
        .createQueryBuilder()
        .update(ProjectStorageUsage)
        .set({
          storageSize: () => `storage_size ${remove ? '-' : '+'} ${storage}`,
        })
        .where({ projectId })
        .execute()
    } else if (!remove) {
      await ProjectStorageUsage.create({
        projectId,
        storageSize: storage,
      }).save()
    }

    this.logger.verbose(`Record strorage usage ${PrettyBytes.create(storage).toString()} to project ${projectId}`)
  }

  async recordJobCountUsage(projectId: number, count: number) {
    const [year, month] = this.getDate()
    const record = await ProjectJobUsage.findOneBy({ projectId, year, month })

    if (record) {
      await this.db.connection
        .createQueryBuilder()
        .update(ProjectJobUsage)
        .set({
          jobCount: () => `job_count + ${count}`,
        })
        .where({ projectId })
        .execute()
    } else {
      await ProjectJobUsage.create({
        projectId,
        year,
        month,
        jobCount: count,
      }).save()
    }

    this.logger.verbose(`Record job count usage ${count} to project ${projectId}`)
  }

  async recordJobDurationUsage(projectId: number, duration: number) {
    const [year, month] = this.getDate()
    const record = await ProjectJobUsage.findOneBy({ projectId, year, month })

    if (record) {
      await this.db.connection
        .createQueryBuilder()
        .update(ProjectJobUsage)
        .set({
          jobDuration: () => `job_duration + ${duration}`,
        })
        .where({ projectId })
        .execute()
    } else {
      await ProjectJobUsage.create({
        projectId,
        year,
        month,
        jobDuration: duration,
      }).save()
    }

    this.logger.verbose(`Record job count usage ${duration} to project ${projectId}`)
  }

  private getDate() {
    const date = new Date()
    return [date.getFullYear(), date.getMonth() + 1]
  }
}
