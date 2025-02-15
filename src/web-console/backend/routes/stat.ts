import express from "express";
import { totalmem, freemem, cpus } from "os";
import bot from "ROOT";
import { parseZone } from "moment";
import { formatMemories } from "../utils/format";

interface DayData {
	dayID: string;
	data: { hour: string, detail: string }[];
}

interface WeekData {
	week: number;
	data: DayData;
}

export default express.Router().get( "/", async ( req, res ) => {
	/* 前端传参为某周周日的日期 */
	const date = new Date( <string>req.query.start );
	
	try {
		/* 日期信息 */
		const weakData: WeekData[] = [];
		for ( let i = 0; i < 7; i++ ) {
			const dayID: string = parseZone( date ).format( "yy/MM/DD" );
			const hours: string[] = await bot.redis.getKeysByPrefix( `adachi.command-stat-${ dayID }` );
			const subData: DayData = { dayID, data: [] };
			
			for ( let hour of hours ) {
				const h: string = <string>hour.split( "/" ).pop();
				const data: string = <string>await bot.redis.getString( hour );
				subData.data.push( { hour: h, detail: data } );
			}
			weakData.push( { week: i, data: subData } );
			date.setDate( date.getDate() + 1 );
		}
		
		/* 用户数量 */
		const userData: string[] = await bot.redis.getKeysByPrefix( "adachi.user-used-groups-" );
		const userCount = userData.length;
		
		/* 群组数量 */
		const groupCount = bot.client.gl.size;
		
		/* 内存占用 */
		const totalMem = formatMemories( totalmem(), "G" );
		const usedMem = formatMemories( totalmem() - freemem(), "G" );
		const memories = { usedMem, totalMem };
		
		/* cpu 使用率 */
		const cpuList = cpus();
		let cpuFree = 0;
		cpuList.forEach( ( cpu, idx, arr ) => {
			const { idle, user, nice, sys, irq } = cpu.times;
			cpuFree += idle / ( idle + user + nice + sys + irq ) / cpuList.length;
		} );
		const cpuUsed = `${ ( ( 1 - cpuFree ) * 100 ).toFixed( 2 ) }%`;
		
		const resp = { weakData, userCount, groupCount, memories, cpuUsed };
		res.status( 200 ).send( { code: 200, data: resp } );
	} catch ( error ) {
		res.status( 500 ).send( { code: 500, data: {}, msg: "Server Error" } );
	}
} );