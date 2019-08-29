const { Kafka: KafkaClient } = require('kafkajs');
const comma = require('comma-separated-tokens');
const Trigger = require('../Trigger');

/**
 * Kafka Trigger implementation
 */
class Kafka extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            brokers: this.joi.string().required(),
            topic: this.joi.string().default('wud-image'),
            clientId: this.joi.string().default('wud'),
            ssl: this.joi.boolean().default(false),
            authentication: this.joi.object({
                type: this.joi.string()
                    .allow('PLAIN')
                    .allow('SCRAM-SHA-256')
                    .allow('SCRAM-SHA-512')
                    .default('PLAIN'),
                user: this.joi.string().required(),
                password: this.joi.string().required(),
            }),
        });
    }

    initTrigger() {
        const brokers = comma.parse(this.configuration.brokers, {
            padLeft: true,
            padRight: true,
        });
        const clientConfiguration = {
            clientId: this.configuration.clientId,
            brokers,
            ssl: this.configuration.ssl,
        };
        if (this.configuration.authentication) {
            clientConfiguration.sasl = {
                mechanism: this.configuration.authentication.type,
                username: this.configuration.authentication.user,
                password: this.configuration.authentication.password,
            };
        }
        this.kafka = new KafkaClient(clientConfiguration);
    }

    /**
     * Send a record to a Kafka topic with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        const producer = this.kafka.producer();
        await producer.connect();
        return producer.send({
            topic: this.configuration.topic,
            messages: [{ value: JSON.stringify(image) }],
        });
    }
}

module.exports = Kafka;
