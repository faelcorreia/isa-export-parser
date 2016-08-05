var fs = require('fs')
var parser = require('./parser/parser.js')
var gulp = require('gulp')

if (process.argv.length == 3) {
    var file = process.argv[2]
    fs.readFile(file, 'utf8', function(err, data) {
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

        var outs = [{
            scheme: "addressranges",
        }, {
            scheme: "computers"
        }, {
            scheme: "computersets"
        }, {
            scheme: "domainnamesets"
        }, {
            scheme: "enterprisenetworks"
        }, {
            scheme: "networksets"
        }, {
            scheme: "policies"
        }, {
            scheme: "protocols"
        }, {
            scheme: "proxyscheduletemplates"
        }, {
            scheme: "urlsets"
        }, {
            scheme: "usersets"
        }]

        outs.forEach(function(out) {
            parser.parseXML(data, out.scheme + ".json", function(parsed) {
                fs.writeFile("out/json/parsed_" + out.scheme + ".json", JSON.stringify(parsed.json, null, 2), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("out/json/parsed_" + out.scheme + ".json saved.");
                })

                fs.writeFile("out/csv/parsed_" + out.scheme + ".csv", parsed.csv, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("out/csv/parsed_" + out.scheme + ".csv saved.");
                })
            })
        })
    })
} else {
    console.log('Usage: node index.js filename')
}
