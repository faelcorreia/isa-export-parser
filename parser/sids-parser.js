var ldap = require("ldapjs")

var parseSidRecursive = function(client, baseDN, sids, index, list, callback) {
    if (index < sids.length) {
        var opts = {
            filter: "objectSid=" + sids[index],
            scope: "sub",
            attributes: ["cn"]
        }
        client.search(baseDN, opts, function(err, res) {
            if (err) {
                console.log(err)
            } else {
                res.on("searchEntry", function(entry) {
                    list[sids[index]] = entry.objectName
                })
                res.on("error", function(err) {
                    console.error("error: " + err.message)
                })
                res.on('end', function(result) {
                    parseSidRecursive(client, baseDN, sids, index + 1, list, callback)
                })
            }
        })
    } else {
        client.unbind()
        callback(list)
    }
}

var parseSids = function(url, baseDN, username, password, sids, callback) {
    var ldap = require("ldapjs");
    var client = ldap.createClient({
        url: url
    })

    client.bind(username, password, function(err) {
        if (err) {
            console.log(err)
            client.unbind()
            return
        } else {
            parseSidRecursive(client, baseDN, sids, 0, {}, callback)
        }
    })
}

module.exports = {
    parseSids: parseSids
}
