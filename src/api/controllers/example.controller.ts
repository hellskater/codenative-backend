import { Request, Response } from 'express'

export class ExampleController {
  static async getExample (req: Request, res: Response): Promise<void> {
    res.send('Hello World srini!')
  }
}
