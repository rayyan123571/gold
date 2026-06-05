import Dexie, { type EntityTable } from 'dexie'

export interface Account {
  id?: number
  username: string
  password: string
  created_at: Date
}

export interface Client {
  id?: number
  code: string
  naam: string
  phone: string
  balance_sona: number
  balance_cash: number
  created_at: Date
}

export interface NaqadEntry {
  id?: number
  date: string
  client_id: number
  row_type: 'naqad' | 'farokht' | 'khareed'
  wazan: number
  point: number
  khaalis: number
  rate: number
  qeemat: number
}

export interface UdhaarEntry {
  id?: number
  date: string
  client_id: number
  row_type: 'farokht' | 'khareed'
  wazan: number
  point: number
  khaalis: number
  rate: number
  qeemat: number
  cash_lia: number
  cash_dia: number
}

export interface RoznamchaEntry {
  id?: number
  date: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface NaqadReceipt {
  id?: number
  raseed_no: number
  date: string
  naam: string
  rate_tola: number
  rate_gram: number
  wazan: number
  khaalis: number
  qeemat: number
  raqam_li: number
  type: 'buy' | 'sell'
}

export interface UdhaarReceipt {
  id?: number
  raseed_no: number
  date: string
  naam: string
  rate_tola: number
  rate_gram: number
  sona_dia: number
  sona_lia: number
  baqi: number
  sabqa_sona: number
  cash_dia: number
  cash_lia: number
  baqi_cash: number
  sabqa_cash: number
}

export interface LaabReceipt {
  id?: number
  raseed_no: number
  date: string
  time: string
  naam: string
  amad_wazan: number
  milawat_wazan: number
  khaalis_wazan: number
  milawat_fi_tola: number
  milawat_fi_gram: number
  caret: number
  rate_fi_tola: number
  total: number
  charges: number
  baqaya: number
  point: number
  rati: number
}

export interface WasooliReceipt {
  id?: number
  raseed_no: number
  date_time: string
  naam: string
  rate_fi_tola: number
  parchun_wazan: number
  khaalis_wazan: number
  ujrat_ka_sona: number
  sona_dena_ha: number
  cash_dia: number
  cash_ka_sona: number
  ujrat_leni_ha: number
  khaalis_sona_dia: number
  ujrat_wasool: number
  discount: number
  baqi: number
}

export interface ShopTotal {
  id?: number
  cash: number
  tezabi_sona: number
  parchun: number
  piece: number
}

export class GoldDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  clients!: EntityTable<Client, 'id'>
  naqad_entries!: EntityTable<NaqadEntry, 'id'>
  udhaar_entries!: EntityTable<UdhaarEntry, 'id'>
  roznamcha!: EntityTable<RoznamchaEntry, 'id'>
  naqad_receipts!: EntityTable<NaqadReceipt, 'id'>
  udhaar_receipts!: EntityTable<UdhaarReceipt, 'id'>
  laab_receipts!: EntityTable<LaabReceipt, 'id'>
  wasooli_receipts!: EntityTable<WasooliReceipt, 'id'>
  shop_totals!: EntityTable<ShopTotal, 'id'>

  constructor() {
    super('goldLedger')
    this.version(1).stores({
      accounts: '++id, username',
      clients: '++id, code, naam, phone',
      naqad_entries: '++id, date, client_id',
      udhaar_entries: '++id, date, client_id',
      roznamcha: '++id, date',
    })
    this.version(2).stores({
      accounts: '++id, username',
      clients: '++id, code, naam, phone',
      naqad_entries: '++id, date, client_id',
      udhaar_entries: '++id, date, client_id',
      roznamcha: '++id, date',
      naqad_receipts: '++id, raseed_no, date',
      udhaar_receipts: '++id, raseed_no, date',
      laab_receipts: '++id, raseed_no, date',
      wasooli_receipts: '++id, raseed_no, date',
      shop_totals: '++id',
    })
    this.version(3).stores({
      accounts: '++id, username',
      clients: '++id, code, naam, phone',
      naqad_entries: '++id, date, client_id, [client_id+date]',
      udhaar_entries: '++id, date, client_id, [client_id+date]',
      roznamcha: '++id, date',
      naqad_receipts: '++id, raseed_no, date',
      udhaar_receipts: '++id, raseed_no, date',
      laab_receipts: '++id, raseed_no, date',
      wasooli_receipts: '++id, raseed_no, date',
      shop_totals: '++id',
    })
  }
}

export const db = new GoldDB()
