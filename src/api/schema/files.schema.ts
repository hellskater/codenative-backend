import { getModelForClass, prop } from "@typegoose/typegoose";
import {
  Field as GqlField,
  InputType,
  ObjectType as GqlType,
} from "type-graphql";

@InputType()
export class FileInputType {
  @GqlField((_type) => String)
  name: string;

  @GqlField((_type) => String)
  type: string;

  @GqlField((_type) => String, { nullable: true })
  content?: string;
}
@GqlType()
export class File {
  @GqlField((_type) => String)
  @prop({ required: true })
  public name: string;

  @GqlField((_type) => String)
  @prop({ required: true })
  public type: string;

  @GqlField((_type) => String, { nullable: true })
  @prop({ required: false })
  public content?: string;
}

@GqlType()
class Project {
  @GqlField((_type) => String)
  @prop({ required: true })
  public name: string;

  @GqlField((_type) => [File])
  @prop({ required: true, type: () => [File] })
  public files: File[];
}

@GqlType()
class User {
  @GqlField((_type) => String)
  @prop({ required: true })
  public name: string;

  @GqlField((_type) => Project)
  @prop({ required: true, type: () => Project })
  public project: Project;
}

const model = getModelForClass<typeof User>(User, {
  options: {
    customName: "users",
  },
});

export default model;

@InputType()
export class SaveFileInput {
  @GqlField()
  user: string;

  @GqlField()
  projectName: string;

  @GqlField((_type) => [FileInputType])
  files: File[];
}

@InputType()
export class GetFileInput {
  @GqlField()
  user: string;

  @GqlField()
  projectName: string;
}

@InputType()
export class GetProjectsInput {
  @GqlField()
  user: string;
}
