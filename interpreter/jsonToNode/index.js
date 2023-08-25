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
        newLine()
        if(Array.isArray(val)){
            val = arrConvert(val)
        }
        if(val === false){
            val = "False"
        }
        if(val === true){
            val = "True"
        }
        val = String(val)
        
        converted = `${converted}${key} = ${val}`
    }

    function arrConvert(arr){
        let conv = "("
        arr.forEach(val=>{
            if(conv == "("){
                conv = `(${val}`
                return
            }
            conv = `${conv}, ${val}`
        })
        return `${conv})`
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