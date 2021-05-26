'use strict'
let obj = (objDB, db, rootpath) => {
    const tbl = require(rootpath + '/config/tables.json')
    const cst = require(rootpath + '/config/const.json')
    const config = require(rootpath + "/config/config.json")
    const fn = {}
    let moment = require('moment')
    const crypto = require('crypto')

    // BEGIN GENERIC STATUS
    fn.getKursBySymbolDate = async (Date,Symbol) => {
        let sql =
            "SELECT id " +
            " FROM " + tbl.Kurs + " " +
            " WHERE CreatedDate = ? AND Symbol = ? LIMIT 1 " 

        let [rows] = await db.query(sql, [Date,Symbol])
        return rows
    }

    fn.getKursByDate = async (Date) => {
        let sql =
            "SELECT id " +
            " FROM " + tbl.Kurs + " " +
            " WHERE CreatedDate = ? " 

        let [rows] = await db.query(sql, [Date])
        return rows
    }

    fn.getKurs = async (id) => {
        let sql =
            " SELECT id, Symbol, ERateJual, ERateBeli, TTCounterJual, TTCounterBeli, BankNotesJual, BankNotesBeli, CreatedDate" +
            " FROM " + tbl.Kurs + " " +
            " WHERE id = ? " +
            " LIMIT 1"

        let [rows] = await db.query(sql, [id])
        return rows
    }

    fn.insertKurs = async (data) => {
        let res = await objDB.insert(db, tbl.Kurs, data)
        return res.insertId
    }

    fn.updateKurs = async (symbol,date, data) => {
        let where = {'cond': 'Symbol = ? AND CreatedDate = ? ', 'bind': [symbol,date]}
        let res = await objDB.update(db, tbl.Kurs, where, data)
        return res.insertId
    }

    fn.deleteKurs = async (date) => {
        let where = {"cond": "CreatedDate = ?", "bind": [date]}
        return await objDB.delete(db, tbl.Kurs, where)
    }

    fn.getAllKurs = async (where = '', data = [], order_what = " CreatedDate ", order_by = " ASC ", limit = 0) => {
        let sql = "SELECT id, Symbol, ERateJual, ERateBeli, TTCounterJual, TTCounterBeli, BankNotesJual, BankNotesBeli, CreatedDate" +
                  " FROM " + tbl.Kurs + 
                  " WHERE 1=1 " + where + " ORDER BY " + order_what + " " + order_by

        let result = await objDB.getAll(db, sql, data, limit)
        return result
    }

    
    return fn
}

module.exports = obj
