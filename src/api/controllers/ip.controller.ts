import { Request, Response } from "express";
import {
  DescribeTasksCommand,
  ECSClient,
  RunTaskCommand,
  StopTaskCommand,
} from "@aws-sdk/client-ecs";
import {
  EC2Client,
  DescribeNetworkInterfacesCommand,
} from "@aws-sdk/client-ec2";
import namor from "namor";
import axios from "axios";

import { env } from "@config/env";

const AWS_ACCESS_KEY_ID = env.awsAccessKeyId as string;
const AWS_SECRET_ACCESS_KEY = env.awsSecretAccessKey as string;
const PROXY_SERVER = env.proxyServer as string;

const client = new ECSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const ec2client = new EC2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export class IpController {
  static async issueIp(req: Request, res: Response): Promise<void> {
    try {
      const { user, projectName } = req.body;

      if (!user) {
        res.status(400).send({
          success: false,
          message: "provide username",
        });
        return;
      }

      if (!projectName) {
        res.status(400).send({
          success: false,
          message: "provide projectName",
        });
        return;
      }

      const { publicIpAddress, taskArn } = await getIpFromServer();

      const slug = namor.generate({ subset: "manly", words: 2, saltLength: 0 });

      await axios.post(`${PROXY_SERVER}/ip/get`, {
        ip: publicIpAddress,
        slug,
      });

      const data = {
        urls: {
          api: `https://${slug}.codenative.link:1338`,
          preview: `https://${slug}.codenative.link:9080`,
          // api: "http://localhost:1338",
          // preview: "http://localhost:9080",
        },
        taskArn,
      };

      res.status(200).send({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  }

  static async destroyIp(req: Request, res: Response) {
    try {
      const { taskArn } = req.body;

      if (!taskArn) {
        res.status(400).send({
          success: false,
          message: "provide taskArn",
        });
        return;
      }

      await destroyContainer(taskArn);

      res.status(200).send({
        success: true,
      });
    } catch (error: any) {
      res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  }
}

const getIpFromServer = async () => {
  const command = new RunTaskCommand({
    cluster: "Codedamn",
    taskDefinition: "test-new",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ["subnet-01aab69fca2c9cead", "subnet-0ef2b41665fe306f9"],
        securityGroups: ["sg-0aa33ce4c7aed217c"],
        assignPublicIp: "ENABLED",
      },
    },
  });

  const response = await client.send(command);

  const taskArn =
    response.tasks != null ? (response.tasks[0].taskArn as string) : "";

  const getContainerIP = async (): Promise<string> => {
    return await new Promise(function (resolve, reject) {
      setTimeout(getTaskDetails, 6000);

      async function getTaskDetails() {
        const taskCommand = new DescribeTasksCommand({
          tasks: [taskArn],
          cluster: "Codedamn",
        });
        const task = await client.send(taskCommand);

        // get network ID from result
        let eni = "";

        const details =
          task.tasks != null
            ? task.tasks[0].attachments != null
              ? task.tasks[0].attachments[0].details
              : []
            : [];

        for (const i in details) {
          if (!Object.prototype.hasOwnProperty.call(details, i)) continue;
          if (details[i as any].name !== "networkInterfaceId") continue;

          // get the eni
          eni = details[i as any].value as string;
          break;
        }

        await getNetworkDetails(eni);
      }

      const getNetworkDetails = async (eni: string) => {
        const networkCommand = new DescribeNetworkInterfacesCommand({
          NetworkInterfaceIds: [eni],
        });
        const networkRes = await ec2client.send(networkCommand);
        const ip =
          networkRes.NetworkInterfaces != null
            ? networkRes.NetworkInterfaces[0].Association != null
              ? networkRes.NetworkInterfaces[0].Association.PublicIp
              : ""
            : "";

        resolve(ip as string);
      };
    });
  };

  const publicIpAddress = await getContainerIP();

  return { publicIpAddress, taskArn };
};

const destroyContainer = async (taskArn: string) => {
  const stopTaskCommand = new StopTaskCommand({
    cluster: "Codedamn",
    task: taskArn,
  });

  await client.send(stopTaskCommand);
};
