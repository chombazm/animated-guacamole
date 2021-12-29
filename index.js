#!/usr/bin/env node
"use strict";
const path = require("path");
const fs = require("fs")
const util = require("util")
const Transform = require("stream").Transform
const zlib = require("zlib");
const args = require('minimist')(process.argv.slice(2), {
    boolean: ["help", "in", "out", "compress"],
    string: ["file"]
})
console.log(args);
const BASE_PATH = path.resolve(
    process.env.BASE_PATH || __dirname
);

let OUTFILE = path.join(BASE_PATH, "out.txt");
if (args.help) {
    console.log("");
    printHelp();
} else if(args.in || args._.includes("-")) {
    // TODO : Read from std in
    processFile(process.stdnin)
}
else if (args.file) {
    let stream = fs.createReadStream(path.join(BASE_PATH, args.file))
    processFile(stream)
}else {
    error("Incorrect usage.", true);
}

function processFile(inStream) {
    let outStream = inStream;

    const upperStream = new Transform ({
        transform(chunk,enc,cb) {
            this.push(chunk.toString().toUpperCase());
            cb();
        }
    })

    outStream = outStream.pipe(upperStream)

    if (args.compress) {
        let gzipStream = zlib.createGzip();
        outStream = outStream.pipe(gzipStream);
        OUTFILE = `${OUTFILE}.gz`
    }

    var targetStream;
    if (args.out) {
      targetStream  = process.stdout
    }else {
        targetStream = fs.createWriteStream(OUTFILE);
    }

    outStream.pipe(targetStream);  
}

// *********************
function error(msg, canPrintHelp = false) {
    console.error(msg);
    if (canPrintHelp) {
        console.log("");
        printHelp();
    }
}
function printHelp() {
    console.log("ex1.js usage: ")
    console.log("   ex1.js --file {FILENAME}");
    console.log("");
    console.log("--help                    Print this help");
    console.log("--file{FILENAME}          Process this help");
    console.log("--in -                    process stdin");
    console.log("--out                     write to out.txt");
    console.log("--compress                gzip the output");
    console.log("");
}
