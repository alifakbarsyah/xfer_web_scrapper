'use strict';

module.exports = (app, router) => {
    const mainController = app.controller('main');

    router.use('/Api' + '/', app.route('api'));
    router.get('/', mainController.index);
};