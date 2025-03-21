const errorHandler = async (err, req, res, next) => {
    console.log(err.stack);

    if(err.name === "UnauthorizedError"){
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access"
        });
    }

    if(res.statusCode){
        return res.status(res.statusCode).send({
            error: true,
            msg: err.message
        });
    }

    res.status(500).json({
        error: true,
        msg: "Something went wrong"
    });
}

module.exports = errorHandler;