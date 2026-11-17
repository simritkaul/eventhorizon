import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "eventhorizon-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "analytics-consumer" });

async function main() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "orders",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const { offset, key, value } = message;
      console.log({
        partition,
        offset,
        key: key?.toString(),
        value: value?.toString(),
      });
    },
  });
}

async function shutdown() {
  await consumer.disconnect();
  process.exit(1);
}

main().catch(async (err) => {
  console.error(err);
  shutdown();
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
