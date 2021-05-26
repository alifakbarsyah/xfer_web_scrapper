'use strict'

module.exports = (app) => {
    const testingController = app.controller('testing')
    const authHelper = loadHelper('auth')

    let aRoutes = [
        {method: 'get', route: '/all', inits: [authHelper.authLogin], middlewares: [testingController.getAll], customcode: 'testing_customcode'},
        {method: 'get', route: '/:test_id', inits: [authHelper.authLogin], middlewares: [testingController.getDetail]},
        {method: 'get', route: '/', inits: [authHelper.authYes], middlewares: [testingController.getPaging]},
        {method: 'post', route: '/', inits: [authHelper.authYes], middlewares: [testingController.create]},
        {method: 'put', route: '/:test_id', inits: [authHelper.authYes], middlewares: [testingController.update]},
        {method: 'delete', route: '/:test_id', inits: [authHelper.authYes], middlewares: [testingController.delete]}
    ]
    return aRoutes
}