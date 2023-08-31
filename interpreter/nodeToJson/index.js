function convertString(str) {
    if(!str){
        return undefined
    }

    let numValid = /^[0-9.-]*$/.test(str)

    if (!str.includes('.') && numValid) {
        const intVal = parseInt(str);
        if (!isNaN(intVal)) {
            return intVal;
        }
    }

    if(str.includes(",") && str.startsWith("(") && str.endsWith(")")){
        let split = (str.slice(1, -1)).split(",")
        if(split.length == 3){
            let splitParsed = [];
            split.forEach(spl=>{
                splitParsed.push(parseFloat(spl))
            })
            return {
                x: splitParsed[0],
                y: splitParsed[1],
                z: splitParsed[2]
            }
        }
    }

    const floatVal = parseFloat(str);
    if (!isNaN(floatVal) && numValid) {
        return floatVal;
    }

    const lowerCaseString = str.toLowerCase();
    if (lowerCaseString === 'true') {
        return true;
    } else if (lowerCaseString === 'false') {
        return false;
    }

    return str;
}

function main(data) {
    let converted = {}
    let cur = ""
    let mode = {
        name: "IDLE",
        data: {}
    }
    let classRecord = {
        "_parent": "__GAME__"
    }

    function getCur() {
        if (!cur) {
            return converted;
        }

        const pathArray = cur.split('.');
        let value = converted;
  
        for (const key of pathArray) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            value = undefined;
            break;
        }
        }
  
        return value;
    }

    function addCur(part) {
        if (!cur) {
            cur = part
            return cur
        }
        cur = `${cur}.${part}`
    }

    function delCur() {
        const parts = cur.split('.');
        if (parts.length <= 1) {
            return "";
        } else {
            parts.pop();
            let join = parts.join('.');
            cur = join;
            return cur;
        }
    }

    for(let line of data.split("\n")){
        if(!line){
            return
        }

        if (line.includes("{")) {
            if (mode.name != "DECLARING") {
                throw new SyntaxError("Inappropriate opening bracket")
            }
            mode.name = "IDLE"
        }

        if (line.includes("}")) {
            if (mode.name != "IDLE") {
                throw new SyntaxError("Inappropriate closing bracket")
            }

            if (cur["_parent"] == "__GAME__") {
                break;
            }

            delCur()
        }

        if (line.includes("=")) {
            if (mode.name != "IDLE") {
                throw new SyntaxError("Unexpected value declaration")
            }

            let split = line.split("=")
            let key = split[0].trim()
            let vals = []
            let valsFinal = []
            split[1].trim().split(";").forEach(val=>{
                vals.push(convertString(val))
            })
            vals.forEach(val=>{
                if(val === undefined)return;
                valsFinal.push(val)
            })
            if(valsFinal.length == 1){
                valsFinal = valsFinal[0]
            }

            if(key == "seed" && cur == "_class_VTMapCustom_0"){
                valsFinal = split[1].trim()
            }

            getCur()[key] = valsFinal
        }

        if (!line.includes("=") && !line.includes("}") && !line.includes("{")) {
            if (mode.name != "IDLE") {
                throw new SyntaxError("Unexpected class declaration")
            }

            let className = line.trim()
            mode.name = "DECLARING"
            mode.data = {
                className: className
            }

            if (!classRecord[className]) {
                classRecord[className] = 0
            }
            let classAmount = classRecord[className]++
            let format = `_class_${className}_${classAmount}`

            getCur()[format] = {}
            addCur(format)
        }
    }
    
    return converted
}

module.exports = main