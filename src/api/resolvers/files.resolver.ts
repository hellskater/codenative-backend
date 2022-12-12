import { Arg, Mutation, Query, Resolver } from "type-graphql";
import {
  File,
  GetFileInput,
  GetProjectsInput,
  SaveFileInput,
} from "@api/schema/files.schema";
import FileService from "@api/services/files.service";

@Resolver()
export default class FileResolver {
  constructor(private fileService: FileService) {
    this.fileService = new FileService();
  }

  @Mutation(() => Boolean!, { nullable: true })
  saveFiles(@Arg("input") input: SaveFileInput) {
    return this.fileService.saveFiles(input);
  }

  @Query(() => [File], { nullable: true })
  getFiles(@Arg("input") input: GetFileInput) {
    return this.fileService.getFiles(input);
  }

  @Query(() => [String])
  getProjects(@Arg("input") input: GetProjectsInput) {
    return this.fileService.getProjects(input);
  }
}
