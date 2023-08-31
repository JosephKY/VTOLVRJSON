let nodeToJson = require("./interpreter/nodeToJson")
let jsonToNode = require("./interpreter/jsonToNode")

function toJSON(strNodeData, callback){
    try {
        let converted = nodeToJson(strNodeData)
        if(callback){
            callback(converted)
        }
        return converted
    } catch(err){
        console.error(err)
    }
}

function fromJSON(objJSON, callback){
    try {
        let converted = jsonToNode(objJSON);
        if(callback){
            callback(converted)
        }
        return converted 
    } catch(err){
        console.error(err)
    }
}

module.exports = { toJSON, fromJSON }