var $e2xbx$fs = require("fs");

var $38536c0f7bfe5de3$exports = {};
function $38536c0f7bfe5de3$var$convertString(str) {
    if (!str) return undefined;
    let numValid = /^[0-9.-]*$/.test(str);
    if (!str.includes(".") && numValid) {
        const intVal = parseInt(str);
        if (!isNaN(intVal)) return intVal;
    }
    if (str.includes(",") && str.startsWith("(") && str.endsWith(")")) {
        let split = str.slice(1, -1).split(",");
        if (split.length == 3) {
            let splitParsed = [];
            split.forEach((spl)=>{
                splitParsed.push(parseFloat(spl));
            });
            return {
                x: splitParsed[0],
                y: splitParsed[1],
                z: splitParsed[2]
            };
        }
    }
    const floatVal = parseFloat(str);
    if (!isNaN(floatVal) && numValid) return floatVal;
    const lowerCaseString = str.toLowerCase();
    if (lowerCaseString === "true") return true;
    else if (lowerCaseString === "false") return false;
    return str;
}
function $38536c0f7bfe5de3$var$main(data) {
    let converted = {};
    let cur = "";
    let mode = {
        name: "IDLE",
        data: {}
    };
    let classRecord = {
        "_parent": "__GAME__"
    };
    function getCur() {
        if (!cur) return converted;
        const pathArray = cur.split(".");
        let value = converted;
        for (const key of pathArray)if (value && typeof value === "object" && key in value) value = value[key];
        else {
            value = undefined;
            break;
        }
        return value;
    }
    function addCur(part) {
        if (!cur) {
            cur = part;
            return cur;
        }
        cur = `${cur}.${part}`;
    }
    function delCur() {
        const parts = cur.split(".");
        if (parts.length <= 1) return "";
        else {
            parts.pop();
            let join = parts.join(".");
            cur = join;
            return cur;
        }
    }
    for (let line of data.split("\n")){
        if (!line) return;
        if (line.includes("{")) {
            if (mode.name != "DECLARING") throw new SyntaxError("Inappropriate opening bracket");
            mode.name = "IDLE";
        }
        if (line.includes("}")) {
            if (mode.name != "IDLE") throw new SyntaxError("Inappropriate closing bracket");
            if (cur["_parent"] == "__GAME__") break;
            delCur();
        }
        if (line.includes("=")) {
            if (mode.name != "IDLE") throw new SyntaxError("Unexpected value declaration");
            let split = line.split("=");
            let key = split[0].trim();
            let vals = [];
            let valsFinal = [];
            split[1].trim().split(";").forEach((val)=>{
                vals.push($38536c0f7bfe5de3$var$convertString(val));
            });
            vals.forEach((val)=>{
                if (val === undefined) return;
                valsFinal.push(val);
            });
            if (valsFinal.length == 1) valsFinal = valsFinal[0];
            if (key == "seed" && cur == "_class_VTMapCustom_0") valsFinal = split[1].trim();
            getCur()[key] = valsFinal;
        }
        if (!line.includes("=") && !line.includes("}") && !line.includes("{")) {
            if (mode.name != "IDLE") throw new SyntaxError("Unexpected class declaration");
            let className = line.trim();
            mode.name = "DECLARING";
            mode.data = {
                className: className
            };
            if (!classRecord[className]) classRecord[className] = 0;
            let classAmount = classRecord[className]++;
            let format = `_class_${className}_${classAmount}`;
            getCur()[format] = {};
            addCur(format);
        }
    }
    return converted;
}
$38536c0f7bfe5de3$exports = $38536c0f7bfe5de3$var$main;


var $fa4030c1c350eb00$exports = {};
let $fa4030c1c350eb00$var$requiredKeys = {
    CustomScenario: {
        campaignID: ""
    }
};
function $fa4030c1c350eb00$var$main(json) {
    let converted = "";
    let tabLevel = 0;
    let type;
    function tab() {
        let ret = "";
        for(let i = 0; i < tabLevel; i++)ret = ret + "	";
        return ret;
    }
    function newLine() {
        converted = converted + `\n${tab()}`;
    }
    function beginClass(className) {
        className = className.split("_")[2];
        if (converted != "") newLine();
        converted = converted + className;
        newLine();
        converted = converted + "{";
        tabLevel++;
        return className;
    }
    function endClass() {
        tabLevel = tabLevel - 1;
        newLine();
        converted = converted + "}";
    }
    function insertVal(key, val) {
        newLine();
        let final = "";
        if (Array.isArray(val)) val.forEach((arrVal)=>{
            final = `${final}${convertVal(arrVal)};`;
        });
        else final = convertVal(val);
        converted = `${converted}${key} = ${final}`;
    }
    function convertVal(val) {
        let v3Conv = vector3ToText(val);
        if (v3Conv !== false) return v3Conv;
        if (val === false) return "False";
        if (val === true) return "True";
        return String(val);
    }
    function vector3ToText(val) {
        if (typeof val != "object" || !val.x || !val.y || !val.z) return false;
        return `(${val.x}, ${val.y}, ${val.z})`;
    }
    function applyDefaults(object, className) {
        let requirements = $fa4030c1c350eb00$var$requiredKeys[className];
        if (requirements) {
            for (let [key, value] of Object.entries(requirements))if (!object[key]) {
                let assignment = {};
                assignment[key] = value;
                Object.assign(assignment, object);
            }
        }
        return object;
    }
    function search(object) {
        for (let [key, value] of Object.entries(object)){
            if (key.startsWith("_class")) {
                value = applyDefaults(value, beginClass(key));
                search(value);
                endClass();
                continue;
            }
            insertVal(key, value);
        }
    }
    search(json);
    let firstClass = Object.entries(json)[0][0].split("_");
    if (firstClass.length != 4) throw Error("Invalid JSON: First class could not be identified");
    switch(firstClass[2]){
        case "CustomScenario":
            type = "vts";
            break;
        case "VTMapCustom":
            type = "vtm";
            break;
        case "CAMPAIGN":
            type = "vtc";
            break;
        case "VTCustomLivery":
            type = "vtl";
            break;
        default:
            break;
    }
    return {
        data: converted,
        type: type
    };
}
$fa4030c1c350eb00$exports = $fa4030c1c350eb00$var$main;



function $e9d7250d0a884f83$var$toJSON(path, callback) {
    try {
        let converted = $38536c0f7bfe5de3$exports($e2xbx$fs.readFileSync(path, "utf-8"));
        if (callback) callback(converted);
        return converted;
    } catch (err) {
        console.error(err);
    }
}
function $e9d7250d0a884f83$var$fromJSON(path, completed) {
    try {
        let json = $e2xbx$fs.readFileSync(path);
        json = JSON.parse(json);
        completed($fa4030c1c350eb00$exports(json));
    } catch (err) {
        console.error(err);
    }
}
module.exports = {
    toJSON: $e9d7250d0a884f83$var$toJSON,
    fromJSON: $e9d7250d0a884f83$var$fromJSON
};


//# sourceMappingURL=index.js.map
