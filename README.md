# MiniNmnmer
This is a small teleprecense robot project to connect hearts that are over 10000 km away.

# Message Format
## Moving The Teleprecense Robot Forward Over MQTT
- Message is sent to teleprecense-control
- Message format is as follows
{
    "event": "move",
    "data": "forward"
}