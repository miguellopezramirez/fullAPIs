const mongoose = require('mongoose');

const DetailRowRegSchema = new mongoose.Schema({
  CURRENT: { type: Boolean, required: true },
  REGDATE: { type: Date, required: true },
  REGTIME: { type: Date, required: true },
  REGUSER: { type: String, required: true }
}, { _id: false });

const DetailRowSchema = new mongoose.Schema({
  ACTIVED: { type: Boolean, required: true },
  DELETED: { type: Boolean, required: true },
  DETAIL_ROW_REG: { type: [DetailRowRegSchema], required: true }
}, { _id: false });

const SignalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  price: { type: Number, required: true },
  reasoning: { type: String } // Puede ser opcional si aún no se define siempre
}, { _id: false });

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true, enum: ['buy', 'sell'] },
  price: { type: Number, required: true },
  reasoning: { type: String, required: true },
  shares: { type: Number }, // Opcional (compra)
  proceeds: { type: Number }, // Opcional (venta)
  stopLoss: { type: Number }, // Opcional
  takeProfit: { type: Number }, // Opcional
  isStopLoss: { type: Boolean }, // Opcional
  isFinal: { type: Boolean } // Opcional
}, { _id: false });

const ChartDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
  short_ma: { type: Number, required: true },
  long_ma: { type: Number, required: true }
}, { _id: false });

const SimulationSchema = new mongoose.Schema({
  idSimulation: { type: String, required: true, unique: true },
  idUser: { type: String, required: true },
  idStrategy: { type: String, required: true },
  simulationName: { type: String, required: true },
  symbol: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amount: { type: Number, required: true }, // USD
  signals: { type: [SignalSchema], default: [] },
  transactions: { type: [TransactionSchema], default: [] },
  chart_data: { type: [ChartDataSchema], default: [] }, 
  specs: { type: String },
  result: { type: Number },
  percentageReturn: { type: Number },
  DETAIL_ROW: { type: [DetailRowSchema], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('ZTSIMULATION', SimulationSchema, 'ZTSIMULATION');
