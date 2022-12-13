import UsersSchema, {
  GetFileInput,
  SaveFileInput,
  GetProjectsInput
} from '@api/schema/files.schema'

class FileService {
  async saveFiles ({ files, user, projectName }: SaveFileInput) {
    const result = await UsersSchema.updateOne(
      {
        name: user,
        'project.name': projectName
      },
      {
        $set: {
          'project.files': files
        }
      },
      { upsert: true }
    )

    if (result) {
      return true
    }

    return false
  }

  async getFiles ({ projectName, user }: GetFileInput) {
    const userData = await UsersSchema.findOne({
      name: user,
      'project.name': projectName
    })

    const projectData = JSON.parse(JSON.stringify(userData))?.project

    if (projectData) return projectData.files
    return null
  }

  async getProjects ({ user }: GetProjectsInput) {
    const userData = await UsersSchema.find({
      name: user
    })

    const projectData = JSON.parse(JSON.stringify(userData))?.map(
      (val: any) => val.project.name
    )

    return projectData
  }
}

export default FileService
