"use strict";

import { createClient, RedisClientOptions, RedisClientType } from 'redis';
// import * as util from "util";
// import * as _ from "lodash";
// import { JOB_SCHEDULER_TYPE, SERVER } from "@config/index";
// import { logger } from "@lib/logger";
// import { loginHistoryDao } from "@dao/index";
// import {
// 	isObjectId
// } from "@utils/appUtils";


// let pub, sub;

export class RedisClient {
	private client: any;
	init() {
		// const _this = this;
		// const CONF = { db: process.env.REDIS_DB };
		const redisOptions: RedisClientOptions = {
			url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
			database: Number(process.env.REDIS_DB || 0)
		};
		this.client = createClient(redisOptions);
		this.client.on("ready", () => {
			console.log(`Redis server listening on ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}, in ${process.env.REDIS_DB} DB`);
		});
		this.client.on("error", (error: any) => {
			console.error("Error in Redis", error);
			console.log("Redis connection error:::::", error);
		});

		this.client.connect().then(() => {
			console.log('Connected to Redis');
		}).catch((err: any) => {
			console.error('Redis Connection Error', err);
		});
		// .: Activate "notify-keyspace-events" for expired type events
		// 	pub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		// 	sub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		// 	pub.send_command("config", ["set", "notify-keyspace-events", "Ex"], SubscribeExpired);
		// 	// .: Subscribe to the "notify-keyspace-events" channel used for expired type events
		// 	function SubscribeExpired(e, r) {
		// 		const expired_subKey = "__keyevent@" + CONF.db + "__:expired";
		// 		sub.subscribe(expired_subKey, function () {
		// 			// console.log(" [i] Subscribed to \"" + expired_subKey + "\" event channel : " + r);
		// 			sub.on("message", function (chan, msg) {
		// 				// console.log("[expired]", msg);
		// 				_this.listenJobs(msg);
		// 			});
		// 		});
		// 	}
	}


	async set(key: string, value: string, exp?: number) {
		// client.set(['framework', 'AngularJS']);
		return await this.client.set(key, value)

	}

	async get(key: string) {
		// client.set(['framework', 'AngularJS']);
		return await this.client.get(key)
	}


}
export const redisClient = new RedisClient();