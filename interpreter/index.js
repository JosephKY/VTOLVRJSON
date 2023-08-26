let nodeToJson = require("./nodeToJson")
let jsonToNode = require("./jsonToNode")
let fs = require("fs")

function toJSON(path, callback){
    try {
        let converted = nodeToJson(fs.readFileSync(path, 'utf-8'))
        if(callback){
            callback(converted)
        }
        return converted
    } catch(err){
        console.error(err)
    }
}

function fromJSON(path, completed){
    try {
        let json = fs.readFileSync(path)
        json = JSON.parse(json)
        completed(jsonToNode(json)) 
    } catch(err){
        console.error(err)
    }
}

module.exports = { toJSON, fromJSON }