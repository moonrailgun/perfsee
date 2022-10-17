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

import { Switch } from 'react-router'

import { NotFound, Route } from '@perfsee/components'
import { staticPath, titleFactory } from '@perfsee/shared/routes'

import { LoginRedirect } from '../modules/login/login-redirect'
import { User } from '../modules/shared'

import {
  StatusPage,
  LicensePage,
  ProjectListPage,
  ProjectFeaturePage,
  Applications,
  AccessToken,
  ImportGithub,
  Login,
  Register,
  EditPassword,
  ResetPassword,
  Me,
  HomePage,
  FeaturesBundle,
  FeaturesLab,
  FeaturesSource,
} from './lazy-modules'

export const Routes = ({ user }: { user: User | null }) => {
  return (
    <Switch>
      {/* pages without login */}
      <Route exact={true} path={staticPath.home} title={titleFactory.home} component={HomePage} />
      <Route
        exact={true}
        path={staticPath.features.bundle}
        title={titleFactory.features.bundle}
        component={FeaturesBundle}
      />
      <Route exact={true} path={staticPath.features.lab} title={titleFactory.features.lab} component={FeaturesLab} />
      <Route
        exact={true}
        path={staticPath.features.source}
        title={titleFactory.features.source}
        component={FeaturesSource}
      />

      <Route exact={true} path={staticPath.login} title={titleFactory.login} component={Login} />
      <Route exact={true} path={staticPath.register} title={titleFactory.register} component={Register} />
      <Route exact={true} path={staticPath.status} title={titleFactory.status} component={StatusPage} />
      <Route exact={true} path={staticPath.license} title={titleFactory.license} component={LicensePage} />
      <Route
        exact={true}
        path={staticPath.me.editPassword}
        title={titleFactory.me.editPassword}
        component={EditPassword}
      />
      <Route
        exact={true}
        path={staticPath.me.resetPassword}
        title={titleFactory.me.resetPassword}
        component={ResetPassword}
      />

      {/* pages with login */}
      {user ? (
        <Switch>
          <Route
            exact={true}
            path={staticPath.importGithub}
            title={titleFactory.importGithub}
            component={ImportGithub}
          />
          <Route exact={true} path={staticPath.me.home} title={titleFactory.me.home} component={Me} />
          <Route exact={true} path={staticPath.projects} title={titleFactory.projects} component={ProjectListPage} />
          {user.isAdmin && (
            <Route
              exact={true}
              path={staticPath.applications}
              title={titleFactory.applications}
              component={Applications}
            />
          )}
          <Route exact={true} path={staticPath.accessToken} title={titleFactory.accessToken} component={AccessToken} />
          <Route
            path={staticPath.project.feature}
            title={titleFactory.project.feature}
            component={ProjectFeaturePage}
          />
          <Route path="*" title={titleFactory.notFound} render={NotFound} />
        </Switch>
      ) : (
        <LoginRedirect />
      )}
    </Switch>
  )
}
