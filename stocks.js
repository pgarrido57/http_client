'use strict';

const { get } = require('http');
const { readFile } = require('fs');
let [,,company] = process.argv;

get(`http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/JSON?parameters={"Normalized":false,"NumberOfDays":252,"DataPeriod":"Day","Elements":[{"Symbol":"${company}","Type":"price","Params":["c"]}]}`, res => {
  const statusCode = res.statusCode;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n Status Code: ${statusCode}`);
  } else if (!/^text\/javascript/.test(contentType)) {
    error = new Error(`Invalid content-type.\n Expected text/javascript but received ${contentType}`);
  }

  if (error) {
    console.log(error.message);
    res.resume();
    return;
  }

  let body = '';
  res.on('data', (buff) => {
    console.log("status:", statusCode);
    body += buff.toString()
  });

  res.on('end', () => {
	    const data = JSON.parse(body);
	    let stockPrice = data.Elements[0].DataSeries.close.values
	    let total = stockPrice.reduce((a, b) => {
	    	return Math.round(a + b)
	    });
	    console.log("The average stock price is currently: $", total / stockPrice.length)
	  });
});
