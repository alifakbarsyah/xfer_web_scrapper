'use strict'

module.exports = (app) => {
    const apiController = app.controller('api')

    let aRoutes = [
        {method: 'get', route: '/indexing/', inits: [], middlewares: [apiController.Indexing]},
        {method: 'get', route: '/kurs', inits: [], middlewares: [apiController.GetAllKursByDate]},
        {method: 'get', route: '/kurs/:symbol', inits: [], middlewares: [apiController.GetAllKursBySymbolAndDate]},
        {method: 'delete', route: '/kurs/:date', inits: [], middlewares: [apiController.DeleteKurs]},
        {method: 'post', route: '/kurs', inits: [], middlewares: [apiController.AddKurs]},
        {method: 'put', route: '/kurs', inits: [], middlewares: [apiController.EditKurs]}
        
    ]
    return aRoutes
}