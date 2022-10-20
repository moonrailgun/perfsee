import { faker } from '@faker-js/faker'

import { Project, ProjectJobUsage, ProjectStorageUsage, ProjectUsagePack } from '@perfsee/platform-server/db'
import test, { createMock, initTestDB, createDBTestingModule, create } from '@perfsee/platform-server/test'

import { ProjectService } from '../../project/service'
import { ProjectUsageService } from '../service'

let project: Project

test.beforeEach(async (t) => {
  t.context.module = await createDBTestingModule({
    providers: [ProjectUsageService],
  })
    .useMocker(createMock)
    .compile()

  await initTestDB()

  project = await Project.findOneByOrFail({ id: 1 })
})

test.serial('verify project usage limit', async (t) => {
  const service = t.context.module.get(ProjectUsageService)
  const projectService = t.context.module.get(ProjectService)

  projectService.loader.load = () => Promise.resolve(project)
  const result = await service.verifyUsageLimit(1)

  t.truthy(result)
})

test.serial('verify project usage fail', async (t) => {
  const service = t.context.module.get(ProjectUsageService)
  const projectService = t.context.module.get(ProjectService)

  const pack = await create(ProjectUsagePack, {
    jobCountMonthly: 1,
    jobDurationMonthly: 1,
    storageSize: 1,
    name: 'test',
  })
  const project2 = await create(Project, {
    usagePackId: pack.id,
  })
  const jobUsage = await create(ProjectJobUsage, {
    projectId: project2.id,
    jobCount: 2,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  })

  projectService.loader.load = () => Promise.resolve(project2)

  // exceed job count limit
  await t.throwsAsync(
    async () => {
      await service.verifyUsageLimit(project2.id)
    },
    { message: 'Project job count usage in this month has exceeded.' },
  )

  // exceed job duration limit
  await ProjectJobUsage.update(jobUsage.id, { jobCount: 0, jobDuration: 2 })
  await t.throwsAsync(
    async () => {
      await service.verifyUsageLimit(project2.id)
    },
    { message: 'Project job duration time in this month has exceeded.' },
  )

  // exceed project storage size limit
  await ProjectJobUsage.update(jobUsage.id, { jobCount: 0, jobDuration: 0 })
  await create(ProjectStorageUsage, {
    projectId: project2.id,
    storageSize: 2,
  })
  await t.throwsAsync(
    async () => {
      await service.verifyUsageLimit(project2.id)
    },
    { message: 'Project storage size has exceeded.' },
  )
})

test.serial('get project usage', async (t) => {
  const service = t.context.module.get(ProjectUsageService)
  const projectService = t.context.module.get(ProjectService)

  const project2 = await create(Project)
  const jobUsage = await create(ProjectJobUsage, {
    projectId: project2.id,
    jobCount: faker.datatype.number(),
    jobDuration: faker.datatype.number(),
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  })
  const storageUsage = await create(ProjectStorageUsage, {
    projectId: project2.id,
    storageSize: faker.datatype.number(),
  })

  projectService.loader.load = () => Promise.resolve(project2)

  const result = await service.getProjectUsage(project2)

  t.is(result.jobCount, jobUsage.jobCount)
  t.is(result.jobDuration, jobUsage.jobDuration)
  t.is(result.storageSize, storageUsage.storageSize)
})

test.serial('get project usage pack', async (t) => {
  const service = t.context.module.get(ProjectUsageService)

  const result = await service.getProjectUsageLimit(project)

  t.is(result.jobCountMonthly, -1)
  t.is(result.jobDurationMonthly, -1)
  t.is(result.storageSize, -1)
})

test.serial('record job count usage', async (t) => {
  const service = t.context.module.get(ProjectUsageService)
  const jobUsageParam = {
    projectId: project.id,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  }

  await service.recordJobCountUsage(project.id, 1)
  const result = await ProjectJobUsage.findOneBy(jobUsageParam)
  t.is(result?.jobCount, 1)

  await service.recordJobCountUsage(project.id, 1)
  const result2 = await ProjectJobUsage.findOneBy(jobUsageParam)
  t.is(result2?.jobCount, 2)
})

test.serial('record job duration usage', async (t) => {
  const service = t.context.module.get(ProjectUsageService)
  const jobUsageParam = {
    projectId: project.id,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  }

  await service.recordJobDurationUsage(project.id, 1)
  const result = await ProjectJobUsage.findOneBy(jobUsageParam)
  t.is(result?.jobDuration, 1)

  await service.recordJobDurationUsage(project.id, 1)
  const result2 = await ProjectJobUsage.findOneBy(jobUsageParam)
  t.is(result2?.jobDuration, 2)
})

test.serial('record project storage usage', async (t) => {
  const service = t.context.module.get(ProjectUsageService)

  await service.recordStorageUsage(project.id, 1)
  const result = await ProjectStorageUsage.findOneBy({ projectId: project.id })
  t.is(result?.storageSize, 1)

  await service.recordStorageUsage(project.id, 1)
  const result2 = await ProjectStorageUsage.findOneBy({ projectId: project.id })
  t.is(result2?.storageSize, 2)

  await service.recordStorageUsage(project.id, 1, true)
  const result3 = await ProjectStorageUsage.findOneBy({ projectId: project.id })
  t.is(result3?.storageSize, 1)
})
