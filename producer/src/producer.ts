import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "eventhorizon-producer",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function main() {
  await producer.connect();

  const result = await producer.send({
    topic: "orders",
    messages: [
      {
        key: "125",
        value: JSON.stringify({ orderId: "125", status: "CREATED" }),
      },
    ],
  });

  console.log(result);

  await producer.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await producer.disconnect();
  process.exit(1);
});
