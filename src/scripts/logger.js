class logger{
    static getPrefix(){
        let time = new Date().toLocaleTimeString();
        let stack = new Error().stack;
        return "[YT_Short_Enhancer] " + time + " " + stack.split("\n")[3].trim().replace("at ","") + " - ";
    }
    static log(message){
        console.log(logger.getPrefix() + message);
    }
    static warn(message){
        console.warn(logger.getPrefix() + message);
    }
    static error(message){
        console.error(logger.getPrefix() + message);
    }
}