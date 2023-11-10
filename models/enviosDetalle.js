const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const SchemaEnvioDetalle = new Schema({
  CodEnvioEncabezado: String,
  Codproducto: String,
  cantidad: Number
});

module.exports = mongoose.model('enviosDetalles',SchemaEnvioDetalle);