import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "eventhorizon-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "notification-service" });

async function main() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "orders",
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
}

main().catch(async (err) => {
  console.error(err);
  await consumer.disconnect();
  process.exit(1);
});
