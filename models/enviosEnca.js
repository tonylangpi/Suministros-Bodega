const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const SchemaEnvioEncabezado = new Schema({
  CodEnvioEncabezado: {type:String, unique:true},
  codempresa: String,
  fechaingreso: Date,
  fechaentrega: Date
});

module.exports = mongoose.model('enviosencabezados',SchemaEnvioEncabezado);