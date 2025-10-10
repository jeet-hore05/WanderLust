class ExpressError extends Error{
    constructor(statusode,message){
        super();
        this.statusode = statusode;
        this.message = message;
    }
}

module.exports = ExpressError;