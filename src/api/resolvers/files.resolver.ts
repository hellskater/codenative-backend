import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import {
  File,
  GetFileInput,
  GetProjectsInput,
  SaveFileInput
} from '@api/schema/files.schema'
import FileService from '@api/services/files.service'

@Resolver()
export default class FileResolver {
  constructor (private readonly fileService: FileService) {
    this.fileService = new FileService()
  }

  @Mutation(() => Boolean, { nullable: true })
  async saveFiles (@Arg('input') input: SaveFileInput) {
    return await this.fileService.saveFiles(input)
  }

  @Query(() => [File], { nullable: true })
  async getFiles (@Arg('input') input: GetFileInput) {
    return await this.fileService.getFiles(input)
  }

  @Query(() => [String])
  async getProjects (@Arg('input') input: GetProjectsInput) {
    return await this.fileService.getProjects(input)
  }
}
