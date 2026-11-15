# EventHorizon

> Exploring the mechanics of event-driven distributed systems.

EventHorizon is a hands-on learning project for Apache Kafka, event-driven architecture (EDA) and distributed systems.

It will eventually grow into a miniature e-commerce order-processing system, but the application is not the point. The point is to understand how event-driven systems work internally: why they exist, what problems they solve, and how to build reliable ones, by building, observing, deliberately breaking and fixing them.

## Stack

| Area               | Tool                                     |
| ------------------ | ---------------------------------------- |
| Language / runtime | TypeScript on Node.js                    |
| Messaging          | Apache Kafka (single broker, KRaft mode) |
| Kafka client       | KafkaJS                                  |
| Inspection         | Kafka UI                                 |
| Infrastructure     | Docker, Docker Compose                   |
| Database (later)   | PostgreSQL                               |
| HTTP layer (later) | Express                                  |

Postgres and Express are not used yet. They arrive with the Order Service.

## Current status

**Phase 0: Environment and foundations**

- [x] Single-broker Kafka and Kafka UI running via Docker Compose
- [x] Topic `orders` (1 partition) created and populated by hand in Kafka UI
- [x] Minimal TypeScript producer
- [x] Minimal TypeScript consumer using a consumer group
- [ ] Experiment: two consumers in the same group, then produce a message
- [ ] Experiment: two consumers in different groups

## Repository layout

```
eventhorizon/
├── docker-compose.yml   # Kafka broker + Kafka UI
├── producer/            # Node + TypeScript playground (producer.ts and consumer.ts)
│   ├── src/
│   └── README.md
├── docs/
│   └── commands.md      # Every command used so far
├── .gitignore
└── README.md
```

## Quick start

Prerequisites: Docker with Compose, and a current Node.js LTS.

```bash
# 1. Start Kafka and Kafka UI
docker compose up -d

# 2. In Kafka UI (http://localhost:8080) create a topic named "orders" with 1 partition

# 3. Install dependencies
cd producer
npm install

# 4. Run a consumer in one terminal
npx tsx src/consumer.ts

# 5. Run the producer in another terminal
npx tsx src/producer.ts
```

Full command history: [docs/commands.md](docs/commands.md).

## Ports and listeners

The broker advertises two addresses, because "where is Kafka?" depends on who is asking.

| Listener   | Address          | Used by                                            |
| ---------- | ---------------- | -------------------------------------------------- |
| `HOST`     | `localhost:9092` | Node apps running on the host machine              |
| `INTERNAL` | `kafka:19092`    | Other containers on the Compose network (Kafka UI) |

Kafka UI itself is at http://localhost:8080.

The Compose file sets replication factors to 1 because there is only one broker. This setup has no fault tolerance, on purpose. A multi-broker cluster comes later for replication experiments.

## Learning log

Concepts covered so far:

- **Why brokers exist.** Synchronous service-to-service calls couple services together, add latency and multiply failure risk. Publishing a fact and letting interested services react removes that coupling, at the price of new problems: redelivery, eventual consistency, ordering, and a new critical piece of infrastructure.
- **Queue vs log.** A classic queue deletes messages once they are acknowledged. Kafka keeps an append-only log, and each consumer group tracks its own position in it.
- **Offsets** are permanent per-partition position labels assigned by the broker. They are not row counts.
- **Committed offsets** are stored by the broker per consumer group (in the internal `__consumer_offsets` topic). The consumer's bookmark lives on the broker, not in the app.
- **`fromBeginning`** only applies when a group has no committed offset yet. After that, the committed offset wins.
- **Producers choose what to write, the broker chooses where.** The offset in the send result was assigned by the broker.

Open questions and experiments are tracked in the status list above.

## Roadmap

0. Environment and foundations
1. Kafka fundamentals: topics, partitions, keys, offsets, consumer groups
2. Event-driven architecture: events vs commands, independent consumers
3. Reliability and delivery semantics: acks, commits, retries, idempotency, dead-letter topics
4. Ordering, partitioning and scalability
5. Reliable event-driven architecture: outbox pattern, sagas, schema evolution
6. Production readiness and system design
