import { Redis } from "ioredis";

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
// pass username: "default" & password below if you want too // needs Redis >= 6
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
  db: 0, // Defaults to 0
});

export default redis;
