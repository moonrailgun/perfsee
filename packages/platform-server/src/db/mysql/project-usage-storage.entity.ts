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

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  RelationId,
  Index,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Project } from './project.entity'

@Entity()
@ObjectType()
export class ProjectStorageUsage extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @Field()
  @Column()
  @RelationId('project')
  @Index()
  projectId!: number

  @OneToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn()
  project!: Project

  @Field({ description: 'total storage used size' })
  @Column({ default: 0 })
  storageSize!: number

  @UpdateDateColumn({ type: 'timestamp' })
  @Field(() => GraphQLISODateTime)
  updatedAt!: Date
}
