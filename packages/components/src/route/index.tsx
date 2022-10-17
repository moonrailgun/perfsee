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

import { useMemo } from 'react'
import { Route as ReactRoute } from 'react-router'
import type { RouteProps as ReactRouteProps } from 'react-router'

import { Helmet } from '../helmet'

interface RouteProps extends ReactRouteProps {
  title?: (data: any) => string
  // transferred by Switch component
  computedMatch?: any
}

export const Route = (props: RouteProps) => {
  const { title, computedMatch, ...routeProps } = props

  const titleString = useMemo(() => {
    if (!title) {
      return null
    }

    return title(computedMatch?.params ?? {})
  }, [computedMatch?.params, title])

  if (titleString) {
    return (
      <>
        <Helmet title={titleString} />
        <ReactRoute {...routeProps} />
      </>
    )
  }

  return <ReactRoute {...routeProps} />
}
