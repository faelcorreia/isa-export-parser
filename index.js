var fs = require("fs")
var parser = require("./parser/parser.js")
var sidsParser = require("./parser/sids-parser.js")
var gulp = require("gulp")
var _ = require("lodash")
var prompt = require("prompt")
var async = require("async")

var saveFiles = function(parsed, parsedJsonName, parsedCsvName, callback) {
    fs.writeFileSync(parsedJsonName, JSON.stringify(parsed.json), "utf8")
    console.log(parsedJsonName + " saved.")
    fs.writeFileSync(parsedCsvName, parsed.csv, "utf8")
    console.log(parsedCsvName + " saved.")
    console.log("")
    if (callback)
        callback()
}

var parseSids = function(parsed, parsedJsonName, parsedCsvName, callback) {
    var sids = []
    parsed.json.forEach(function(line, index) {
        if (index > 0) {
            if (_.isArray(line[2])) {
                line[2].forEach(function(sid) {
                    sids.push(sid)
                })
            }
        }
    })
    console.log("Type the variables needed to parse the SIDs:")
    console.log("")
    var properties = [{
        name: "ldapUrl",
        validator: /^ldap:\/\/.*$/,
        warning: "URL must start with ldap://.",
        required: true
    }, {
        name: "baseDN",
        required: true
    }, {
        name: "username",
        required: true
    }, {
        name: 'password',
        hidden: true,
        required: true
    }]
    prompt.start()
    prompt.get(properties, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            sidsParser.parseSids(result.ldapUrl, result.baseDN,
                result.username, result.password, sids,
                function(result) {
                    console.log("")
                    parsed.json.forEach(function(line, index) {
                        if (index > 0) {
                            if (_.isArray(line[2])) {
                                line[2].forEach(function(sid, indexSid) {
                                    if (result[sid]) {
                                        line[2][indexSid] = sid + " (" + result[sid] + ")"
                                    } else {
                                        line[2][indexSid] = sid + " (-)"
                                    }
                                })
                            }
                        }
                    })
                    saveFiles(parsed, parsedJsonName, parsedCsvName, callback)
                }
            )
        }
    })
}

if (process.argv.length == 3) {
    var file = process.argv[2]
    fs.readFile(file, "utf8", function(err, data) {
        if (err) {
            return console.log(err)
        }
        if (!fs.existsSync("out")) {
            fs.mkdirSync("out")
        }
        if (!fs.existsSync("out/json")) {
            fs.mkdirSync("out/json")
        }
        if (!fs.existsSync("out/csv")) {
            fs.mkdirSync("out/csv")
        }
        gulp.src("template/**").pipe(gulp.dest("out/"))

        fs.readdir("scheme/", function(err, items) {
            async.forEach(items, function(item, next) {
                var schemeName = "../scheme/" + item
                var parsedJsonName = "out/json/parsed_" + item
                var parsedCsvName = "out/csv/parsed_" + item.replace(".json", ".csv")
                parser.parseXML(data, schemeName, function(parsed) {
                    if (item === "usersets.json") {
                        parseSids(parsed, parsedJsonName, parsedCsvName, function() {
                            next()
                        })
                    } else {
                        saveFiles(parsed, parsedJsonName, parsedCsvName, function() {
                            next()
                        })
                    }
                })
            })
        })
    })
} else {
    console.log("Usage: node index.js filename")
}
