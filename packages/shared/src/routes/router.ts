import { compile, PathFunctionOptions } from 'path-to-regexp'

type PathMaker<Params, Required extends boolean> = Required extends true
  ? (paramsMap: Params, options?: PathFunctionOptions) => string
  : (paramsMap?: Params, options?: PathFunctionOptions) => string

type Params<K extends string, V = string> = { [key in K]: V }
type FactoryParams<T> = { [key in keyof T]: T[key] | number }

function makePathsFrom<Params = void>(path: string) {
  // https://github.com/pillarjs/path-to-regexp#compile-reverse-path-to-regexp
  return compile(path) as PathMaker<Params, Params extends void ? false : true>
}

export interface RouteTypes {
  home: void
  docs: { home: void; api: void }
  features: { home: void; bundle: void; lab: void; source: void }
  projects: void
  notFound: void
  status: void
  license: void
  accessToken: void
  me: { home: void; editPassword: void; resetPassword: void }
  login: void
  importGithub: void
  register: void
  project: {
    home: Params<'projectId'>
    feature: Params<'projectId'> & Partial<Params<'feature'>>
    statistics: { home: Params<'projectId'>; artifacts: Params<'projectId'>; snapshots: Params<'projectId'> }
    bundle: {
      home: Params<'projectId'>
      detail: Params<'projectId' | 'bundleId'>
      jobBundleContent: Params<'projectId' | 'bundleId'>
    }
    lab: { home: Params<'projectId'>; report: Params<'projectId' | 'reportId'> & Partial<Params<'tabName'>> }
    competitor: { home: Params<'projectId'>; report: Params<'projectId' | 'tabName'> }
    source: Params<'projectId'>
    report: Params<'projectId'>
    settings: Params<'projectId'> & Partial<Params<'settingName'>>
    jobTrace: Params<'projectId' | 'type' | 'entityId'>
  }
  admin: {
    home: void
    part: Partial<Params<'part'>>
    settings: void
    status: void
    applications: void
    runners: void
    scripts: void
  }
}

export const staticPath = {
  home: '/',
  docs: { home: '/docs', api: '/docs/api' },
  features: { home: '/features', bundle: '/features/bundle', lab: '/features/lab', source: '/features/source' },
  projects: '/projects',
  notFound: '/404',
  status: '/status',
  license: '/license',
  accessToken: '/access-token',
  me: { home: '/me', editPassword: '/me/edit-password', resetPassword: '/me/reset-password' },
  login: '/login',
  importGithub: '/import/github',
  register: '/register',
  project: {
    home: '/projects/:projectId/home',
    feature: '/projects/:projectId/:feature?',
    statistics: {
      home: '/projects/:projectId/statistics',
      artifacts: '/projects/:projectId/statistics/artifacts',
      snapshots: '/projects/:projectId/statistics/snapshots',
    },
    bundle: {
      home: '/projects/:projectId/bundle',
      detail: '/projects/:projectId/bundle/:bundleId',
      jobBundleContent: '/projects/:projectId/bundle/:bundleId/bundle-content',
    },
    lab: { home: '/projects/:projectId/lab', report: '/projects/:projectId/lab/reports/:reportId/:tabName?' },
    competitor: { home: '/projects/:projectId/competitor', report: '/projects/:projectId/competitor/reports/:tabName' },
    source: '/projects/:projectId/source',
    report: '/projects/:projectId/report',
    settings: '/projects/:projectId/settings/:settingName?',
    jobTrace: '/projects/:projectId/jobs/:type/:entityId',
  },
  admin: {
    home: '/admin',
    part: '/admin/:part?',
    settings: '/admin/settings',
    status: '/admin/status',
    applications: '/admin/applications',
    runners: '/admin/runners',
    scripts: '/admin/runner-scripts',
  },
}

export const pathFactory = {
  home: makePathsFrom<FactoryParams<RouteTypes['home']>>('/'),
  docs: {
    home: makePathsFrom<FactoryParams<RouteTypes['docs']['home']>>('/docs'),
    api: makePathsFrom<FactoryParams<RouteTypes['docs']['api']>>('/docs/api'),
  },
  features: {
    home: makePathsFrom<FactoryParams<RouteTypes['features']['home']>>('/features'),
    bundle: makePathsFrom<FactoryParams<RouteTypes['features']['bundle']>>('/features/bundle'),
    lab: makePathsFrom<FactoryParams<RouteTypes['features']['lab']>>('/features/lab'),
    source: makePathsFrom<FactoryParams<RouteTypes['features']['source']>>('/features/source'),
  },
  projects: makePathsFrom<FactoryParams<RouteTypes['projects']>>('/projects'),
  notFound: makePathsFrom<FactoryParams<RouteTypes['notFound']>>('/404'),
  status: makePathsFrom<FactoryParams<RouteTypes['status']>>('/status'),
  license: makePathsFrom<FactoryParams<RouteTypes['license']>>('/license'),
  accessToken: makePathsFrom<FactoryParams<RouteTypes['accessToken']>>('/access-token'),
  me: {
    home: makePathsFrom<FactoryParams<RouteTypes['me']['home']>>('/me'),
    editPassword: makePathsFrom<FactoryParams<RouteTypes['me']['editPassword']>>('/me/edit-password'),
    resetPassword: makePathsFrom<FactoryParams<RouteTypes['me']['resetPassword']>>('/me/reset-password'),
  },
  login: makePathsFrom<FactoryParams<RouteTypes['login']>>('/login'),
  importGithub: makePathsFrom<FactoryParams<RouteTypes['importGithub']>>('/import/github'),
  register: makePathsFrom<FactoryParams<RouteTypes['register']>>('/register'),
  project: {
    home: makePathsFrom<FactoryParams<RouteTypes['project']['home']>>('/projects/:projectId/home'),
    feature: makePathsFrom<FactoryParams<RouteTypes['project']['feature']>>('/projects/:projectId/:feature?'),
    statistics: {
      home: makePathsFrom<FactoryParams<RouteTypes['project']['statistics']['home']>>(
        '/projects/:projectId/statistics',
      ),
      artifacts: makePathsFrom<FactoryParams<RouteTypes['project']['statistics']['artifacts']>>(
        '/projects/:projectId/statistics/artifacts',
      ),
      snapshots: makePathsFrom<FactoryParams<RouteTypes['project']['statistics']['snapshots']>>(
        '/projects/:projectId/statistics/snapshots',
      ),
    },
    bundle: {
      home: makePathsFrom<FactoryParams<RouteTypes['project']['bundle']['home']>>('/projects/:projectId/bundle'),
      detail: makePathsFrom<FactoryParams<RouteTypes['project']['bundle']['detail']>>(
        '/projects/:projectId/bundle/:bundleId',
      ),
      jobBundleContent: makePathsFrom<FactoryParams<RouteTypes['project']['bundle']['jobBundleContent']>>(
        '/projects/:projectId/bundle/:bundleId/bundle-content',
      ),
    },
    lab: {
      home: makePathsFrom<FactoryParams<RouteTypes['project']['lab']['home']>>('/projects/:projectId/lab'),
      report: makePathsFrom<FactoryParams<RouteTypes['project']['lab']['report']>>(
        '/projects/:projectId/lab/reports/:reportId/:tabName?',
      ),
    },
    competitor: {
      home: makePathsFrom<FactoryParams<RouteTypes['project']['competitor']['home']>>(
        '/projects/:projectId/competitor',
      ),
      report: makePathsFrom<FactoryParams<RouteTypes['project']['competitor']['report']>>(
        '/projects/:projectId/competitor/reports/:tabName',
      ),
    },
    source: makePathsFrom<FactoryParams<RouteTypes['project']['source']>>('/projects/:projectId/source'),
    report: makePathsFrom<FactoryParams<RouteTypes['project']['report']>>('/projects/:projectId/report'),
    settings: makePathsFrom<FactoryParams<RouteTypes['project']['settings']>>(
      '/projects/:projectId/settings/:settingName?',
    ),
    jobTrace: makePathsFrom<FactoryParams<RouteTypes['project']['jobTrace']>>(
      '/projects/:projectId/jobs/:type/:entityId',
    ),
  },
  admin: {
    home: makePathsFrom<FactoryParams<RouteTypes['admin']['home']>>('/admin'),
    part: makePathsFrom<FactoryParams<RouteTypes['admin']['part']>>('/admin/:part?'),
    settings: makePathsFrom<FactoryParams<RouteTypes['admin']['settings']>>('/admin/settings'),
    status: makePathsFrom<FactoryParams<RouteTypes['admin']['status']>>('/admin/status'),
    applications: makePathsFrom<FactoryParams<RouteTypes['admin']['applications']>>('/admin/applications'),
    runners: makePathsFrom<FactoryParams<RouteTypes['admin']['runners']>>('/admin/runners'),
    scripts: makePathsFrom<FactoryParams<RouteTypes['admin']['scripts']>>('/admin/runner-scripts'),
  },
}
