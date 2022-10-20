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

import { SourceMapRedis } from '@perfsee/platform-server/redis'

export interface SourceMapTrackParams {
  artifactId: number
  artifactName: string
  scripts: {
    hash: string
    filePath: string
  }[]
}

export type SourceMapSearchResult = { artifactId: number; artifactName: string; filePath: string }[]

const KEYS_PREFIX = 'SM:'

@Injectable()
export class SourceMapService {
  constructor(private readonly redis: SourceMapRedis) {}

  async track(projectId: number, params: SourceMapTrackParams) {
    for (const script of params.scripts) {
      const key = `${KEYS_PREFIX}${projectId}:${script.hash}`
      await this.redis.lpush(key, encodeScriptRecord(params.artifactId, params.artifactName, script.filePath))
      await this.redis.expire(key, 60 * 24 * 60 * 60 /* 60 days */)
    }
  }

  async search(projectId: number, scriptHash: string): Promise<SourceMapSearchResult> {
    return (await this.redis.lrange(`${KEYS_PREFIX}${projectId}:${scriptHash}`, 0, -1)).map(decodeScriptRecord)
  }

  async analyze<T extends { hash: string }>(
    projectId: number,
    scripts: T[],
  ): Promise<{ script: T; artifact?: { id: number; name: string; filePath: string } }[]> {
    const searchResults = []

    for (const script of scripts) {
      const searchResult = await this.search(projectId, script.hash)
      searchResults.push({
        records: searchResult,
        script,
      })
    }

    const usage: { [artifactName: string]: { [artifactId: string]: number } } = {}

    for (const script of searchResults) {
      for (const record of script.records) {
        if (typeof usage[record.artifactName] === 'undefined') {
          usage[record.artifactName] = {}
        }
        if (typeof usage[record.artifactName][record.artifactId] === 'undefined') {
          usage[record.artifactName][record.artifactId] = 1
        } else {
          usage[record.artifactName][record.artifactId]++
        }
      }
    }

    const names: { artifactName: string; score: number; artifactId: number }[] = []

    for (const artifactName in usage) {
      const ids = Object.entries(usage[artifactName])
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .sort((a, b) => b[1] - a[1])
      if (ids.length === 0) {
        continue
      }
      const top = parseInt(ids[0][0])
      const score = ids.reduce((a, b) => a[1] + b[1], 0)
      names.push({
        artifactName,
        score,
        artifactId: top,
      })
    }

    const sorted = names.sort((a, b) => b.score - a.score)

    const result: { script: T; artifact?: { id: number; name: string; filePath: string } }[] = []

    for (const script of searchResults) {
      let match = undefined
      for (const artifact of sorted) {
        match = script.records.find((record) => record.artifactId === artifact.artifactId)
        if (match) {
          break
        }
      }

      if (match) {
        result.push({
          script: script.script,
          artifact: { id: match.artifactId, name: match.artifactName, filePath: match.filePath },
        })
      } else {
        result.push({
          script: script.script,
          artifact: undefined,
        })
      }
    }

    return result
  }
}

function encodeScriptRecord(artifactId: number, artifactName: string, filePath: string) {
  return JSON.stringify({
    aId: artifactId,
    aName: artifactName,
    path: filePath,
  })
}

function decodeScriptRecord(data: string) {
  const json = JSON.parse(data)
  return {
    artifactId: json.aId,
    artifactName: json.aName,
    filePath: json.path,
  }
}
