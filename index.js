let nodeToJson = require("./nodeToJson")
let jsonToNode = require("./jsonToNode")

export function toJSON(strNodeData, callback){
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

export function fromJSON(objJSON, callback){
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