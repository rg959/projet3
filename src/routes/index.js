const routes = require('express').Router(), 
accountRouter = require('./account'),
historyRouter = require('./history'),
mapRouter = require('./map')

routes.use('/api/UBER-EEDSI/account', accountRouter);
routes.use('/api/UBER-EEDSI/history', historyRouter);
routes.use('/api/UBER-EEDSI/map', mapRouter);

module.exports = routes;