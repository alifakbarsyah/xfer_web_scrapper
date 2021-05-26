"use strict"

let obj = (rootpath) => {
    const fn = {}
    const cst = require(rootpath + '/config/const.json')
    const config = require(rootpath + "/config/config.json")
    const moment = require('moment')
    const cheerio = require('cheerio');
    const request = require('request-promise');
    const validator = require('validator')
    const now = moment().format('YYYY-MM-DD')

    fn.PriceToNumber = async (price) => {
        if(!price){return 0;}
        price=price.split('.').join('');
        price=price.split(',').join('.');
        return Number(price.replace(/[^0-9.]/g, ""));
    }

    fn.Indexing = async (req, res, next) => {
        try{
            const url = 'https://www.bca.co.id/id/informasi/kurs';
            const result = await request.get(url);
            const $ = cheerio.load(result);
            const scrapedData = [];
            $("#scrolling-table > table > tbody > tr").each((index, element) => {
                if (index < 0) return true;
                const tds = $(element).find("td");
                const symbol = $(tds[0]).text().toString().replace(/\t|\n/g, '');
                const e_rate_jual = $(tds[1]).text().replace(/\t|\n/g, '');
                const e_rate_beli = $(tds[2]).text().replace(/\t|\n/g, '');
                const tt_counter_jual = $(tds[3]).text().replace(/\t|\n/g, '');
                const tt_counter_beli = $(tds[4]).text().replace(/\t|\n/g, '');
                const bank_notes_jual = $(tds[5]).text().replace(/\t|\n/g, '');
                const bank_notes_beli = $(tds[6]).text().replace(/\t|\n/g, '');
                const tableRow = { symbol, e_rate_jual, e_rate_beli, tt_counter_jual, tt_counter_beli, bank_notes_jual, bank_notes_beli};
                scrapedData.push(tableRow);
            });

            for (let i = 0; i < scrapedData.length; i++) {
                let dataSrapping = {
                    "Symbol" : scrapedData[i].symbol,
                    "ERateJual" : await fn.PriceToNumber(scrapedData[i].e_rate_jual),
                    "ERateBeli" : await fn.PriceToNumber(scrapedData[i].e_rate_beli),
                    "TTCounterJual" : await fn.PriceToNumber(scrapedData[i].tt_counter_jual),//14.192,00
                    "TTCounterBeli" : await fn.PriceToNumber(scrapedData[i].tt_counter_beli),
                    "BankNotesJual" : await fn.PriceToNumber(scrapedData[i].bank_notes_jual),
                    "BankNotesBeli" : await fn.PriceToNumber(scrapedData[i].bank_notes_beli),
                    "CreatedDate" : now
                }
                let validateDateKurs = await req.model('api').getKursBySymbolDate(dataSrapping.CreatedDate, dataSrapping.Symbol)
                if (!validateDateKurs){
                    await req.model('api').insertKurs(dataSrapping)
                }
            }
            let response = getMessage('success')
            res.success(response)

        }catch(e) {next(e)}
    }

    fn.GetAllKursByDate = async (req, res, next) => {
        try{
            let start_date = req.query.startdate || ""
            let end_date = req.query.enddate || now
            let validate_date = moment(start_date, 'YYYY-MM-DD', true).isValid()

            //validate input
            if(validator.isEmpty(start_date)) {
                res.custom('api004',0,"en")
            }

            // required date
            if(validate_date == false) {
                res.custom('api005',0,"en")
            }

            let data = [start_date,end_date]
            let where = ' AND CreatedDate BETWEEN ? AND ? '
            let kursData = await req.model('api').getAllKurs(
                where,
                data
            )
            // if generic status not found, throw error
            if(isEmpty(kursData)) {
                res.custom('api003',0,"en")
            }

            let kursDataResult = []
            for (let i = 0; i < kursData.length; i++) {
                let dataSrapping = {
                    "symbol" : kursData[i].symbol,
                    "e_rate" : {
                            "jual": kursData[i].eRateJual,
                            "beli": kursData[i].eRateBeli
                    },
                    "tt_counter" : {
                        "jual": kursData[i].ttCounterJual,
                        "beli": kursData[i].ttCounterBeli
                    },
                    "bank_notes" : {
                        "jual": kursData[i].bankNotesJual,
                        "beli": kursData[i].bankNotesBeli
                    },
                    "date": kursData[i].createdDate
                }
                kursDataResult.push(dataSrapping);
            }

            let result = kursDataResult

            res.success(result)

        }catch(e) {next(e)}
    }

    fn.GetAllKursBySymbolAndDate = async (req, res, next) => {
        try{
            let symbol = req.params.symbol || ""
            let start_date = req.query.startdate || ""
            let end_date = req.query.enddate || now
            let validate_date = moment(start_date, 'YYYY-MM-DD', true).isValid()

            //validate input
            if(validator.isEmpty(symbol)) {
                res.custom('api006',0,"en")
            }

            if(validator.isEmpty(start_date)) {
                res.custom('api004',0,"en")
            }

            // required date
            if(validate_date == false) {
                res.custom('api005',0,"en")
            }

            let data = [symbol,start_date,end_date]
            let where = ' AND Symbol = ? AND CreatedDate BETWEEN ? AND ? '
            let kursData = await req.model('api').getAllKurs(
                where,
                data
            )
            // if generic status not found, throw error
            if(isEmpty(kursData)) {
                res.custom('api003',0,"en")
            }

            let kursDataResult = []
            for (let i = 0; i < kursData.length; i++) {
                let dataSrapping = {
                    "symbol" : kursData[i].symbol,
                    "e_rate" : {
                            "jual": kursData[i].eRateJual,
                            "beli": kursData[i].eRateBeli
                    },
                    "tt_counter" : {
                        "jual": kursData[i].ttCounterJual,
                        "beli": kursData[i].ttCounterBeli
                    },
                    "bank_notes" : {
                        "jual": kursData[i].bankNotesJual,
                        "beli": kursData[i].bankNotesBeli
                    },
                    "date": kursData[i].createdDate
                }
                kursDataResult.push(dataSrapping);
            }

            let result = kursDataResult

            res.success(result)

        }catch(e) {next(e)}
    }

    fn.AddKurs = async (req, res, next) => {
        try{
            let input = req.body || {}
            let id_insert 
            //validate input
            if(isEmpty(input)) {
                res.custom('api007',0,"en")
            }

            if(isEmpty(input.symbol)) {
                res.custom('api008',0,"en")
            }
            
            if(!(input.e_rate.jual)) {
                res.custom('api009',0,"en")
            }
            
            if(!(input.e_rate.beli)) {
                res.custom('api010',0,"en")
            }

            if(!(input.tt_counter.jual)) {
                res.custom('api011',0,"en")
            }
            
            if(!(input.tt_counter.beli)) {
                res.custom('api012',0,"en")
            }

            if(!(input.bank_notes.jual)) {
                res.custom('api013',0,"en")
            }

            if(!(input.bank_notes.beli)) {
                res.custom('api014',0,"en")
            }

            if(isEmpty(input.date)) {
                res.custom('api002',0,"en")
            }

            let validate_date = moment(input.date, 'YYYY-MM-DD', true).isValid()
            // required date
            if(validate_date == false) {
                res.custom('api005',0,"en")
            }

            let validateDateKurs = await req.model('api').getKursBySymbolDate(input.date, input.symbol)
            if (!validateDateKurs){
                let dataInput = {
                    "Symbol" : input.symbol,
                    "ERateJual" : input.e_rate.jual,
                    "ERateBeli" : input.e_rate.beli,
                    "TTCounterJual" : input.tt_counter.jual,
                    "TTCounterBeli" : input.tt_counter.beli,
                    "BankNotesJual" : input.bank_notes.jual,
                    "BankNotesBeli" : input.bank_notes.beli,
                    "CreatedDate" : input.date
                }
                id_insert =  await req.model('api').insertKurs(dataInput)

                let resultqueryquery = await req.model('api').getKurs(id_insert)
                let dataKurs = {
                    "symbol" : resultqueryquery.Symbol,
                    "e_rate" : {
                        "jual": resultqueryquery.ERateJual,
                        "beli": resultqueryquery.ERateBeli
                    },
                    "tt_counter" : {
                        "jual": resultqueryquery.TTCounterJual,
                        "beli": resultqueryquery.TTCounterBeli
                    },
                    "bank_notes" : {
                        "jual": resultqueryquery.BankNotesJual,
                        "beli": resultqueryquery.BankNotesBeli
                    },
                    "date": resultqueryquery.CreatedDate
                }

                res.success(dataKurs)
                
            } else {
                res.custom('api015',0,"en")
            }

        }catch(e) {next(e)}
    }

    fn.EditKurs = async (req, res, next) => {
        try{
            let input = req.body || {}
            //validate input
            if(isEmpty(input)) {
                res.custom('api007',0,"en")
            }

            if(isEmpty(input.symbol)) {
                res.custom('api008',0,"en")
            }
            
            if(!(input.e_rate.jual)) {
                res.custom('api009',0,"en")
            }
            
            if(!(input.e_rate.beli)) {
                res.custom('api010',0,"en")
            }

            if(!(input.tt_counter.jual)) {
                res.custom('api011',0,"en")
            }
            
            if(!(input.tt_counter.beli)) {
                res.custom('api012',0,"en")
            }

            if(!(input.bank_notes.jual)) {
                res.custom('api013',0,"en")
            }

            if(!(input.bank_notes.beli)) {
                res.custom('api014',0,"en")
            }

            if(isEmpty(input.date)) {
                res.custom('api002',0,"en")
            }

            let validate_date = moment(input.date, 'YYYY-MM-DD', true).isValid()
            // required date
            if(validate_date == false) {
                res.custom('api005',0,"en")
            }

            let validateDateKurs = await req.model('api').getKursBySymbolDate(input.date, input.symbol)
            if (validateDateKurs){
                let dataInput = {
                    "Symbol" : input.symbol,
                    "ERateJual" : input.e_rate.jual,
                    "ERateBeli" : input.e_rate.beli,
                    "TTCounterJual" : input.tt_counter.jual,
                    "TTCounterBeli" : input.tt_counter.beli,
                    "BankNotesJual" : input.bank_notes.jual,
                    "BankNotesBeli" : input.bank_notes.beli,
                    "UpdatedDate" : input.date
                }
                await req.model('api').updateKurs(input.symbol,input.date,dataInput)

                let resultqueryquery = await req.model('api').getKurs(validateDateKurs.id)
                let dataKurs = {
                    "symbol" : resultqueryquery.Symbol,
                    "e_rate" : {
                        "jual": resultqueryquery.ERateJual,
                        "beli": resultqueryquery.ERateBeli
                    },
                    "tt_counter" : {
                        "jual": resultqueryquery.TTCounterJual,
                        "beli": resultqueryquery.TTCounterBeli
                    },
                    "bank_notes" : {
                        "jual": resultqueryquery.BankNotesJual,
                        "beli": resultqueryquery.BankNotesBeli
                    },
                    "date": resultqueryquery.CreatedDate
                }

                res.success(dataKurs)
            } else {
                res.custom('api003',0,"en")
            }


        }catch(e) {next(e)}
    }

    fn.DeleteKurs = async (req, res, next) => {
        try{
            let date = req.params.date || ""
            if(validator.isEmpty(date)) {
                res.custom('api002',0,"en")
            }
            let momentObj = moment(date, 'YYYY-MM-DD');
            let date_string = momentObj.format('YYYY-MM-DD'); 

            // required date
            if(validator.isEmpty(date_string)) {
                res.custom('api002',0,"en")
            }
            
            let dataKurs = await req.model('api').getKursByDate(date_string)

            // if kurs not found, throw error
            if(isEmpty(dataKurs)) {
                res.custom('api003',0,"en")
            }
            
            //delete data
            await req.model('api').deleteKurs(date_string)

            let response = getMessage('success')
            res.success(response)

        }catch(e) {next(e)}
    }
    

    return fn
}

module.exports = obj