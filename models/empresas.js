const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const SchemaEmpresa = new Schema({
    codempresa: {type:String, unique:true},
     nombre: String,
});

module.exports = mongoose.model('empresa',SchemaEmpresa);