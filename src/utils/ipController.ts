import {
  DescribeTasksCommand,
  ECSClient,
  ListTasksCommand,
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
  static async issueIp() {
    try {
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
        slug,
      };

      return data;
    } catch (error: any) {
      console.log(error);
    }
  }

  static async destroyIp(taskData: { taskId: string; slug: string }) {
    try {
      await destroyContainer(taskData.taskId);
      await axios.post(`${PROXY_SERVER}/ip/destroy`, {
        slug: taskData.slug,
      });
    } catch (error: any) {
      console.log(error);
    }
  }
}

const getIpFromServer = async () => {
  const command = new RunTaskCommand({
    launchType: "FARGATE",
    cluster: "Codenative-cluster",
    taskDefinition: "codenative-td",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [
          "subnet-05b6b015635666ff0",
          "subnet-0c7cda2246157d37e",
          "subnet-0cec20742d02736d8",
          "subnet-06532c97b6e2c1f74",
        ],
        securityGroups: ["sg-0aa33ce4c7aed217c"],
        assignPublicIp: "ENABLED",
      },
    },
    platformVersion: "LATEST",
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
    cluster: "Codenative-cluster",
    task: taskArn,
  });

  await client.send(stopTaskCommand);
};
