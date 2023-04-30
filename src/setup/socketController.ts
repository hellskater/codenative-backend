import http from "http";
import { Socket, Server } from "socket.io";
import { IpController } from "../utils/ipController";
import { redisClient } from "./redis";

export class SocketController {
  init(server: http.Server): void {
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    console.log("Waiting for clients to connect...");

    io.on("connection", (socket: Socket) => {
      console.log(`Client: ${socket.id} connected`);

      socket.on("disconnect", async (err) => {
        console.log(`Client: ${socket.id} disconnected because of ${err}`);
        setTimeout(async () => {
          const taskData = await this.getTaskData(socket.id);
          await IpController.destroyIp(taskData);
          await this.deleteTaskId(socket.id);
        }, 10000);
      });

      socket.on("request", async (input: string) => {
        if (input === "assignIp") {
          const ipData = await IpController.issueIp();

          await this.addTaskId(ipData!?.taskArn, socket.id, ipData!?.slug);

          if (ipData) {
            setTimeout(() => {
              socket.emit("response", JSON.stringify(ipData));
            }, 1000);
          }
        }
      });
    });
  }

  async addTaskId(
    taskId: string,
    socketId: string,
    slug: string
  ): Promise<void> {
    const tasks = JSON.parse((await redisClient.get("tasks")) || "{}");
    tasks[socketId] = {
      taskId,
      slug,
    };
    await redisClient.set("tasks", JSON.stringify(tasks));
  }

  async getTaskData(
    socketId: string
  ): Promise<{ taskId: string; slug: string }> {
    const tasks = JSON.parse((await redisClient.get("tasks")) || "{}");
    return tasks[socketId];
  }

  async deleteTaskId(socketId: string): Promise<void> {
    const tasks = JSON.parse((await redisClient.get("tasks")) || "{}");
    delete tasks[socketId];
    await redisClient.set("tasks", JSON.stringify(tasks));
  }
}
