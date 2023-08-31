let nodeToJson = require("./nodeToJson")
let jsonToNode = require("./jsonToNode")

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

function fromJSON(objJSONData, callback){
    try {
        let converted = jsonToNode(objJSONData)
        if(callback){
            callback(converted)
        }
        return converted
    } catch(err){
        console.error(err)
    }
}

let VTOLVRJSONUtility = { toJSON, fromJSON };
export default VTOLVRJSONUtility;