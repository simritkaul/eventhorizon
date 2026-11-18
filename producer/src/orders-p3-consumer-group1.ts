import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "eventhorizon-consumer-p3",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({
  groupId: "p3-group",
});

await consumer.connect();
await consumer.subscribe({
  topic: "orders-p3",
  fromBeginning: true,
});

await consumer.run({
  eachMessage: async ({ partition, message }) => {
    console.log({
      partition,
      offset: message.offset,
      key: message.key?.toString(),
      value: message.value?.toString(),
    });
  },
});

async function shutdown() {
  await consumer.disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
