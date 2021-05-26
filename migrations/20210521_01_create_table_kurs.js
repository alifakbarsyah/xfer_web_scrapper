'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        // logic for transforming into the new state
        return queryInterface.createTable('Kurs',
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                Symbol: {
                    type: Sequelize.STRING(100),
                    allowNull: true
                },
                ERateJual: {
                    type: Sequelize.FLOAT(20, 2),
                    allowNull: true
                },
                ERateBeli: {
                    type: Sequelize.FLOAT(20, 2),
                    allowNull: true
                },
                TTCounterJual: {
                    type: Sequelize.FLOAT(20, 2),
                    allowNull: true
                },
                TTCounterBeli: {
                    type: Sequelize.FLOAT(20, 2),
                    allowNull: true,
                },
                BankNotesJual: {
                    type: Sequelize.FLOAT(20, 2),
                    allowNull: true,
                },
                BankNotesBeli: {
                    type: Sequelize.FLOAT(20, 2),
                    allowNull: true,
                },
                CreatedDate: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                UpdatedDate: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            }, {
                freezeTableName: true,
                engine: 'InnoDB',
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci'
            })
            .then(function () {
                return [
                    queryInterface.addIndex('Kurs', ['id']),
                    queryInterface.addIndex('Kurs', ['Symbol'])
                ]
            });
    },

    down: function (queryInterface, Sequelize) {
        // logic for reverting the changes
        return queryInterface.dropTable('Kurs');
    }
}