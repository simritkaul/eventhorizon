import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "eventhorizon-producer-keys",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

await producer.connect();

const keys = ["customer-1", "customer-2", "customer-3"];

for (let i = 18; i < 27; i++) {
  const key = keys[i % keys.length]!;
  const [meta] = await producer.send({
    topic: "orders-p3",
    messages: [
      {
        key,
        value: JSON.stringify({ seq: i, key }),
      },
    ],
  });

  if (!meta) throw new Error("no metadata returned");

  console.log(
    `seq=${i} key=${key} -> partition=${meta.partition} offset=${meta.baseOffset}`,
  );
}
