"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // packages/client-metrics-web/package.json
  var require_package = __commonJS({
    "packages/client-metrics-web/package.json"(exports, module) {
      module.exports = {
        name: "@dotcom-reliability-kit/client-metrics-web",
        version: "0.1.4",
        description: "A client for sending operational metrics to client metrics server from the web",
        repository: {
          type: "git",
          url: "https://github.com/Financial-Times/dotcom-reliability-kit.git",
          directory: "packages/client-metrics-web"
        },
        homepage: "https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/client-metrics-web#readme",
        bugs: 'https://github.com/Financial-Times/dotcom-reliability-kit/issues?q=label:"package: client-metrics-web"',
        license: "MIT",
        scripts: {
          test: "jest"
        },
        engines: {
          node: "20.x || 22.x || 24.x"
        },
        main: "lib/index.js",
        types: "types/index.d.ts"
      };
    }
  });

  // packages/client-metrics-web/lib/queue/queue.js
  var require_queue = __commonJS({
    "packages/client-metrics-web/lib/queue/queue.js"(exports) {
      "use strict";
      var DEFAULT_QUEUE_CAPACITY = 1e4;
      exports.Queue = class Queue {
        /** @type { number } */
        #capacity;
        /**
         * @param {QueueOptions} [options]
         */
        constructor(options = {}) {
          this.#capacity = options.capacity || DEFAULT_QUEUE_CAPACITY;
        }
        /**
         * @type {QueueType['add']}
         */
        add(_item) {
          throw new Error("Must be implemented by subclass");
        }
        /**
         * @type {QueueType['drop']}
         */
        drop(_count) {
          throw new Error("Must be implemented by subclass");
        }
        /**
         * @type {QueueType['pull']}
         */
        pull(_count) {
          throw new Error("Must be implemented by subclass");
        }
        /**
         * @type {QueueType['capacity']}
         */
        get capacity() {
          return this.#capacity;
        }
        /**
         * @type {QueueType['size']}
         */
        get size() {
          throw new Error("Must be implemented by subclass");
        }
      };
    }
  });

  // packages/client-metrics-web/lib/queue/in-memory-queue.js
  var require_in_memory_queue = __commonJS({
    "packages/client-metrics-web/lib/queue/in-memory-queue.js"(exports) {
      "use strict";
      var { Queue } = require_queue();
      exports.InMemoryQueue = class InMemoryQueue extends Queue {
        /** @type { Metric[] } */
        #queue;
        /**
         * @param {QueueOptions} [options]
         */
        constructor(options) {
          super(options);
          this.#queue = [];
        }
        /**
         * @override
         * @type {InMemoryQueueType['add']}
         */
        add(item) {
          if (this.#queue.length >= this.capacity) {
            this.drop();
          }
          this.#queue.push(Object.freeze(item));
        }
        /**
         * @override
         * @type {InMemoryQueueType['drop']}
         * This method is dropping the oldest item(s) from the queue
         */
        drop(count = 1) {
          this.#queue = this.#queue.slice(count);
        }
        /**
         * @override
         * @type {InMemoryQueueType['pull']}
         */
        pull(count = 1) {
          return this.#queue.splice(0, count);
        }
        /**
         * @override
         * @type {InMemoryQueueType['size']}
         */
        get size() {
          return this.#queue.length;
        }
      };
    }
  });

  // packages/client-metrics-web/lib/metrics-client.js
  var require_metrics_client = __commonJS({
    "packages/client-metrics-web/lib/metrics-client.js"(exports) {
      "use strict";
      var { version } = require_package();
      var { InMemoryQueue } = require_in_memory_queue();
      var { Queue } = require_queue();
      var namespacePattern = /^([a-z0-9_-]+)(\.[a-z0-9_-]+)*$/i;
      var testHostnamePattern = /(local|test|staging)/i;
      var systemCodePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      exports.MetricsClient = class MetricsClient2 {
        /** @type {boolean} */
        #isAvailable = false;
        /** @type {boolean} */
        #isEnabled = false;
        /** @type {string} */
        #endpoint = "";
        /** @type {string} */
        #systemVersion = "0.0.0";
        /** @type {string} */
        #systemCode = "";
        /** @type {Queue}*/
        #queue;
        /** @type {number} */
        #batchSize = 20;
        /** @type {NodeJS.Timeout | undefined} */
        #timer;
        /** @type {number} */
        #elapsedSeconds = 0;
        /** @type {number} */
        #retentionPeriod = 10;
        /**
         * @param {MetricsClientOptions} options
         */
        constructor(options) {
          let { systemCode, systemVersion, environment, batchSize, retentionPeriod, queue } = options;
          if (queue) {
            if (!(queue instanceof Queue)) {
              throw new TypeError("The queue is not an instance of the base class Queue");
            }
            this.#queue = queue;
          } else {
            this.#queue = new InMemoryQueue();
          }
          try {
            if (typeof systemCode !== "string" || !systemCodePattern.test(systemCode)) {
              throw new Error(
                "systemCode must be be a combination of alphanumeric characters possibly separated by hyphens"
              );
            }
            if (systemVersion === void 0 || typeof systemVersion !== "string") {
              systemVersion = "0.0.0";
            }
            let baseUrl;
            if (environment !== void 0) {
              baseUrl = environment === "production" ? "https://client-metrics.ft.com/" : "https://client-metrics-test.ft.com/";
            } else {
              const hostname = window.location.hostname;
              baseUrl = testHostnamePattern.test(hostname) ? "https://client-metrics-test.ft.com/" : "https://client-metrics.ft.com/";
            }
            this.#endpoint = new URL("/api/v1/ingest", baseUrl).toString();
            this.#systemCode = systemCode;
            this.#systemVersion = systemVersion;
            if (batchSize && typeof batchSize === "number") {
              this.#batchSize = Math.max(batchSize, this.#batchSize);
            }
            if (retentionPeriod && typeof retentionPeriod === "number") {
              this.#retentionPeriod = Math.max(retentionPeriod, this.#retentionPeriod);
            }
            this.#handleMetricsEvent = this.#handleMetricsEvent.bind(this);
            this.#isAvailable = true;
            this.enable();
          } catch (error) {
            this.#isAvailable = false;
            console.warn(`Client not initialised: ${error.message}`);
          }
        }
        /** @type {MetricsClientType['isAvailable']} */
        get isAvailable() {
          return this.#isAvailable;
        }
        /** @type {MetricsClientType['isEnabled']} */
        get isEnabled() {
          return this.#isEnabled;
        }
        /** @type {MetricsClientType['endpoint']} */
        get endpoint() {
          return this.#endpoint;
        }
        /** @type {MetricsClientType['batchSize']} */
        get batchSize() {
          return this.#batchSize;
        }
        /** @type {MetricsClientType['retentionPeriod']} */
        get retentionPeriod() {
          return this.#retentionPeriod;
        }
        /** @type {MetricsClientType['systemVersion']} */
        get systemVersion() {
          return this.#systemVersion;
        }
        /** @type {MetricsClientType['queue']} */
        get queue() {
          return this.#queue;
        }
        /** @type {MetricsClientType['enable']} */
        enable() {
          if (this.#isAvailable && !this.#isEnabled) {
            window.addEventListener("ft.clientMetric", this.#handleMetricsEvent);
            this.#isEnabled = true;
            this.#startTimer();
          }
        }
        /** @type {MetricsClientType['disable']} */
        disable() {
          if (this.#isAvailable && this.#isEnabled) {
            window.removeEventListener("ft.clientMetric", this.#handleMetricsEvent);
            this.#isEnabled = false;
            this.#stopTimer();
          }
        }
        /** @type {MetricsClientType['recordEvent']} */
        recordEvent(namespace, data = {}) {
          if (!this.isAvailable || !this.#endpoint) {
            console.warn("Client not initialised properly, cannot record an event");
            return;
          }
          try {
            namespace = MetricsClient2.#resolveNamespace(namespace);
            const timestamp = Date.now();
            const batchedEvent = {
              namespace,
              timestamp,
              data
            };
            this.#queue.add(batchedEvent);
            if (this.#queue.size >= this.#batchSize) {
              this.#sendEvents();
            }
          } catch (error) {
            console.warn(`Invalid metrics event: ${error.message}`);
          }
        }
        #startTimer() {
          this.#timer = setInterval(() => {
            this.#elapsedSeconds += 1;
            if (this.#elapsedSeconds >= this.#retentionPeriod) {
              this.#sendEvents();
              this.#elapsedSeconds = 0;
            }
          }, 1e3);
        }
        #stopTimer() {
          clearInterval(this.#timer);
          this.#timer = void 0;
        }
        #resetTimer() {
          this.#elapsedSeconds = 0;
        }
        #sendEvents() {
          if (!this.#queue.size || !this.#isEnabled) {
            return;
          }
          this.#resetTimer();
          const numberOfEvents = this.#queue.size >= this.#batchSize ? this.#batchSize : this.#queue.size;
          const events = this.#queue.pull(numberOfEvents).map((batchedEvent) => {
            return {
              namespace: batchedEvent.namespace,
              systemCode: this.#systemCode,
              systemVersion: this.#systemVersion,
              eventTimestamp: batchedEvent.timestamp,
              data: batchedEvent.data
            };
          });
          fetch(this.#endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": `FTSystem/cp-client-metrics/${version}`
            },
            body: JSON.stringify(events)
          }).catch((error) => {
            console.warn("Error happened during fetch: ", error);
          });
          if (this.#queue.size) {
            this.#sendEvents();
          }
        }
        /**
         * @param {Event} event
         */
        #handleMetricsEvent = (event) => {
          try {
            if (event instanceof CustomEvent) {
              const { namespace, ...data } = MetricsClient2.#resolveEventDetail(event.detail);
              this.recordEvent(namespace, data);
            }
          } catch (error) {
            console.warn(`Invalid metrics event: ${error.message}`);
          }
        };
        /**
         * @param {string} namespace
         * @returns {string}
         */
        static #resolveNamespace(namespace) {
          if (typeof namespace !== "string") {
            throw new TypeError(`namespace (${typeof namespace}) must be a string`);
          }
          if (!namespacePattern.test(namespace)) {
            throw new TypeError(
              `namespace ("${namespace}") must be a combination of alphanumeric characters, underscores, and hyphens, possibly separated by periods`
            );
          }
          return namespace.toLowerCase();
        }
        /**
         * @param {any} detail
         * @returns {MetricsEvent}
         */
        static #resolveEventDetail(detail) {
          if (typeof detail !== "object" || detail === null || Array.isArray(detail)) {
            throw new TypeError("detail must be an object");
          }
          if (typeof detail.namespace !== "string") {
            throw new TypeError(`detail.namespace (${typeof detail.namespace}) must be a string`);
          }
          return detail;
        }
      };
    }
  });

  // packages/client-metrics-web/lib/index.js
  var require_lib = __commonJS({
    "packages/client-metrics-web/lib/index.js"(exports, module) {
      "use strict";
      var { MetricsClient: MetricsClient2 } = require_metrics_client();
      var { InMemoryQueue } = require_in_memory_queue();
      var { Queue } = require_queue();
      module.exports = {
        MetricsClient: MetricsClient2,
        InMemoryQueue,
        Queue
      };
    }
  });

  // test-metrics/client.js
  var { MetricsClient } = require_lib();
  window.metrics = new MetricsClient({
    environment: "production",
    systemCode: "dotcom-reliability-kit"
  });
})();
