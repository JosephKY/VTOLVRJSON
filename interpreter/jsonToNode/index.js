let requiredKeys = {
    CustomScenario: {
        campaignID: ""
    }
}

function main(json){
    let converted = "";
    let tabLevel = 0
    let type
    
    function tab(){
        let ret = ""
        for(let i = 0; i < tabLevel; i++){
            ret = ret + "\t"
        }
        return ret
    }

    function newLine(){
        converted = converted + `\n${tab()}`
    }

    function beginClass(className){
        className = (className.split("_"))[2]
        if(converted != ""){
            newLine()
        }
        converted = converted + className;
        newLine();
        converted = converted + "{";
        tabLevel++;
        
        return className
    }

    function endClass(){
        tabLevel = tabLevel - 1;
        newLine();
        converted = converted + "}"
    }
    
    function insertVal(key, val){
        newLine();
        let final = "";
        if(Array.isArray(val)){
            val.forEach(arrVal=>{
                final = `${final}${convertVal(arrVal)};`
            })
        } else {
            final = convertVal(val)
        }
        
        converted = `${converted}${key} = ${final}`
    }

    function convertVal(val){
        let v3Conv = vector3ToText(val)
        if(v3Conv !== false)return v3Conv

        let v2Conv = vector2ToText(val)
        if(v2Conv !== false)return v2Conv

        if(val === false)return "False"
        if(val === true)return "True"
        if(val === undefined)return "";

        return String(val)
    }

    function vector3ToText(val){
        if(typeof(val) != 'object' || val.x === undefined || val.y === undefined || val.z === undefined)return false
        return `(${val.x}, ${val.y}, ${val.z})`;
    }

    function vector2ToText(val){
        if(typeof(val) != 'object' || val.x === undefined || val.y === undefined)return false
        return `(${val.x}, ${val.y})`;
    }

    function applyDefaults(object, className){
        let requirements = requiredKeys[className]
        if(requirements){
            for(let [key, value] of Object.entries(requirements)){
                if(!object[key]){
                    let assignment = {}
                    assignment[key] = value
                    Object.assign(assignment, object)
                }
            }
        }
        
        return object
    }

    function search(object){
        for(let [key, value] of Object.entries(object)){
            if(key.startsWith("_class")){
                value = applyDefaults(value, beginClass(key))
                search(value)
                endClass()
                continue;
            }
            insertVal(key, value)
        }
    }

    search(json)

    let firstClass = (Object.entries(json)[0][0]).split("_");
    if(firstClass.length != 4){
        throw Error("Invalid JSON: First class could not be identified")
    }
    switch (firstClass[2]) {
        case "CustomScenario":
            type = "vts"
            break;
        case "VTMapCustom":
            type = "vtm"
            break;
        case "CAMPAIGN":
            type = "vtc"
            break;
        case "VTCustomLivery":
            type = "vtl"
            break;
        default:
            break;
    }

    return {
        data: converted,
        type: type
    }
}

module.exports = main